import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { MessageService } from '../services/message/message.service';
import { DataSourceType } from '../interface/data-source-type.enum';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @EventPattern('chatbot:discord:chat')
  async handleChatCreatedEvent(data: any) {
    await this.messageService.createResponse(data);
  }

  @EventPattern('chatbot:discord:chat:url:docs')
  async handleUrlDocsCreatedEvent(data: any) {
    if (data.type === DataSourceType.URL) {
      return await this.messageService.createUrlContentResponse(
        data.message,
        data.type
      );
    }

    return await this.messageService.createUrlDocsResponse(
      data.message,
      data.type
    );
  }

  @MessagePattern('chatbot:discord:chat:audio:transcription')
  @EventPattern('chatbot:discord:chat:audio:transcription')
  async handleAudioTranscriptionCreatedEvent(data: any) {
    return await this.messageService.createAudioTranscriptionResponse(data);
  }

  @EventPattern('chatbot:discord:chat:reply')
  async handleChatReplyCreatedEvent(data: any) {
    return await this.messageService.sendMessageReply(data.text, data.message);
  }

  @EventPattern('chatbot:discord:chat:url:youtube')
  async handleUrlYoutubeCreatedEvent(data: any) {
    return await this.messageService.createYoutubeResponse(data);
  }
}
