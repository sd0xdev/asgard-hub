import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { NestOpenAIClientService } from './nest-openai-client.service';
import {
  NEST_OPENAI_CLIENT_MODULE_ID,
  NEST_OPENAI_CLIENT_MODULE_OPTIONS,
} from './constants/nest.openai.client.constants';
import {
  NestOpenAIClientModuleAsyncOptions,
  NestOpenAIClientOptionsFactory,
} from './interface/nest.openai.client-module';
import { NestOpenAIClientOptionsSupplement } from './interface/nest.openai.client-options.interface';
import { randomStringGenerator } from './utils/utils';

@Module({
  controllers: [],
  providers: [NestOpenAIClientService],
  exports: [NestOpenAIClientService],
})
export class NestOpenAIClientModule {
  static forRoot() {
    return {
      module: NestOpenAIClientModule,
      providers: [NestOpenAIClientService],
      exports: [NestOpenAIClientService],
    };
  }

  static async registerAsync(
    options: NestOpenAIClientModuleAsyncOptions
  ): Promise<DynamicModule> {
    const createProviders = this.createAsyncProviders(options);
    return {
      module: NestOpenAIClientModule,
      imports: [...(options?.imports ?? [])],
      providers: [
        ...createProviders,
        {
          provide: NEST_OPENAI_CLIENT_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        {
          provide: NestOpenAIClientOptionsSupplement.NEST_OPENAI_CLIENT_SERVICE,
          useClass: NestOpenAIClientService,
        },
      ],
      exports: [
        NEST_OPENAI_CLIENT_MODULE_ID,
        NEST_OPENAI_CLIENT_MODULE_OPTIONS,
        NestOpenAIClientOptionsSupplement.NEST_OPENAI_CLIENT_SERVICE,
      ],
    };
  }

  private static createAsyncProviders(
    options: NestOpenAIClientModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<NestOpenAIClientOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass: useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: NestOpenAIClientModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NEST_OPENAI_CLIENT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<NestOpenAIClientOptionsFactory>,
    ];

    return {
      provide: NEST_OPENAI_CLIENT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: NestOpenAIClientOptionsFactory) =>
        optionsFactory.createNestOpenAIClientOptions(),
      inject,
    };
  }
}
