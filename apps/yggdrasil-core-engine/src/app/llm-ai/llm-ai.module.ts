import { Module } from '@nestjs/common';
import { MongoModule } from '../mongo/mongo.module';
import { ServiceModule } from '../services/service.module';
import { DataSourceAdapterModule } from '../data-source-adapter/data-source-adapter.module';
import { ConfigService } from '@nestjs/config';
import { NestWinstonModule } from '@asgard-hub/nest-winston';
import { IAppConfig, ConfigPath } from '../config/app.config';
import { isDev, isStaging, isProd } from '../constants/common.constant';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LLMAIController } from '../controllers/llm-ai/llm-ai.controller';
import { LangChainService } from './lang-chain/lang-chain.service';
import { NestLangChainModule } from '@sd0x/nest-langchain';
import { OpenAIProvider } from '../provider/open-ai/open-ai';
import { ProviderModule } from '../provider/provider.module';

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
    ServiceModule,
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
    MongoModule,
    DataSourceAdapterModule,
  ],
  providers: [LangChainService],
  exports: [LangChainService],
  controllers: [LLMAIController],
})
export class LLMAIModule {}
