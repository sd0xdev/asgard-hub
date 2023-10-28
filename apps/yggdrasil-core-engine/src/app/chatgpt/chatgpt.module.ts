import { Module } from '@nestjs/common';
import { MongoModule } from '../mongo/mongo.module';
import { YTChatGPTService } from './service/yt-chat-gpt/yt-chat-gpt.service';
import { URLChatGPTService } from './service/url-chat-gpt/url-chat-gpt.service';
import { TXTChatGptService } from './service/txt-chat-gpt/txt-chat-gpt.service';
import { PDFChatGPTService } from './service/pdf-chat-gpt/pdf-chat-gpt.service';
import { ImageChatGptService } from './service/image-chat-gpt/image-chat-gpt.service';
import { GatewayService } from './service/gateway-service/gateway-service.service';
import { ChatGPTController } from '../controllers/chatgpt/chatgpt.controller';
import { ServiceModule } from '../services/service.module';
import { DataSourceAdapterModule } from '../data-source-adapter/data-source-adapter.module';
import { AudioChatGPTService } from './service/audio-chat-gpt/audio-chat-gpt.service';
import { ConfigService } from '@nestjs/config';
import { NestWinstonModule } from '@asgard-hub/nest-winston';
import { IAppConfig, ConfigPath } from '../config/app.config';
import { isDev, isStaging, isProd } from '../constants/common.constant';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
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
    ServiceModule,
    DataSourceAdapterModule,
  ],
  providers: [
    YTChatGPTService,
    URLChatGPTService,
    TXTChatGptService,
    PDFChatGPTService,
    ImageChatGptService,
    AudioChatGPTService,
    GatewayService,
  ],
  exports: [GatewayService],
  controllers: [ChatGPTController],
})
export class ChatGPTModule {}
