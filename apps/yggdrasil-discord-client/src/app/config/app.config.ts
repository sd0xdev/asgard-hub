import { registerAs } from '@nestjs/config';

export enum ConfigPath {
  APP = 'app',
  PORT = 'app.servicePort',
  DISCORD_BOT = 'discordBot',
  REDIS = 'redis',
  CORE_ENGINE = 'coreEngine',
  CORE_ENGINE_LLM_AI = 'coreEngineLLMAI',
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
