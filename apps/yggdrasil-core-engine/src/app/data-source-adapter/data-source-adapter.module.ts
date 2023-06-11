import { Module } from '@nestjs/common';
import { AudioAdapter } from './adapter/audio-adapter';
import { DataSourceAdapterService } from './data-source-adapter.service';
import { ImageAdapter } from './adapter/image-adapter';
import { PDFAdapter } from './adapter/pdf-adapter';
import { TXTAdapter } from './adapter/txt-adapter';
import { URLAdapter } from './adapter/url-adapter';
import { CloudVisionService } from '../services/cloud-vision/cloud-vision.service';
import { DownloadService } from '../services/download-service/download-service.service';
import { HttpModule } from '@nestjs/axios';
import { ServiceModule } from '../services/service.module';
import { YoutubeAdapter } from './adapter/youtube-adapter/youtube-adapter.service';

@Module({
  imports: [HttpModule, ServiceModule],
  providers: [
    CloudVisionService,
    DownloadService,
    PDFAdapter,
    AudioAdapter,
    ImageAdapter,
    TXTAdapter,
    URLAdapter,
    YoutubeAdapter,
    DataSourceAdapterService,
  ],
  exports: [DataSourceAdapterService],
})
export class DataSourceAdapterModule {}
