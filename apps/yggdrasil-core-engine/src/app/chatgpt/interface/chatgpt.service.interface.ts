import { ChatCompletionRequestMessage } from 'openai';
import { ChatGPTChant } from '@asgard-hub/utils';

export interface GeneralMessagesOptions {
  chant: ChatGPTChant;
  customPrompt?: {
    title: string;
    linguisticFraming: string;
  };
}

export interface GPTRequestOptions {
  useStream?: boolean;
  maxTokens?: number;
}

export interface GPTResponseOptions {
  contents: ChatCompletionRequestMessage[];
  user: string;
  temperature?: number;
  options?: GPTRequestOptions;
}

export interface YTSummaryOptions {
  url: string;
  user: string;
  isForced: boolean;
  options?: SummaryOptions;
}

export interface URLDocSummaryOptions {
  url: string;
  user: string;
  isForced: boolean;
  dataSourceType: string;
  options?: SummaryOptions;
}

export interface SummaryOptions {
  userExpectation: string;
}

export interface CompletionResponseOptions {
  prompt: string;
  model: string;
}
