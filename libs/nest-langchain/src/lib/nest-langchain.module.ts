import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { NestLangchainService } from './nest-langchain.service';
import {
  NEST_LANGCHAIN_MODULE_ID,
  NEST_LANGCHAIN_MODULE_OPTIONS,
} from './constants/nest.openai.client.constants';
import {
  NestLangchainModuleAsyncOptions,
  NestLangchainOptionsFactory,
} from './interface/nest.langchain-module';
import { NestLangchainOptionsSupplement } from './interface/nest.langchain-options.interface';
import { randomStringGenerator } from '../utils/utils';
import { ProviderModule } from './provider/provider.module';

@Module({
  imports: [ProviderModule],
  controllers: [],
  providers: [NestLangchainService],
  exports: [NestLangchainService],
})
export class NestLangChainModule {
  static forRoot() {
    return {
      module: NestLangChainModule,
      providers: [NestLangchainService],
      exports: [NestLangchainService],
    };
  }

  static async registerAsync(
    options: NestLangchainModuleAsyncOptions
  ): Promise<DynamicModule> {
    const createProviders = this.createAsyncProviders(options);
    return {
      module: NestLangChainModule,
      imports: [...(options?.imports ?? [])],
      providers: [
        ...createProviders,
        {
          provide: NEST_LANGCHAIN_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        {
          provide: NestLangchainOptionsSupplement.NEST_LANGCHAIN_SERVICE,
          useClass: NestLangchainService,
        },
      ],
      exports: [
        NEST_LANGCHAIN_MODULE_ID,
        NEST_LANGCHAIN_MODULE_OPTIONS,
        NestLangchainOptionsSupplement.NEST_LANGCHAIN_SERVICE,
      ],
    };
  }

  private static createAsyncProviders(
    options: NestLangchainModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<NestLangchainOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass: useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: NestLangchainModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NEST_LANGCHAIN_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<NestLangchainOptionsFactory>,
    ];

    return {
      provide: NEST_LANGCHAIN_MODULE_OPTIONS,
      useFactory: async (optionsFactory: NestLangchainOptionsFactory) =>
        optionsFactory.createNestLangchainOptions(),
      inject,
    };
  }
}
