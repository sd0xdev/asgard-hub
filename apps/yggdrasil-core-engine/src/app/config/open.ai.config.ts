import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';

export interface IOpenAIConfig {
  apiKey: string;
  modelName?: string;
  tokenLimit?: number;
}

export const openAIConfig = registerAs(ConfigPath.OpenAI, () => ({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo-16k-0613',
}));
