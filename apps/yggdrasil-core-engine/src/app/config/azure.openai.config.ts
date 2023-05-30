import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';

export interface IAzureOpenAIConfig {
  enable: boolean;
  apiKey: string;
  endpoint: string;
  deploymentName: string;
}

export const azureOpenAIConfig = registerAs(ConfigPath.AzureOpenAI, () => ({
  enable: process.env.AZURE_OPENAI_ENABLE ? true : false,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
}));
