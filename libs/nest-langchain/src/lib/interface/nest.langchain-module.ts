import { ModuleMetadata, Type } from '@nestjs/common';
import { BaseChatModelParams } from 'langchain/dist/chat_models/base';
import {
  OpenAIChatInput,
  AzureOpenAIInput,
} from 'langchain/chat_models/openai';

export class NestLangchainRuntime {
  isDev = false;
  isStaging = false;
  isProd = true;
}

export type NestLangChainAIChatOAuth = Partial<OpenAIChatInput> &
  Partial<AzureOpenAIInput> &
  BaseChatModelParams & {
    concurrency?: number;
    cache?: boolean;
    openAIApiKey?: string;
  };

export interface NestLangchainOptions extends Record<string, unknown> {
  runtime?: NestLangchainRuntime;
  langChainAIChatOAuth?: NestLangChainAIChatOAuth;
}

export type NestLangchainModuleOptions = NestLangchainOptions;

export interface NestLangchainOptionsFactory {
  createNestLangchainOptions():
    | Promise<NestLangchainModuleOptions>
    | NestLangchainModuleOptions;
}

export type NestLangchainModuleFactoryOptions = Omit<
  NestLangchainOptions,
  'clientName'
>;

export interface NestLangchainModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<NestLangchainOptionsFactory>;
  useClass?: Type<NestLangchainOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<NestLangchainModuleOptions> | NestLangchainModuleOptions;
  inject?: any[];
}
