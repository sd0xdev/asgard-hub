import { Injectable } from '@nestjs/common';
import { YTChatGPTService } from '../yt-chat-gpt/yt-chat-gpt.service';
import { PDFChatGPTService } from '../pdf-chat-gpt/pdf-chat-gpt.service';
import { TXTChatGptService as TXTChatGptService } from '../txt-chat-gpt/txt-chat-gpt.service';
import { URLChatGPTService } from '../url-chat-gpt/url-chat-gpt.service';
import { ImageChatGptService } from '../image-chat-gpt/image-chat-gpt.service';
import { AudioChatGPTService } from '../audio-chat-gpt/audio-chat-gpt.service';

@Injectable()
export class GatewayService {
  constructor(
    private readonly ytService: YTChatGPTService,
    private readonly pdfService: PDFChatGPTService,
    private readonly txtService: TXTChatGptService,
    private readonly urlService: URLChatGPTService,
    private readonly imageService: ImageChatGptService,
    private readonly audioService: AudioChatGPTService
  ) {}

  getFeatureService<T>(feature: GatewayFeature): T {
    switch (feature) {
      case GatewayFeature.YT:
        return this.ytService as T;
      case GatewayFeature.PDF:
        return this.pdfService as T;
      case GatewayFeature.TXT:
        return this.txtService as T;
      case GatewayFeature.URL:
        return this.urlService as T;
      case GatewayFeature.IMAGE:
        return this.imageService as T;
      case GatewayFeature.Audio:
        return this.audioService as T;
      default:
        return undefined;
    }
  }
}

export enum GatewayFeature {
  YT = 'yt',
  PDF = 'pdf',
  TXT = 'txt',
  URL = 'url',
  IMAGE = 'image',
  Audio = 'audio',
}
