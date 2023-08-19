import { ChatOpenAICallOptions } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';
import { z } from 'zod';
export interface BaseLangChainPrompt<
  T extends ChainValues & ChatOpenAICallOptions
> {
  generatePrompt(): ChatPromptTemplate;
  getZodSchema(): z.AnyZodObject;
  generateInputVariables(params?: T): T;
}
