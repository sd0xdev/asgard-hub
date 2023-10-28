import { BaseDataSourceAdapter } from './interface/data-source-adapter.interface';
import { DataSourceType } from './interface/data-source-type.enum';
import * as cheerio from 'cheerio';
import { DownloadService } from '../../services/download-service/download-service.service';
import { Injectable } from '@nestjs/common';

export interface URLData {
  title: string;
  content: string;
}

@Injectable()
export class URLAdapter extends BaseDataSourceAdapter {
  constructor(private readonly downloadService: DownloadService) {
    super(DataSourceType.URL);
  }

  public async getData(url: string): Promise<{
    title: string;
    content: string;
  }> {
    return await this.fetchURL(url);
  }

  private async fetchURL(url: string): Promise<URLData> {
    const buffer = await this.downloadService.downloadFileOfBuffer(url);

    const $ = cheerio.load(buffer);
    const title = $('title').text();

    let content = '';

    // Find all div and span elements
    let target = $('main').find('h1, h2, p');

    if (target.length < 10) {
      target = $('body').find('h1, h2, p');
    }

    // Iterate over each div and span element and print its text content
    target.each((i, element) => {
      const text = $(element).text();
      content += text;
    });

    return {
      title,
      content,
    };
  }
}
