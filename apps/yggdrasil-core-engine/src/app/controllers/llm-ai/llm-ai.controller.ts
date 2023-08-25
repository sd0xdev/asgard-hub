import { Controller, Inject, UseGuards } from '@nestjs/common';
import { LangChainService } from '../../llm-ai/lang-chain/lang-chain.service';
import { AuthGuard } from '../../auth/auth.guard';
import { FunctionSelection } from '@asgard-hub/utils';
import { TranslateToEnglishPrompt } from '../../llm-ai/prompt/translate-to-english.prompt';
import { GrpcMethod } from '@nestjs/microservices';
import { AsgardLoggerSupplement, AsgardLogger } from '@asgard-hub/nest-winston';

export interface ChatOptions {
  userInput: string;
  key?: FunctionSelection;
}

@UseGuards(AuthGuard)
@Controller('llm-ai')
export class LLMAIController {
  @Inject(AsgardLoggerSupplement.LOGGER_HELPER_SERVICE)
  private readonly asgardLogger: AsgardLogger;
  @Inject()
  private readonly langChainService: LangChainService;

  @GrpcMethod('LLMAIService')
  async chat(data: ChatOptions) {
    const type = this.promptSelect(data.key);
    let response = '';
    if (!type) {
      response = await this.langChainService.getGeneralChatResponse(
        data.userInput
      );
    } else {
      response = (
        await this.langChainService.getFunctionChainResponse(
          data.userInput,
          type
        )
      ).message;
    }

    this.asgardLogger.debug(response);

    return {
      response,
    };
  }

  promptSelect(key: FunctionSelection) {
    switch (key) {
      case FunctionSelection.generalChat:
        return undefined;
      case FunctionSelection.anyTranslateToEnglish:
        return TranslateToEnglishPrompt;
      default:
        return undefined;
    }
  }
}
