import { Inject, Injectable } from '@nestjs/common';
import {
  ChatOpenAI,
  ChatOpenAICallOptions,
} from 'langchain/chat_models/openai';
import { NestLangChainAIChatOAuth } from './interface';
import { ChainValues } from 'langchain/schema';
import { LangChainProvider } from './provider/langchain/langchain.provider';
import { Callbacks } from 'langchain/callbacks';
import { BaseLangChainPrompt } from './interface/base-prompt';
import { NEST_LANGCHAIN_MODULE_OPTIONS } from './constants/nest.openai.client.constants';

export class functionChainOption {
  callbacks?: Callbacks;
  tags?: string[];
  verbose?: boolean;
}

export interface NestLangChainParams<T> {
  input?: T;
  langChainPromptType: { new (): BaseLangChainPrompt<T> };
  options?: functionChainOption;
}

export interface FunctionChainResponse<T> {
  output: T;
}

function createInstance<U>(type: {
  new (): BaseLangChainPrompt<U>;
}): BaseLangChainPrompt<U> {
  return new type();
}

@Injectable()
export class NestLangchainService {
  @Inject(NEST_LANGCHAIN_MODULE_OPTIONS)
  private readonly nestLangChainAIChatOAuth!: NestLangChainAIChatOAuth;

  @Inject()
  private readonly langchainProvider!: LangChainProvider;

  async getFunctionChainResponse<
    T = ChainValues,
    U extends ChainValues & ChatOpenAICallOptions = ChainValues &
      ChatOpenAICallOptions
  >(params: NestLangChainParams<U>): Promise<T> {
    // setup chatOpenAI
    const llm = this.getChatOpenAI({
      ...this.nestLangChainAIChatOAuth,
    });

    const langChainPrompt = createInstance<U>(params.langChainPromptType);

    const chain = this.langchainProvider.createStructuredOutputChainFromZod(
      langChainPrompt.getZodSchema(),
      {
        prompt: langChainPrompt.generatePrompt(),
        llm,
        verbose: params?.options?.verbose ?? false,
        tags: params?.options?.tags,
        callbacks: params?.options?.callbacks,
      }
    );

    const result = (await chain.call(
      langChainPrompt.generateInputVariables(params.input)
    )) as FunctionChainResponse<T>;

    return {
      ...result.output,
    };
  }

  getChatOpenAI(params: NestLangChainAIChatOAuth) {
    return new ChatOpenAI({
      ...params,
    });
  }
}
