import { BaseDataSourceAdapter } from './interface/data-source-adapter.interface';
import { DataSourceType } from './interface/data-source-type.enum';
import { DownloadService } from '../../services/download-service/download-service.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TXTAdapter extends BaseDataSourceAdapter {
  constructor(private readonly downloadService: DownloadService) {
    super(DataSourceType.TXT);
  }

  getData(path: string): Promise<string> {
    return this.downloadService.downloadFileOfStr(path);
  }
}
