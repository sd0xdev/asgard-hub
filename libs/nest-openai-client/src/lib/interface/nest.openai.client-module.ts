import { ModuleMetadata, Type } from '@nestjs/common';

export class NestOpenAIClientRuntime {
  isDev = false;
  isStaging = false;
  isProd = true;
}

export interface NestOpenAIClientOptions extends Record<string, unknown> {
  runtime?: NestOpenAIClientRuntime;
  clientName?: string;
  apiKey?: string;
  azure?: {
    apiKey: string;
    endpoint: string;
    deploymentName: string;
  };
}

export type NestOpenAIClientModuleOptions = NestOpenAIClientOptions;

export interface NestOpenAIClientOptionsFactory {
  createNestOpenAIClientOptions():
    | Promise<NestOpenAIClientModuleOptions>
    | NestOpenAIClientModuleOptions;
}

export type NestOpenAIClientModuleFactoryOptions = Omit<
  NestOpenAIClientOptions,
  'clientName'
>;

export interface NestOpenAIClientModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<NestOpenAIClientOptionsFactory>;
  useClass?: Type<NestOpenAIClientOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<NestOpenAIClientModuleOptions> | NestOpenAIClientModuleOptions;
  inject?: any[];
}
