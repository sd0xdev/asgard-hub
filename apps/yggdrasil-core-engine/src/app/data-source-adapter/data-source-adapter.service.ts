import { Injectable } from '@nestjs/common';
import { DataSourceType } from './adapter/interface/data-source-type.enum';
import { PDFAdapter } from './adapter/pdf-adapter';
import { AudioAdapter } from './adapter/audio-adapter';
import { TXTAdapter } from './adapter/txt-adapter';
import { URLAdapter } from './adapter/url-adapter';
import { ImageAdapter } from './adapter/image-adapter';
import { BaseDataSourceAdapter } from './adapter/interface/data-source-adapter.interface';
import { YoutubeAdapter } from './adapter/youtube-adapter/youtube-adapter.service';

@Injectable()
export class DataSourceAdapterService {
  constructor(
    private readonly pdfAdapter: PDFAdapter,
    private readonly audioAdapter: AudioAdapter,
    private readonly txtAdapter: TXTAdapter,
    private readonly urlAdapter: URLAdapter,
    private readonly imageAdapter: ImageAdapter,
    private readonly ytAdapter: YoutubeAdapter,
  ) {}

  getAdapter<T extends BaseDataSourceAdapter>(
    dataSourceType: DataSourceType,
  ): T {
    switch (dataSourceType) {
      case DataSourceType.PDF:
        return this.pdfAdapter as BaseDataSourceAdapter as T;
      case DataSourceType.AUDIO:
        return this.audioAdapter as BaseDataSourceAdapter as T;
      case DataSourceType.TXT:
        return this.txtAdapter as BaseDataSourceAdapter as T;
      case DataSourceType.URL:
        return this.urlAdapter as BaseDataSourceAdapter as T;
      case DataSourceType.IMAGE:
        return this.imageAdapter as BaseDataSourceAdapter as T;
      case DataSourceType.YOUTUBE:
        return this.ytAdapter as BaseDataSourceAdapter as T;
      default:
        throw new Error('Data source type not supported');
    }
  }
}
