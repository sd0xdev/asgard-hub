import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { NestWinstonModuleOptions } from '../interface/nest-winston-module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NEST_WINSTON_MODULE_OPTIONS } from '../constants/nest-winston.constants';

@Injectable()
export class AsgardLogger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly loggerService: LoggerService,
    @Inject(NEST_WINSTON_MODULE_OPTIONS)
    private readonly options: NestWinstonModuleOptions
  ) {}

  /**
   * 為訊息冠上領域名稱前綴與追蹤 Id
   * @param message 訊息
   */
  private createMessage = (message: unknown) => {
    if (message?.constructor == Object || message?.constructor == Array) {
      message = JSON.stringify(message, null, 4);
    }

    return message;
  };

  log = (message: unknown, context?: string) => {
    this.loggerService.log(this.createMessage(message), context);
  };

  error = (message: unknown, trace?: string, context?: Error) => {
    this.loggerService.error(this.createMessage(message), trace, context);
  };

  warn = (message: unknown, context?: string) => {
    this.loggerService.warn(this.createMessage(message), context);
  };

  debug? = (message: unknown, context?: string) => {
    this.loggerService.debug &&
      this.loggerService.debug(this.createMessage(message), context);
  };

  verbose? = (message: unknown, context?: string) => {
    this.loggerService.verbose &&
      this.loggerService.verbose(this.createMessage(message), context);
  };
}
