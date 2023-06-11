import { CreateCompletionResponseUsage } from 'openai';

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
