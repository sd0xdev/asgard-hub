import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { ConfigService } from '@nestjs/config';
import { ConfigPath, IAppConfig } from '../config/app.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly asgardLogger: AsgardLogger,
    private readonly configService: ConfigService
  ) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const metadata = context.getArgByIndex(1); // metadata
    if (!metadata) {
      this.asgardLogger.warn('metadata is undefined');
      return false;
    }
    const apiKey = metadata.get('authorization')[0];
    // TODO: fix this
    return (
      apiKey ===
      this.configService.get<IAppConfig>(ConfigPath.APP).serviceApiKey
    );
  }
}
