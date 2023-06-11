import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { YoutubeDlService } from '../youtube-dl/youtube-dl.service';
import { promises } from 'fs';
import { basename, dirname, extname, join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { ConfigPath, IAppConfig } from '../../config/app.config';

export enum DownloadFileType {
  MP3 = 'mp3',
  OGG = 'ogg',
  WAV = 'wav',
  TXT = 'txt',
  PDF = 'pdf',
}

@Injectable()
export class DownloadService {
  constructor(
    private readonly httpService: HttpService,
    private readonly youtubeDlService: YoutubeDlService,
    private readonly configService: ConfigService
  ) {}

  async downloadFileSaveAsPath(url: string, fileType: string): Promise<string> {
    //TODO: set up cache for file
    const path = join(
      resolve(
        __dirname,
        '..',
        '..',
        '..',
        this.configService.get<IAppConfig>(ConfigPath.APP).tempDirPath,
        `${randomUUID()}.${fileType}`
      )
    );

    const buffer = await this.downloadFileOfBuffer(url);
    await promises.writeFile(path, buffer);
    return path;
  }

  async downloadFileOfStr(url: string): Promise<string> {
    const buffer = await this.downloadFileOfBuffer(url);
    return buffer.toString('utf-8');
  }

  async downloadFileOfBuffer(url: string): Promise<Buffer> {
    const result = await this.getArraybuffer(url);
    const buffer = Buffer.from(result.data);
    return buffer;
  }

  async getYoutubeIdFromUrl(url: string): Promise<string> {
    return await this.youtubeDlService.getIdFromUrl(url);
  }

  async downloadYoutubeOfAudio(url: string) {
    return await this.youtubeDlService.downloadAudio(url);
  }

  @OnEvent('delete.files')
  async deleteAudio(payload: { paths: string[] }) {
    for (const filePath of payload?.paths ?? []) {
      const directory = dirname(filePath);
      const fileName = basename(filePath, extname(filePath));
      const regex = new RegExp(`${fileName}.*`); // regular expression to match files with the same name
      const files = await promises.readdir(directory);
      for await (const file of files) {
        if (regex.test(file)) {
          try {
            await promises.unlink(join(directory, file));
          } catch (e) {
            console.warn(`Failed to delete ${file}`);
          }
        }
      }
    }
  }

  private async getArraybuffer(url: string) {
    const response = this.httpService.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });

    const result = await lastValueFrom(response);
    return result;
  }
}
