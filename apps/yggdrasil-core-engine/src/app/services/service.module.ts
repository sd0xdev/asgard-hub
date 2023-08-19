import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YoutubeDlModule } from './youtube-dl/youtube-dl.module';
import { YoutubeDlService } from './youtube-dl/youtube-dl.service';
import { MongoModule } from '../mongo/mongo.module';
import { YoutubeRecordService } from './youtube-record/youtube-record.service';
import { YoutubeDataService } from './youtube-data/youtube-data.service';
import { YAudioTranscriptionService } from './y-audio-transcription/youtube-record.service';
import { ChatGPTGateWayService } from './chatgpt-gateway-service/chatgpt.service';
import { ConfigService } from '@nestjs/config';
import { NestWinstonModule } from '@asgard-hub/nest-winston';
import { IAppConfig, ConfigPath } from '../config/app.config';
import { isDev, isStaging, isProd } from '../constants/common.constant';
import { NestOpenAIClientModule } from '@sd0x/nest-openai-client';
import { NestLangChainModule } from '@sd0x/nest-langchain';
import { IAzureOpenAIConfig } from '../config/azure.openai.config';
import { IOpenAIConfig } from '../config/open.ai.config';
import { OpenAIProvider } from '../provider/open-ai/open-ai';
import { ProviderModule } from '../provider/provider.module';

@Global()
@Module({
  imports: [
    NestOpenAIClientModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<IOpenAIConfig>(ConfigPath.OpenAI).apiKey,
        azure: configService.get<IAzureOpenAIConfig>(ConfigPath.AzureOpenAI)
          .enable
          ? {
              apiKey: configService.get<IAzureOpenAIConfig>(
                ConfigPath.AzureOpenAI
              ).apiKey,
              endpoint: configService.get<IAzureOpenAIConfig>(
                ConfigPath.AzureOpenAI
              ).endpoint,
              deploymentName: configService.get<IAzureOpenAIConfig>(
                ConfigPath.AzureOpenAI
              ).deploymentName,
            }
          : undefined,
      }),
      inject: [ConfigService],
    }),
    NestLangChainModule.registerAsync({
      imports: [ProviderModule],
      useFactory: (openAIProvider: OpenAIProvider) => ({
        runtime: {
          isDev,
          isStaging,
          isProd,
        },
        langChainAIChatOAuth: openAIProvider.fetchChatOpenAIInput(),
      }),
      inject: [OpenAIProvider],
    }),
    NestWinstonModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        runtime: {
          isDev,
          isStaging,
          isProd,
        },
        packageName: configService.get<IAppConfig>(ConfigPath.APP).packageName,
      }),
      inject: [ConfigService],
    }),
    MongoModule,
    HttpModule,
    YoutubeDlModule,
  ],
  providers: [
    ChatGPTGateWayService,
    YoutubeDlService,
    YoutubeRecordService,
    YoutubeDataService,
    YAudioTranscriptionService,
  ],
  exports: [
    ChatGPTGateWayService,
    YoutubeDlService,
    YoutubeRecordService,
    YoutubeDataService,
    YAudioTranscriptionService,
  ],
})
export class ServiceModule {}
