import { Inject, Injectable } from '@nestjs/common';
import {
  NestLangchainOptionsSupplement,
  NestLangchainService,
} from '@sd0x/nest-langchain';
import {
  TranslateToEnglishPrompt,
  TranslateToEnglishPromptParams,
  TranslateToEnglishPromptResponse,
} from '../../chatgpt/prompt/translate-to-english.prompt';
import { AsgardLogger, AsgardLoggerSupplement } from '@asgard-hub/nest-winston';
import { Timeout } from '@nestjs/schedule';

@Injectable()
export class LangChainService {
  @Inject(NestLangchainOptionsSupplement.NEST_LANGCHAIN_SERVICE)
  private readonly nestLangchainService: NestLangchainService;

  @Inject(AsgardLoggerSupplement.LOGGER_HELPER_SERVICE)
  private readonly asgardLogger: AsgardLogger;

  @Timeout(1000)
  async getFunctionChainResponse() {
    const result = await this.nestLangchainService.getFunctionChainResponse<
      TranslateToEnglishPromptResponse,
      TranslateToEnglishPromptParams
    >({
      input: {
        userInput: '這是一條測試訊息',
      },
      langChainPromptType: TranslateToEnglishPrompt,
    });

    this.asgardLogger.log(result.translationResult);

    return result.translationResult;
  }
}
