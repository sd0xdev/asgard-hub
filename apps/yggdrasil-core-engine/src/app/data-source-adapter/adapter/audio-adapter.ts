import { CreateTranscriptionResponse } from 'openai';
import { BaseDataSourceAdapter } from './interface/data-source-adapter.interface';
import { DataSourceType } from './interface/data-source-type.enum';
import { Inject, Injectable } from '@nestjs/common';
import {
  DownloadFileType,
  DownloadService,
} from '../../services/download-service/download-service.service';
import { randomUUID } from 'crypto';
import { ChatGPTGateWayService } from '../../services/chatgpt-gateway-service/chatgpt.service';

@Injectable()
export class AudioAdapter extends BaseDataSourceAdapter {
  @Inject()
  protected readonly downloadService: DownloadService;

  @Inject()
  protected readonly chatGPTService: ChatGPTGateWayService;
  constructor() {
    super(DataSourceType.AUDIO);
  }

  public async getDataFormUrlSaveAsPath<T>(
    url: string,
    fileType: DownloadFileType = DownloadFileType.MP3
  ): Promise<T> {
    return (await this.downloadService.downloadFileSaveAsPath(
      url,
      `${randomUUID()}.${fileType}`
    )) as T;
  }

  async getDataFromPath<T extends CreateTranscriptionResponse>(
    path: string
  ): Promise<T> {
    // call chatgpt service to get transcription
    const transcription = await this.chatGPTService.getTranscriptionResponse(
      path
    );

    return transcription as CreateTranscriptionResponse as T;
  }
}
