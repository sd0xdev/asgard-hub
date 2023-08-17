import { Injectable, Scope } from '@nestjs/common';
import { ChatGPTGateWayService } from '../../../services/chatgpt-gateway-service/chatgpt.service';
import PromisePool from '@supercharge/promise-pool/dist';
import { splitAudioFile } from '@asgard-hub/utils';
import { ChatGPTChant } from '@asgard-hub/utils';
import { YTSummaryOptions } from '../../interface/chatgpt.service.interface';
import {
  PartCreateChatCompletionResponse,
  PartCreateTranscriptionResponse,
} from '../../interface/create.completion.response.usage.for.rpc.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { YoutubeRecordService } from '../../../services/youtube-record/youtube-record.service';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { BaseFeatureChatGPTService } from '../base-feature-chat-gpt.service';
import { delay } from '@asgard-hub/utils';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { DataSourceType } from '../../../data-source-adapter/adapter/interface/data-source-type.enum';
import { CreateTranscriptionResponse } from 'openai';
import { YoutubeAdapter } from '../../../data-source-adapter/adapter/youtube-adapter/youtube-adapter.service';
import { DownloadAudioEvent } from '../../../services/youtube-dl/youtube-dl.service';

@Injectable()
export class YTChatGPTService extends BaseFeatureChatGPTService<YoutubeAdapter> {
  constructor(
    private readonly asgardLogger: AsgardLogger,
    protected readonly chatGPTService: ChatGPTGateWayService,
    protected readonly dataSourceAdapterService: DataSourceAdapterService,
    protected eventEmitter: EventEmitter2,
    protected readonly youtubeRecordService: YoutubeRecordService
  ) {
    super(
      dataSourceAdapterService,
      DataSourceType.YOUTUBE,
      YTChatGPTService.name
    );
  }

  async fetchSummaryWithGPT(
    data: YTSummaryOptions
  ): Promise<PartCreateChatCompletionResponse[]> {
    this.asgardLogger.log(`called ${data.url}`);

    const { url, user } = data;

    // find id from url
    const id = await this.getAdapter().getIdFromUrl(url);

    // find record by url
    const record = await this.youtubeRecordService.findRecordByYtId(id);

    data.isForced && this.asgardLogger.log('isForced is true');

    if (record && !data.isForced) {
      // if record exists, return the record
      this.asgardLogger.log('record exists, return the record');
      return record.response;
    }

    let summaries: PartCreateChatCompletionResponse[];
    let transcriptions: PartCreateTranscriptionResponse[];

    try {
      this.asgardLogger.log('audio download start...');
      // call youtube-dl service to download audio
      const { audioFilePath, title, channel, metaData } =
        await this.getAdapter().getDataFormUrlSaveAsPath<DownloadAudioEvent>(
          url
        );
      this.asgardLogger.log('audio download end...');

      // need to split audio file to 180 seconds
      const paths = await splitAudioFile(audioFilePath, 180);

      const promisePool = await PromisePool.withConcurrency(3)
        .for(paths)
        .useCorrespondingResults()
        .onTaskFinished(async (item, pool) => {
          const formatted =
            pool.processedPercentage().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + '%';
          this.asgardLogger.log(`percentage: ${formatted}`);
          await delay(Math.random() * 500 + 256);
        })
        .process(async (path, index, pool) => {
          const { summary, transcription } = await this.getYoutubeSummary(
            path,
            {
              channel,
              title,
              user,
              partNumber: index + 1,
            }
          );

          return {
            summary,
            transcription,
          };
        });

      promisePool.errors?.length > 0 &&
        promisePool.errors.forEach((e) =>
          this.asgardLogger.error(e.raw, e.stack, e)
        );
      const results = promisePool.results.filter(
        (r) => r !== undefined && (r as any) !== Symbol.for('failed')
      );

      summaries = results
        .map((r) => r.summary)
        .filter((r) => r !== undefined)
        .sort((a, b) => a.partNumber - b.partNumber);
      transcriptions = results
        .map((r) => r.transcription)
        .filter((r) => r !== undefined)
        .sort((a, b) => {
          return a.partNumber - b.partNumber;
        });

      // remove audio file
      this.eventEmitter.emit('delete.files', {
        paths: [audioFilePath],
      });

      const event = record ? 'update.record' : 'create.record';
      // create a new record
      this.eventEmitter.emit(event, {
        ytId: metaData.id,
        url,
        title,
        channel,
        response: summaries,
        channelId: metaData.channelId,
        channelUrl: metaData.channelUrl,
        duration: metaData.duration,
      });

      // create a new data
      this.eventEmitter.emit('update.data', {
        url,
        data: transcriptions,
        ytId: metaData.id,
        channelId: metaData.channelId,
      });
    } catch (e) {
      this.asgardLogger.error(e?.message, e.stack, e);
    }

    return summaries;
  }

  private async getYoutubeSummary(
    audioFilePath: string,
    info: {
      channel: string;
      title: string;
      user: string;
      partNumber: number;
      userExpectation?: string;
    }
  ): Promise<{
    summary: PartCreateChatCompletionResponse;
    transcription: PartCreateTranscriptionResponse;
  }> {
    this.asgardLogger.log('transcription start...');
    const transcription =
      await this.getAdapter().getDataFromPath<CreateTranscriptionResponse>(
        audioFilePath
      );
    this.asgardLogger.log('transcription end...');

    // call chatgpt service to general messages
    const generalMessages = this.chatGPTService.generalMessages(
      ChatGPTChant.youtubeSummary
    );

    generalMessages.push({
      content: `
      頻道名稱: ${info.channel}\n
      影片標題: ${info.title}\n
      影片段落 ${info.partNumber}: ${transcription?.text}\n
      段落摘要(繁體中文): \n`,
      role: 'user',
    });

    this.asgardLogger.log('get summary start...');
    // call chatgpt service to get summary
    const summary = await this.chatGPTService.getGPTResponse(
      generalMessages,
      info.user,
      true,
      {
        temperature: this.temperature,
      }
    );
    this.asgardLogger.log('get summary end...');

    return {
      summary: {
        ...summary,
        partNumber: info.partNumber,
      },
      transcription: {
        ...transcription,
        partNumber: info.partNumber,
      },
    };
  }
}
