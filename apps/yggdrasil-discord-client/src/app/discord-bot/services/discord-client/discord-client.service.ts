import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { DISCORD_BOT_MODULE_OPTIONS } from '../../constants/discord-bot.constants';
import { DiscordBotModuleOptions } from '../../interface/discord-bot-module';

@Injectable()
export class DiscordClientService implements OnApplicationShutdown {
  private client: Client;
  private token: string;

  constructor(
    private readonly asgardLogger: AsgardLogger,
    @Inject(DISCORD_BOT_MODULE_OPTIONS)
    private readonly options: DiscordBotModuleOptions
  ) {}

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

  get dClient(): Client {
    if (!this.client) {
      this.asgardLogger.log('setup client');
      this.setupClient();
    }

    return this.client;
  }

  onApplicationShutdown() {
    this.client.removeAllListeners();
    this.client.destroy();
    this.client = null;
  }
}
