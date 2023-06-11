export enum DiscordBotOptionsSupplement {
  'DISCORD_BOT_SERVICE' = 'DISCORD_BOT_SERVICE',
  'SETUP_KEYWORD_SERVICE' = 'SETUP_KEYWORD_SERVICE',
  'MESSAGE_SERVICE' = 'MESSAGE_SERVICE',
}

export class DiscordBotRuntime {
  isDev = false;
  isStaging = false;
  isProd = true;
}

export class DiscordBotOptionsConfig {
  token: string;
  rpcApiKey: string;
  runtime: DiscordBotRuntime;
  isAzureService = false;
  isStartClient = false;
}

export class DiscordBotOptions {
  config?: DiscordBotOptionsConfig;
  discordOptions?: {
    discordDevelopChannelId: string;
    discordDisableBotChannelIds: string[];
    discordPermanentChannelId: string;
    discordPermanentChannelIds: string[];
    discordBotClientId: string;
    alphaWhitelistedUserIds: string[];
  };
}
