import { registerAs } from '@nestjs/config';
import { ConfigPath } from './app.config';

export interface IAzureOpenAIConfig {
  enable: boolean;
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  instanceName: string;
  apiVersion: string;
  modelName: string;
}

export const azureOpenAIConfig = registerAs(ConfigPath.AzureOpenAI, () => ({
  enable: process.env.H_AZURE_OPENAI_ENABLE === 'true' ? true : false,
  apiKey: process.env.H_AZURE_OPENAI_API_KEY,
  endpoint: process.env.H_AZURE_OPENAI_ENDPOINT,
  deploymentName: process.env.H_AZURE_OPENAI_DEPLOYMENT_NAME,
  instanceName: process.env.H_AZURE_OPENAI_INSTANCE_NAME,
  apiVersion: process.env.H_AZURE_OPENAI_API_VERSION,
  modelName: process.env.H_AZURE_OPENAI_MODEL_NAME,
}));
