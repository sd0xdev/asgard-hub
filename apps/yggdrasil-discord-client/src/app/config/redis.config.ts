import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';

export interface IRedisConfig {
  host: string;
  port: number;
}

export const redisConfig = registerAs(ConfigPath.REDIS, () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
}));
