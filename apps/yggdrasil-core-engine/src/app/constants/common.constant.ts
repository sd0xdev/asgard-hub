import { resolve } from 'path';

// Config
export const CONFIG_DIR = 'assets';
export const ENV_FILE_LOCAL = '.env.local';

export const isDev =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
export const isStaging = process.env.NODE_ENV === 'staging';
export const isProd = process.env.NODE_ENV === 'production';

export const API_ROUTE = '/api/*';
export const envFilePath = process.env['IS_DEBUG']
  ? resolve(__dirname, '..', '..', CONFIG_DIR, ENV_FILE_LOCAL)
  : resolve(__dirname, CONFIG_DIR, ENV_FILE_LOCAL);
