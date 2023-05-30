import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  isTest,
  envFilePath,
  isDev,
  isStaging,
  isProd,
} from './constants/common.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigPath, IAppConfig, appConfig } from './config/app.config';
import {
  IAzureOpenAIConfig,
  azureOpenAIConfig,
} from './config/azure.openai.config';
import { IOpenAIConfig, openAIConfig } from './config/open.ai.config';
import { NestWinstonModule } from '@asgard-hub/nest-winston';
import { NestOpenAIClientModule } from '@sd0x/nest-openai-client';

@Module({
  imports: [
    isTest
      ? ConfigModule.forRoot({ isGlobal: true })
      : ConfigModule.forRoot({
          envFilePath,
          isGlobal: true,
          cache: true,
          // for local development
          load: [appConfig, openAIConfig, azureOpenAIConfig],
          // if NODE_ENV is not development, ignore .env file
          ignoreEnvFile: !isDev,
          expandVariables: true,
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
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
  exports: [ConfigService],
})
export class AppModule {}
