import { Inject, Injectable } from '@nestjs/common';
import { FunctionSelection } from '@asgard-hub/utils';
import { AsgardLogger, AsgardLoggerSupplement } from '@asgard-hub/nest-winston';
import { LangChainService } from '../langchain/langchain.service';
import { ChatOptions } from '../../../controllers/llm-ai/llm-ai.controller';
import { TranslateToEnglishPrompt } from '../../prompt/translate-to-english.prompt';
import { Subject, of, switchMap } from 'rxjs';
import { randomUUID } from 'crypto';

export interface GrpcResponse<T = unknown> {
  id: string;
  timestamp: number;
  uuid: string;
  event: string;
  data: string | T;
}

@Injectable()
export class LLMAIService {
  @Inject(AsgardLoggerSupplement.LOGGER_HELPER_SERVICE)
  private readonly asgardLogger: AsgardLogger;
  @Inject()
  private readonly langChainService: LangChainService;
  chat(data: ChatOptions, subject?: Subject<GrpcResponse>) {
    return of(this.promptSelect(data.key)).pipe(
      switchMap((prompt) => {
        subject?.next({
          id: 'prompt',
          timestamp: Date.now(),
          uuid: randomUUID(),
          event: 'notification',
          data: prompt?.name ?? FunctionSelection.generalChat,
        });
        return of(prompt);
      }),
      switchMap(async (type) => {
        if (!type) {
          return await this.langChainService.getGeneralChatResponse(
            data.userInput
          );
        } else {
          return await this.langChainService.getFunctionChainResponse(
            data.userInput,
            type
          );
        }
      }),
      switchMap((response) => {
        subject?.next({
          id: 'response',
          timestamp: Date.now(),
          uuid: randomUUID(),
          event: 'message',
          data: JSON.stringify(response),
        });
        this.asgardLogger.debug(response);
        return of(subject.complete());
      })
    );
  }

  private promptSelect(key: FunctionSelection) {
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
