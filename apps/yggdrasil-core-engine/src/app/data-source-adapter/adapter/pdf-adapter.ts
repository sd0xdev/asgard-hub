import { Inject, Injectable, Scope } from '@nestjs/common';
import { DownloadService } from '../../services/download-service/download-service.service';
import { BaseDataSourceAdapter } from './interface/data-source-adapter.interface';
import { DataSourceType } from './interface/data-source-type.enum';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class PDFAdapter extends BaseDataSourceAdapter {
  constructor(private readonly downloadService: DownloadService) {
    super(DataSourceType.PDF);
  }

  public async getData(url: string): Promise<string> {
    return await this.fetchPdf(url);
  }

  private async fetchPdf(url: string): Promise<string> {
    const buffer = await this.downloadService.downloadFileOfBuffer(url);
    const pdfContent = await pdfParse(buffer);
    return pdfContent?.text;
  }
}
