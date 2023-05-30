import { Module, Logger, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YoutubeDlModule } from './youtube-dl/youtube-dl.module';
import { YoutubeDlService } from './youtube-dl/youtube-dl.service';
import { MongoModule } from '../mongo/mongo.module';
import { YoutubeRecordService } from './youtube-record/youtube-record.service';
import { YoutubeDataService } from './youtube-data/youtube-data.service';
import { CloudStorageService } from './cloud-storage/cloud-storage.service';
import { YAudioTranscriptionService } from './y-audio-transcription/youtube-record.service';
import { CloudErrorReportingService } from './cloud-error-reporting/cloud-error-reporting.service';

@Global()
@Module({
  imports: [MongoModule, HttpModule, YoutubeDlModule],
  providers: [
    Logger,
    YoutubeDlService,
    YoutubeRecordService,
    YoutubeDataService,
    YAudioTranscriptionService,
    CloudStorageService,
    CloudErrorReportingService,
  ],
  exports: [
    YoutubeDlService,
    YoutubeRecordService,
    YoutubeDataService,
    YAudioTranscriptionService,
  ],
})
export class ServiceModule {}
