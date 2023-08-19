import { Injectable, Scope } from '@nestjs/common';
import {
  StructuredOutputChainInput,
  createStructuredOutputChainFromZod,
} from 'langchain/chains/openai_functions';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { LLMChain } from 'langchain/dist';
import { z } from 'zod';

@Injectable()
export class LangChainProvider {
  createStructuredOutputChainFromZod<T extends z.AnyZodObject>(
    zodSchema: T,
    input: Omit<StructuredOutputChainInput, 'outputSchema'>
  ): LLMChain<any, ChatOpenAI> {
    return createStructuredOutputChainFromZod(zodSchema, input);
  }
}
