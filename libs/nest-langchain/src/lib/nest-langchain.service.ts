import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAICallOptions } from 'langchain/chat_models/openai';
import { NestLangChainAIChatOAuth } from './interface';
import { ChainValues, HumanMessage } from 'langchain/schema';
import { LangChainProvider } from './provider/langchain/langchain.provider';
import { NEST_LANGCHAIN_MODULE_OPTIONS } from './constants/nest.openai.client.constants';
import { createInstance } from '../utils/utils';
import {
  NestLangChainParams,
  FunctionChainResponse,
} from './interface/nest.langchain-params';

@Injectable()
export class NestLangchainService {
  @Inject(NEST_LANGCHAIN_MODULE_OPTIONS)
  private readonly nestLangChainAIChatOAuth!: NestLangChainAIChatOAuth;

  @Inject()
  private readonly langchainProvider!: LangChainProvider;

  async getFunctionChainResponse<
    T extends ChainValues & ChatOpenAICallOptions = ChainValues &
      ChatOpenAICallOptions,
    U extends ChainValues & ChatOpenAICallOptions = ChainValues &
      ChatOpenAICallOptions
  >(
    params: NestLangChainParams<U>
  ): Promise<{
    metaOutput: T;
    message: string;
  }> {
    const llm = this.langchainProvider.getChatOpenAI({
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
      metaOutput: {
        ...result.output,
      },
      message: langChainPrompt.parseOutputToString(result.output),
    };
  }

  async getGeneralChatResponse(userInput: string) {
    const llm = this.langchainProvider.getChatOpenAI({
      ...this.nestLangChainAIChatOAuth,
    });

    return await llm.call([new HumanMessage(userInput)]);
  }
}
