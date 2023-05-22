import { Injectable } from '@nestjs/common';
import { NestOpenAIClientService } from '@sd0x/nest-openai-client';

@Injectable()
export class AppService {
  constructor(
    private readonly nestOpenAIClientService: NestOpenAIClientService
  ) {}

  async getData() {
    const result = await this.nestOpenAIClientService
      .getOpenAIApiClient()
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            content: "Hello, I'm a human",
            role: 'user',
          },
        ],
      });

    return result.data;
  }

  async getDataFromAzure() {
    const result = await this.nestOpenAIClientService
      .getAzureOpenAIApiClient()
      .createChatCompletion({
        model: process.env.AZURE_OPENAI_MODEL_NAME,
        messages: [
          {
            content: "Hello, I'm a human",
            role: 'user',
          },
        ],
      });

    return result.data;
  }
}
