import { Inject, Injectable } from '@nestjs/common';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import {
  LoggerHelperService,
  TrackerLoggerCreator,
} from '@asgard-hub/nest-winston';
import { DISCORD_BOT_MODULE_OPTIONS } from '../../constants/discord-bot.constants';
import { DiscordBotModuleOptions } from '../../interface/discord-bot-module';

@Injectable()
export class DiscordClientService {
  private readonly trackerLoggerCreator: TrackerLoggerCreator;
  private client: Client;
  private token: string;

  constructor(
    loggerHelperService: LoggerHelperService,
    @Inject(DISCORD_BOT_MODULE_OPTIONS)
    private readonly options: DiscordBotModuleOptions
  ) {
    this.trackerLoggerCreator = loggerHelperService.create(
      DiscordClientService.name
    );
  }

  private async setupClient() {
    this.client = new Client({
      allowedMentions: { parse: ['users'] },
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
      ],
      //'MESSAGE', 'CHANNEL', 'REACTION', 'USER'
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
      ],
    });

    await this.client.login(this.token);
  }

  get discordClient(): Client {
    if (!this.client) {
      this.setupClient();
    }

    return this.client;
  }

  onModuleDestroy() {
    this.client.removeAllListeners();
    this.client.destroy();
    this.client = null;
  }
}
