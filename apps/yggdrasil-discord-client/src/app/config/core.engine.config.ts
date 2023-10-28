import { registerAs } from '@nestjs/config';
import { isDev } from '../discord-bot/constants/common.constant';
import { resolve } from 'path';
import { ConfigPath } from './app.config';

export interface ICoreEngineConfig {
  package: string;
  protoPath: string;
  url: string;
  apiKey: string;
}

export const coreEngineConfig = registerAs(ConfigPath.CORE_ENGINE, () => {
  const protoPath = getProtoPath('chatgpt.proto');

  const env = {
    package: process.env.CORE_ENGINE_PACKAGE,
    protoPath,
    url: process.env.CORE_ENGINE_URL,
    apiKey: process.env.CORE_ENGINE_API_KEY,
  };

  return env;
});

export const coreEngineLLMAIConfig = registerAs(
  ConfigPath.CORE_ENGINE_LLM_AI,
  () => {
    const protoPath = getProtoPath('llmai.proto');

    const env = {
      package: process.env.CORE_ENGINE_LLM_AI_PACKAGE,
      protoPath,
      url: process.env.CORE_ENGINE_LLM_AI_URL,
      apiKey: process.env.CORE_ENGINE_API_KEY,
    };

    return env;
  }
);

function getProtoPath(fileName: string) {
  return process.env['IS_DEBUG']
    ? resolve(__dirname, '..', '..', 'assets', fileName)
    : resolve(__dirname, '.', 'assets', fileName);
}
