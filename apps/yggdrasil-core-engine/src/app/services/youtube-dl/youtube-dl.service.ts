import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { join, dirname, basename, extname } from 'path';
import * as fs from 'fs';
import { exec } from 'youtube-dl-exec';
import { OnEvent } from '@nestjs/event-emitter';

export interface DownloadAudioEvent {
  audioFilePath: string;
  title: string;
  channel: string;
  metaData: {
    id: string;
    channelId: string;
    channelUrl: string;
    duration: number;
  };
}

@Injectable({
  scope: Scope.TRANSIENT,
})
export class YoutubeDlService {
  async downloadAudio(url: string): Promise<DownloadAudioEvent> {
    const uuid = randomUUID();
    const output = join(
      __dirname,
      '..',
      '..',
      'downloads',
      'audio',
      `${uuid}.mp3`
    );

    // get info video time
    const info = await exec(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      addHeader: ['referer:youtube.com', `user-agent:googlebot-${uuid}`],
    });

    // if video is longer than 1 hour 20 minutes, skip
    const jsonData = JSON.parse(info.stdout);
    if (jsonData.duration > 4801) {
      throw new Error('Video is too long');
    }

    await exec(url, {
      audioFormat: 'mp3',
      audioQuality: 0, // best
      format: 'bestaudio/best',
      // save to downloads folder
      postprocessorArgs: '-x',
      output,
      referer: url,
    });

    return {
      audioFilePath: output,
      title: jsonData.title,
      channel: jsonData.channel,
      metaData: {
        id: jsonData.id,
        channelId: jsonData.channel_id,
        channelUrl: jsonData.channel_url,
        duration: jsonData.duration,
      },
    };
  }

  async getIdFromUrl(url: string): Promise<string> {
    const regex = /(youtu\.be\/|youtube\.com\/watch\?v=)([^\s]+)/;
    const found = url.match(regex);
    return found && found[2] ? found[2] : undefined;
  }
}
