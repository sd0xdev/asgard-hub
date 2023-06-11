import { Module } from '@nestjs/common';
import { YoutubeDlService } from './youtube-dl.service';

@Module({
  providers: [YoutubeDlService],
  exports: [YoutubeDlService],
})
export class YoutubeDlModule {}
