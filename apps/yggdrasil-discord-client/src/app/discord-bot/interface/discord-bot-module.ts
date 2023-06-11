import { ModuleMetadata, Type } from '@nestjs/common';
import { DiscordBotOptions } from './discord-bot-options.interface';

export type DiscordBotModuleOptions = DiscordBotOptions;

export interface DiscordBotOptionsFactory {
  createDiscordBotOptions():
    | Promise<DiscordBotModuleOptions>
    | DiscordBotModuleOptions;
}

export interface DiscordBotModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  imports?: any[];
  useExisting?: Type<DiscordBotOptionsFactory>;
  useClass?: Type<DiscordBotOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<DiscordBotModuleOptions> | DiscordBotModuleOptions;
  inject?: any[];
}
