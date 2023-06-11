import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordBotModule } from './discord-bot/discord-bot.module';
import { HttpModule } from '@nestjs/axios';
import { NestWinstonModule } from '@asgard-hub/nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IDiscordBotConfig, discordBotConfig } from './config/discord.config';
import { ConfigPath, IAppConfig, appConfig } from './config/app.config';
import {
  envFilePath,
  isDev,
  isProd,
  isStaging,
  isTest,
} from './discord-bot/constants/common.constant';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { resolve } from 'path';
import { IRedisConfig, redisConfig } from './config/redis.config';
import {
  ICoreEngineConfig,
  coreEngineConfig,
} from './config/core.engine.config';
@Module({
  imports: [
    isTest
      ? ConfigModule.forRoot({ isGlobal: true })
      : ConfigModule.forRoot({
          envFilePath: envFilePath(),
          isGlobal: true,
          cache: true,
          // for local development
          load: [appConfig, discordBotConfig, redisConfig, coreEngineConfig],
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
    DiscordBotModule.registerAsync({
      imports: [
        NestWinstonModule.registerAsync({
          useFactory: (configService: ConfigService) => ({
            runtime: {
              isDev,
              isStaging,
              isProd,
            },
            packageName: configService.get<IAppConfig>(ConfigPath.APP)
              .packageName,
          }),
          inject: [ConfigService],
        }),
        ClientsModule.registerAsync([
          {
            name: 'CHATGPT_PACKAGE',
            useFactory: (configService: ConfigService) => {
              const config = configService.get<ICoreEngineConfig>(
                ConfigPath.CORE_ENGINE
              );
              return {
                transport: Transport.GRPC,
                options: {
                  loader: {
                    keepCase: true,
                    objects: true,
                    arrays: true,
                  },
                  ...config,
                },
              };
            },
            inject: [ConfigService],
          },
          {
            name: 'BOT_SERVICE',
            useFactory: (configService: ConfigService) => {
              const config = configService.get<IRedisConfig>(ConfigPath.REDIS);
              return {
                transport: Transport.REDIS,
                options: {
                  ...config,
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
        HttpModule,
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const discordBotConfig = configService.get<IDiscordBotConfig>(
          ConfigPath.DISCORD_BOT
        );

        return {
          config: {
            isAzureService: false,
            isStartClient: true,
            ...discordBotConfig.config,
          },
          discordOptions: {
            ...discordBotConfig.discordOptions,
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
