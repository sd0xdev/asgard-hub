import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';
import {
  isDev,
  isProd,
  isStaging,
} from '../discord-bot/constants/common.constant';

export interface IDiscordBotConfig {
  config: {
    token: string;
    rpcApiKey: string;
    runtime: {
      isDev: boolean;
      isStaging: boolean;
      isProd: boolean;
    };
  };
  discordOptions: {
    discordDevelopChannelId: string;
    discordDisableBotChannelIds: string[];
    discordPermanentChannelId: string;
    discordPermanentChannelIds: string[];
    discordBotClientId: string;
    alphaWhitelistedUserIds: string[];
  };
}

export const discordBotConfig = registerAs(ConfigPath.DISCORD_BOT, () => {
  const discordDisableBotChannelIds = (
    process.env.DISCORD_DISABLE_BOT_CHANNEL_IDS as string
  )?.split(',');

  const discordPermanentChannelIds = (
    process.env.DISCORD_PERMANENT_CHANNEL_IDS as string
  )?.split(',');

  const alphaWhitelistedUserIds = (
    process.env.ALPHA_WHITELISTED_USER_IDS as string
  )?.split(',');

  const env = {
    config: {
      token: process.env.DISCORD_TOKEN,
      rpcApiKey: process.env.RPC_API_KEY || process.env.CORE_ENGINE_API_KEY,
      runtime: {
        isDev: isDev,
        isStaging: isStaging,
        isProd: isProd,
      },
    },
    discordOptions: {
      discordDevelopChannelId: process.env.DISCORD_DEVELOP_CHANNEL_ID,
      discordDisableBotChannelIds,
      discordPermanentChannelId: process.env.DISCORD_PERMANENT_CHANNEL_ID,
      discordPermanentChannelIds,
      discordBotClientId: process.env.DISCORD_BOT_CLIENT_ID,
      alphaWhitelistedUserIds,
    },
  };

  return env;
});
