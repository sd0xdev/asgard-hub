import { Inject, Injectable } from '@nestjs/common';
import {
  BaseLangChainPrompt,
  NestLangchainOptionsSupplement,
  NestLangchainService,
} from '@sd0x/nest-langchain';
import { AsgardLogger, AsgardLoggerSupplement } from '@asgard-hub/nest-winston';
import { ChatOpenAICallOptions } from 'langchain/chat_models/openai';
import { ChainValues } from 'langchain/schema';

@Injectable()
export class LangChainService {
  @Inject(NestLangchainOptionsSupplement.NEST_LANGCHAIN_SERVICE)
  private readonly nestLangchainService: NestLangchainService;

  @Inject(AsgardLoggerSupplement.LOGGER_HELPER_SERVICE)
  private readonly asgardLogger: AsgardLogger;

  async getFunctionChainResponse<T extends ChainValues & ChatOpenAICallOptions>(
    userInput: string,
    langChainPromptType: { new (): BaseLangChainPrompt<T> }
  ) {
    return this.nestLangchainService.getFunctionChainResponse<T>({
      input: {
        userInput,
      },
      langChainPromptType,
    });
  }

  async getGeneralChatResponse(userInput: string) {
    const message = await this.nestLangchainService.getGeneralChatResponse(
      userInput
    );

    return {
      metaOutput: {
        ...message,
      },
      response: message.content,
    };
  }
}
