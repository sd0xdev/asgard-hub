import { Injectable } from '@nestjs/common';
import { AudioAdapter } from '../audio-adapter';
import { DataSourceType } from '../interface/data-source-type.enum';

@Injectable()
export class YoutubeAdapter extends AudioAdapter {
  constructor() {
    super();
    this.dataSourceType = DataSourceType.YOUTUBE;
  }

  async getIdFromUrl(url: string): Promise<string> {
    return await this.downloadService.getYoutubeIdFromUrl(url);
  }

  async getDataFormUrlSaveAsPath<T>(url: string): Promise<T> {
    return (await this.downloadService.downloadYoutubeOfAudio(url)) as T;
  }
}
