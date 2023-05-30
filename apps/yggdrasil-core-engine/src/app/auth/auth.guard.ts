import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';
import {
  TrackerLoggerCreator,
  LoggerHelperService,
} from '@asgard-hub/nest-winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly trackerLoggerCreator: TrackerLoggerCreator;
  constructor(
    loggerHelperService: LoggerHelperService,
    private readonly configService: ConfigService
  ) {
    this.trackerLoggerCreator = loggerHelperService.create(AppService.name);
  }
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const trackerLogger = this.trackerLoggerCreator.create('auth-guard');
    const metadata = context.getArgByIndex(1); // metadata
    if (!metadata) {
      trackerLogger.warn('metadata is undefined');
      return false;
    }
    const apiKey = metadata.get('authorization')[0];
    // TODO: fix this
    return apiKey === this.configService.get('rpcApiKey');
  }
}
