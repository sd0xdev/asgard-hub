import { ErrorReporting } from '@google-cloud/error-reporting';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { resolve } from 'path';

@Injectable()
export class CloudErrorReportingService implements OnApplicationBootstrap {
  private client: ErrorReporting;

  onApplicationBootstrap() {
    this.client = new ErrorReporting({
      keyFilename: resolve(
        __dirname,
        '..',
        '..',
        'static',
        'key-files',
        'general-382514-77d9e50805af.json'
      ),
      reportMode:
        process.env.NODE_ENV === 'production' ? 'production' : 'always',
      serviceContext: {
        service: `yu-gpt-core-${process.env.NODE_ENV}`,
        version: process.env.SERVER_VERSION || 'unknown',
      },
    });
  }

  report(err: Error) {
    try {
      this.client.report(err);
    } catch (err) {
      console.error(err);
    }
  }
}
