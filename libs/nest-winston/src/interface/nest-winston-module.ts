import { ModuleMetadata, Type } from '@nestjs/common';

export class NestWinstonRuntime {
  isDev = false;
  isStaging = false;
  isProd = true;
}

export interface NestWinstonOptions extends Record<string, unknown> {
  runtime?: NestWinstonRuntime,
  packageName?: string;
  level?: string;
}


export type NestWinstonModuleOptions = NestWinstonOptions;


export interface NestWinstonOptionsFactory {
  createNestWinstonOptions():
    | Promise<NestWinstonModuleOptions>
    | NestWinstonModuleOptions;
}

export type NestWinstonModuleFactoryOptions = Omit<NestWinstonOptions, 'packageName'>

export interface NestWinstonModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<NestWinstonOptionsFactory>;
  useClass?: Type<NestWinstonOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<NestWinstonModuleOptions> | NestWinstonModuleOptions;
  inject?: any[];
}
