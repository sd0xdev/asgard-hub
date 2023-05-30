import { registerAs } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export enum ConfigPath {
  APP = 'app',
  OpenAI = 'OPENAI_API',
  AzureOpenAI = 'AZURE_OPENAI_API',
  MongoDB = 'MONGODB',
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
  tempDirPath: string;
}

export const appConfig = registerAs(ConfigPath.APP, () => {
  const tempDirPath = resolve(__dirname, '..', 'temp');
  if (!existsSync(tempDirPath)) {
    mkdirSync(tempDirPath);
  }

  return {
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
    tempDirPath,
  };
});
