import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { resolve } from 'path';
import {
  DiscordBotModuleAsyncOptions,
  DiscordBotOptionsFactory,
} from './interface/discord-bot-module';
import {
  DISCORD_BOT_MODULE_ID,
  DISCORD_BOT_MODULE_OPTIONS,
} from './constants/discord-bot.constants';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotOptionsSupplement } from './interface/discord-bot-options.interface';
import { randomStringGenerator } from './utils/random-string-generator.util';
import { SetupKeywordService } from './services/setup-keyword/setup-keyword.service';
import { MessageService } from './services/message/message.service';
import { DiscordClientService } from './services/discord-client/discord-client.service';
import { MessageController } from './controller/message.controller';
import { LLMAIChatService } from './services/llmai/llmai.chat.service';

@Module({
  providers: [
    SetupKeywordService,
    MessageService,
    DiscordClientService,
    LLMAIChatService,
  ],
  controllers: [MessageController],
})
export class DiscordBotModule {
  static registerAsync(options: DiscordBotModuleAsyncOptions): DynamicModule {
    return {
      module: DiscordBotModule,
      imports: [...(options?.imports ?? [])],
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: DISCORD_BOT_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        {
          provide: DiscordBotOptionsSupplement.SETUP_KEYWORD_SERVICE,
          useClass: SetupKeywordService,
        },
        {
          provide: DiscordBotOptionsSupplement.MESSAGE_SERVICE,
          useClass: MessageService,
        },
        {
          provide: DiscordBotOptionsSupplement.DISCORD_BOT_SERVICE,
          useClass: DiscordBotService,
        },
      ],
      exports: [
        ClientsModule,
        DISCORD_BOT_MODULE_ID,
        DISCORD_BOT_MODULE_OPTIONS,
        DiscordBotOptionsSupplement.SETUP_KEYWORD_SERVICE,
        DiscordBotOptionsSupplement.DISCORD_BOT_SERVICE,
      ],
    };
  }

  private static createAsyncProviders(
    options: DiscordBotModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: DiscordBotModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: DISCORD_BOT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: DISCORD_BOT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: DiscordBotOptionsFactory) =>
        optionsFactory.createDiscordBotOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
