import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import winston = require('winston');
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { LoggerHelperService } from './logger-helper.service';
import { NestWinstonOptionsSupplement } from '../interface/nest-winston-options.interface';
import {
  NestWinstonModuleAsyncOptions,
  NestWinstonOptionsFactory,
} from '../interface/nest-winston-module';
import { randomStringGenerator } from '@asgard-hub/utils';
import {
  NEST_WINSTON_MODULE_ID,
  NEST_WINSTON_MODULE_OPTIONS,
} from '../constants/nest-winston.constants';

@Module({
  imports: [],
  providers: [LoggerHelperService],
  exports: [LoggerHelperService],
})
export class NestWinstonModule {
  static async registerAsync(
    options: NestWinstonModuleAsyncOptions
  ): Promise<DynamicModule> {
    const createProviders = this.createAsyncProviders(options);
    return {
      module: NestWinstonModule,
      imports: [
        ...(options?.imports ?? []),
        WinstonModule.forRootAsync({
          useFactory: () => ({
            level: process.env['LOGGER_LEVEL'],
            transports: [
              new winston.transports.Console({
                format: winston.format.combine(
                  winston.format.prettyPrint(),
                  winston.format.splat(),
                  winston.format.simple(),
                  winston.format.timestamp(),
                  nestWinstonModuleUtilities.format.nestLike(
                    process.env['PACKAGE_NAME'] ?? 'general',
                    {
                      colors: true,
                      prettyPrint: true,
                    }
                  )
                ),
                consoleWarnLevels: ['warn'],
                stderrLevels: ['error'],
                debugStdout: process.env['NODE_ENV'] !== 'production',
              }),
            ],
          }),
        }),
      ],
      providers: [
        ...createProviders,
        {
          provide: NEST_WINSTON_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        {
          provide: NestWinstonOptionsSupplement.LOGGER_HELPER_SERVICE,
          useClass: LoggerHelperService,
        },
      ],
      exports: [
        NEST_WINSTON_MODULE_ID,
        NEST_WINSTON_MODULE_OPTIONS,
        NestWinstonOptionsSupplement.LOGGER_HELPER_SERVICE,
      ],
    };
  }

  private static createAsyncProviders(
    options: NestWinstonModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<NestWinstonOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass: useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: NestWinstonModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NEST_WINSTON_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<NestWinstonOptionsFactory>,
    ];

    return {
      provide: NEST_WINSTON_MODULE_OPTIONS,
      useFactory: async (optionsFactory: NestWinstonOptionsFactory) =>
        optionsFactory.createNestWinstonOptions(),
      inject,
    };
  }
}
