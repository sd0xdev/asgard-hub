import { ChatOpenAICallOptions } from 'langchain/chat_models/openai';
import { ChainValues } from 'langchain/schema';
import { Callbacks } from 'langchain/callbacks';
import { BaseLangChainPrompt } from './base-prompt';

export class functionChainOption {
  callbacks?: Callbacks;
  tags?: string[];
  verbose?: boolean;
}

export interface NestLangChainParams<
  T extends ChainValues & ChatOpenAICallOptions
> {
  input?: T;
  langChainPromptType: { new (): BaseLangChainPrompt<T> };
  options?: functionChainOption;
}

export interface FunctionChainResponse<T> {
  output: T;
}
