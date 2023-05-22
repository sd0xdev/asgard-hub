import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { NestWinstonModuleOptions } from '../interface/nest-winston-module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NEST_WINSTON_MODULE_OPTIONS } from '../constants/nest-winston.constants';

@Injectable()
export class LoggerHelperService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly loggerService: LoggerService,
    @Inject(NEST_WINSTON_MODULE_OPTIONS)
    private readonly options: NestWinstonModuleOptions
  ) {}

  /**
   * 建立有冠上領域名稱的 `Logger`
   * @param name 領域名稱，如：CopAccount、Image 等等
   */
  create(name?: string): TrackerLoggerCreator {
    return new TrackerLoggerCreator(this.loggerService, name);
  }
}

/**
 * 封裝 `trackingId` 的建立者。
 * 此類別會先初步封裝來自外部的 `LoggerService` 以及領域名稱
 */
export class TrackerLoggerCreator {
  /**
   * @param loggerService 來自外部的 `LoggerService`
   * @param name 領域名稱，如：CopAccount、Image 等等
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly name?: string
  ) {}

  create(trackingId: string) {
    return new TrackerLogger(
      this.loggerService,
      this.name ?? 'general',
      trackingId
    );
  }
}

/**
 * 原則上經由 `TrackerLoggerCreator` 帶入 `trackingId` 並建成可用的 `Logger`
 */
export class TrackerLogger implements LoggerService {
  /**
   * @param loggerService 來自外部的 LoggerService
   * @param name 領域名稱，如：CopAccount、Image 等等
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly name: string,
    private readonly _trackingId: string
  ) {}

  get trackingId(): string {
    return this._trackingId;
  }

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
    this.loggerService.log(
      this.createMessage(message),
      this.trackingId,
      context
    );
  };

  error = (message: unknown, trace?: string, context?: Error) => {
    this.loggerService.error(
      this.createMessage(message),
      this.trackingId,
      trace,
      context
    );
  };

  warn = (message: unknown, context?: string) => {
    this.loggerService.warn(
      this.createMessage(message),
      this.trackingId,
      context
    );
  };

  debug? = (message: unknown, context?: string) => {
    this.loggerService.debug &&
      this.loggerService.debug(
        this.createMessage(message),
        this.trackingId,
        context
      );
  };

  verbose? = (message: unknown, context?: string) => {
    this.loggerService.verbose &&
      this.loggerService.verbose(
        this.createMessage(message),
        this.trackingId,
        context
      );
  };
}
