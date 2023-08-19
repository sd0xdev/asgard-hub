import { Module } from '@nestjs/common';
import { OpenAIProvider } from './open-ai/open-ai';

@Module({
  providers: [OpenAIProvider],
  exports: [OpenAIProvider],
})
export class ProviderModule {}
