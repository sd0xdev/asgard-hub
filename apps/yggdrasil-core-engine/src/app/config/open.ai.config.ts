import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';

export interface IOpenAIConfig {
  apiKey: string;
}

export const openAIConfig = registerAs(ConfigPath.OpenAI, () => ({
  apiKey: process.env.OPENAI_API_KEY,
}));
