import { ChatGPTChant } from './chatgpt-chant.enum';
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse,
  CreateCompletionResponse,
  CreateTranscriptionResponse,
} from 'openai';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

interface GeneralMessagesOptions {
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

interface GPTResponseOptions {
  contents: ChatCompletionRequestMessage[];
  user: string;
  temperature?: number;
  options?: GPTRequestOptions;
}

interface CompletionResponseOptions {
  prompt: string;
  model: string;
}
interface GeneralMessagesResponse {
  messages: ChatCompletionRequestMessage[];
}

interface CreateChatCompletionResponses {
  responses: CreateChatCompletionResponse[];
}

export interface AudioChatOptions {
  url: string;
  fileExtension: string;
}

export interface PartCreateTranscriptionResponse
  extends CreateTranscriptionResponse {
  partNumber: number;
}

interface CreateChatTranscriptionResponses {
  responses: PartCreateTranscriptionResponse[];
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

export interface ChatGPTService {
  generalMessages(
    options: GeneralMessagesOptions,
    metadata?: Metadata
  ): Observable<GeneralMessagesResponse>;

  fetchGgtResponse(
    options: GPTResponseOptions,
    metadata?: Metadata
  ): Observable<CreateChatCompletionResponse>;

  fetchGgtResponseStream(
    options: GPTResponseOptions,
    metadata?: Metadata
  ): Observable<{
    responses: CreateChatCompletionResponse[];
  }>;

  getCompletionResponse(
    options: CompletionResponseOptions,
    metadata?: Metadata
  ): Observable<CreateCompletionResponse>;

  fetchYoutubeSummary(
    options: YTSummaryOptions,
    metadata?: Metadata
  ): Observable<CreateChatCompletionResponses>;

  fetchUrlDocSummary(
    options: URLDocSummaryOptions,
    metadata?: Metadata
  ): Observable<CreateChatCompletionResponses>;

  fetchAudioTranscription(
    options: AudioChatOptions,
    metadata?: Metadata
  ): Observable<CreateChatTranscriptionResponses>;
}

export interface ChatOptions {
  userInput: string;
  key?: string;
}

export interface ChatCompletionResponse {
  response: string;
}

export interface LLMAIService {
  chat(
    options: ChatOptions,
    metadata?: Metadata
  ): Observable<ChatCompletionResponse>;
}
