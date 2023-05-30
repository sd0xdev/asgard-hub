import { Injectable } from '@nestjs/common';
import { DataSourceType } from '../../../data-source-adapter/adapter/interface/data-source-type.enum';
import { BaseFeatureChatGPTService } from '../base-feature-chat-gpt.service';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { LoggerHelperService } from '@asgard-hub/nest-winston';
import { PDFChatGPTService } from '../pdf-chat-gpt/pdf-chat-gpt.service';
import { PartCreateTranscriptionResponse } from '../../interface/create.completion.response.usage.for.rpc.interface';
import { AudioAdapter } from '../../../data-source-adapter/adapter/audio-adapter';
import { splitAudioFile } from '@asgard-hub/utils';
import PromisePool from '@supercharge/promise-pool';
import { delay } from '@asgard-hub/utils';
import { DownloadFileType } from '../../../services/download-service/download-service.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { YAudioTranscriptionService } from '../../../services/y-audio-transcription/youtube-record.service';
import { YAudioTranscription } from '../../../mongo/schemas/y.audio.transcription.schema';
import { createHmac } from 'crypto';

export interface AudioChatOptions {
  url: string;
  fileExtension: string;
  isForce: boolean;
}

@Injectable()
export class AudioChatGPTService extends BaseFeatureChatGPTService<AudioAdapter> {
  private readonly maxParts = 30;

  constructor(
    loggerHelperService: LoggerHelperService,
    protected readonly dataSourceAdapterService: DataSourceAdapterService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly yAudioTranscriptionService: YAudioTranscriptionService
  ) {
    super(
      loggerHelperService,
      dataSourceAdapterService,
      DataSourceType.AUDIO,
      PDFChatGPTService.name
    );
  }

  async fetchDataByDataSourceUrl(
    data: AudioChatOptions
  ): Promise<PartCreateTranscriptionResponse[]> {
    const { log, error } = this.trackerLoggerCreator.create(
      'fetchDataByDataSourceUrl'
    );

    const { url, fileExtension } = data;

    // check cache by url
    const cachedTranscriptions =
      await this.yAudioTranscriptionService.findRecordByUrl(url);

    if (
      !data.isForce &&
      cachedTranscriptions &&
      cachedTranscriptions.data?.length > 0
    ) {
      log(`cached ${url}`);
      return cachedTranscriptions.data;
    }

    log(`called ${url}`);

    const transcriptions = await this.setupTranscription(url, fileExtension);

    // save to cache
    const newRecord: Partial<YAudioTranscription> = {
      fingerprint: createHmac('sha256', url).digest('hex'),
      url,
      data: transcriptions,
      extension: fileExtension,
    };

    this.eventEmitter.emit(this.yAudioTranscriptionService.createEvent, {
      ...newRecord,
    });

    return transcriptions;
  }

  private async setupTranscription(url: string, fileExtension: string) {
    const { log, error } =
      this.trackerLoggerCreator.create('setupTranscription');

    log('audio download start...');
    // download file from url and save to path
    const audioFilePath =
      await this.getAdapter().getDataFormUrlSaveAsPath<string>(
        url,
        DownloadFileType[fileExtension]
      );
    log('audio download end...');

    // need to split audio file to 180 seconds
    const paths = (await splitAudioFile(audioFilePath, 180)).slice(
      0,
      this.maxParts
    );

    const promisePool = await PromisePool.withConcurrency(3)
      .for(paths)
      .useCorrespondingResults()
      .onTaskFinished(async (item, pool) => {
        const formatted =
          pool.processedPercentage().toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) + '%';
        log(`percentage: ${formatted}`);
        await delay(Math.random() * 500 + 256);
      })
      .process(async (path, index, pool) => {
        const transcriptionResponse =
          await this.getAdapter().getDataFromPath<PartCreateTranscriptionResponse>(
            path
          );

        return {
          ...transcriptionResponse,
          partNumber: index + 1,
        };
      });

    promisePool.errors?.length > 0 &&
      promisePool.errors.forEach((e) => error(e.raw, e.stack, e));
    const results = promisePool.results.filter(
      (r) => r !== undefined && (r as any) !== Symbol.for('failed')
    );

    const transcriptions = results
      .filter((r) => r !== undefined)
      .sort((a, b) => {
        return a.partNumber - b.partNumber;
      });

    // remove audio file
    this.eventEmitter.emit('delete.files', {
      paths: [audioFilePath],
    });
    return transcriptions;
  }
}
