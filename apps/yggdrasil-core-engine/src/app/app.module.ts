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
import { azureOpenAIConfig } from './config/azure.openai.config';
import { openAIConfig } from './config/open.ai.config';
import { NestWinstonModule } from '@asgard-hub/nest-winston';
import { ChatGPTModule } from './chatgpt/chatgpt.module';
import { mongoDBConfig } from './config/mongo.db.config';

@Module({
  imports: [
    isTest
      ? ConfigModule.forRoot({ isGlobal: true })
      : ConfigModule.forRoot({
          envFilePath: envFilePath(),
          isGlobal: true,
          cache: true,
          // for local development
          load: [appConfig, openAIConfig, azureOpenAIConfig, mongoDBConfig],
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
    ChatGPTModule,
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
  exports: [ConfigService],
})
export class AppModule {}
