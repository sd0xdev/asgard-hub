import { Controller, Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { FunctionSelection } from '@asgard-hub/utils';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import {
  GrpcResponse,
  LLMAIService,
} from '../../llm-ai/service/llmai/llmai.service';
import { Observable, Subject, switchMap } from 'rxjs';

export interface ChatOptions {
  userInput: string;
  key?: FunctionSelection;
}

@UseGuards(AuthGuard)
@Controller('llm-ai')
export class LLMAIController {
  @Inject()
  private readonly llmAIService: LLMAIService;

  @GrpcMethod('LLMAIService')
  chat(data: ChatOptions) {
    return this.llmAIService.chat(data);
  }

  @GrpcStreamMethod('LLMAIService', 'ChatStream')
  chatStream(data: Observable<ChatOptions>) {
    const subject = new Subject<GrpcResponse>();

    data
      .pipe(
        switchMap((data) => {
          return this.llmAIService.chat(data, subject);
        })
      )
      .subscribe();

    return subject.asObservable();
  }
}
