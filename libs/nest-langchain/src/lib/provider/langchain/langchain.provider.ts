import { Injectable } from '@nestjs/common';
import {
  StructuredOutputChainInput,
  createStructuredOutputChainFromZod,
} from 'langchain/chains/openai_functions';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { LLMChain } from 'langchain/chains';
import { z } from 'zod';
import { NestLangChainAIChatOAuth } from '../../interface';
import { BaseFunctionCallOptions } from 'langchain/base_language';
import { BaseChatModel } from 'langchain/chat_models/base';

@Injectable()
export class LangChainProvider {
  createStructuredOutputChainFromZod<T extends z.AnyZodObject>(
    zodSchema: T,
    input: Omit<StructuredOutputChainInput, 'outputSchema'>
  ): LLMChain<
    T,
    BaseChatModel<BaseFunctionCallOptions> | ChatOpenAI<BaseFunctionCallOptions>
  > {
    return createStructuredOutputChainFromZod(zodSchema, input);
  }

  getChatOpenAI(params: NestLangChainAIChatOAuth) {
    return new ChatOpenAI({
      ...params,
    });
  }
}
