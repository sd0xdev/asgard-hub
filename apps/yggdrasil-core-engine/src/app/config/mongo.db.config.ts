import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';

export interface IMongoDBConfig {
  uri: string;
  user: string;
  pass: string;
}

export const mongoDBConfig = registerAs(ConfigPath.MongoDB, () => ({
  uri: process.env.MONGO_DB_URI,
  user: process.env.MONGO_DB_USER,
  pass: process.env.MONGO_DB_PASSWORD,
}));
