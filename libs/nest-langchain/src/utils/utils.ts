import { ChatOpenAICallOptions } from 'langchain/chat_models/openai';
import { ChainValues } from 'langchain/schema';
import { uid } from 'uid';
import { BaseLangChainPrompt } from '../lib/interface';

export const randomStringGenerator = () => uid(21);

export function createInstance<
  U extends ChainValues & ChatOpenAICallOptions
>(type: { new (): BaseLangChainPrompt<U> }): BaseLangChainPrompt<U> {
  return new type();
}
