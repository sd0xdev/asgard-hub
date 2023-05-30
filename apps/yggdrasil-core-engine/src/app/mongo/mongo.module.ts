import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { YTRecord, YTRecordSchema } from '../mongo/schemas/yt.record.schema';
import { YTData, YTDataSchema } from '../mongo/schemas/yt.data.schema';
import {
  YAudioTranscription,
  YAudioTranscriptionSchema,
} from '../mongo/schemas/y.audio.transcription.schema';
import { ConfigService } from '@nestjs/config';
import { IMongoDBConfig } from '../config/mongo.db.config';
import { ConfigPath } from '../config/app.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: YTRecord.name,
        schema: YTRecordSchema,
      },
      {
        name: YTData.name,
        schema: YTDataSchema,
      },
      {
        name: YAudioTranscription.name,
        schema: YAudioTranscriptionSchema,
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoDBConfig = configService.get<IMongoDBConfig>(
          ConfigPath.MongoDB
        );

        const options: MongooseModuleFactoryOptions = {
          uri: mongoDBConfig.uri,
          user: mongoDBConfig.user,
          pass: mongoDBConfig.pass,
          autoCreate: true,
        };

        return options;
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MongoModule {}
