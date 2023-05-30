import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';

export interface IMongoDBConfig {
  uri: string;
  user: string;
  pass: string;
}

export const mongoDBConfig = registerAs(ConfigPath.MongoDB, () => ({
  uri: process.env.MONGODB_URI,
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASSWORD,
}));
