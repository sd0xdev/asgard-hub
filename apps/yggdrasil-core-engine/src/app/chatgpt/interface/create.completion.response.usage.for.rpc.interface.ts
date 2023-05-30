import {
  CreateChatCompletionResponse,
  CreateCompletionResponseUsage,
  CreateTranscriptionResponse,
} from 'openai';

export interface PartCreateChatCompletionResponse
  extends CreateChatCompletionResponse {
  partNumber: number;
}

export interface PartCreateTranscriptionResponse
  extends CreateTranscriptionResponse {
  partNumber: number;
}

export class CreateCompletionResponseUsageForRPC
  implements CreateCompletionResponseUsage
{
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
