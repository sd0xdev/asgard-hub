import { registerAs } from '@nestjs/config';

export enum ConfigPath {
  APP = 'app',
  OpenAI = 'OPENAI_API',
  AzureOpenAI = 'AZURE_OPENAI_API',
}

export interface IAppConfig {
  packageName: string;
  serviceName: string;
  serviceVersion: string;
  servicePort: number;
  serviceHost: string;
  serviceEnv: string;
  serviceStage: string;
  serviceRegion: string;
  serviceZone: string;
  serviceCluster: string;
  serviceNamespace: string;
}

export const appConfig = registerAs(ConfigPath.APP, () => ({
  packageName: process.env.PACKAGE_NAME,
  serviceName: process.env.SERVICE_NAME,
  serviceVersion: process.env.SERVICE_VERSION,
  servicePort: process.env.SERVICE_PORT,
  serviceHost: process.env.SERVICE_HOST,
  serviceEnv: process.env.SERVICE_ENV,
  serviceStage: process.env.SERVICE_STAGE,
  serviceRegion: process.env.SERVICE_REGION,
  serviceZone: process.env.SERVICE_ZONE,
  serviceCluster: process.env.SERVICE_CLUSTER,
  serviceNamespace: process.env.SERVICE_NAMESPACE,
}));

export interface IOpenAIConfig {
  apiKey: string;
}

export const openAIConfig = registerAs(ConfigPath.OpenAI, () => ({
  apiKey: process.env.OPENAI_API_KEY,
}));

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
