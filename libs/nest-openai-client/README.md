# nest-openai-client

This is a client for the [OpenAI API](https://beta.openai.com/docs/api-reference/introduction) that is used by the [Nest.js](https://nestjs.com/) framework.

[x] OpenAI API
[x] Azure OpenAI API
[x] Nest.js

## Installation

```bash
npm install @sd0x/nest-openai-client
```

## Usage

```typescript
import { NestOpenAIClientModule } from '@sd0x/nest-openai-client';
...
NestOpenAIClientModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<IOpenAIConfig>(ConfigPath.OpenAI).apiKey,
        azure: configService.get<IAzureOpenAIConfig>(ConfigPath.AzureOpenAI)
          .enable
          ? {
              apiKey: configService.get<IAzureOpenAIConfig>(
                ConfigPath.AzureOpenAI
              ).apiKey,
              endpoint: configService.get<IAzureOpenAIConfig>(
                ConfigPath.AzureOpenAI
              ).endpoint,
              deploymentName: configService.get<IAzureOpenAIConfig>(
                ConfigPath.AzureOpenAI
              ).deploymentName,
            }
          : undefined,
      }),
      inject: [ConfigService],
    }),
```

```typescript
// in service

constructor(
    private readonly nestOpenAIClientService: NestOpenAIClientService
  ) {}
...
async getData() {
    const result = await this.nestOpenAIClientService
      .getOpenAIApiClient()
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            content: "Hello, I'm a human",
            role: 'user',
          },
        ],
      });

    return result.data;
  }

  async getDataFromAzure() {
    const result = await this.nestOpenAIClientService
      .getAzureOpenAIApiClient()
      .createChatCompletion({
        model: process.env.AZURE_OPENAI_MODEL_NAME,
        messages: [
          {
            content: "Hello, I'm a human",
            role: 'user',
          },
        ],
      });

    return result.data;
  }
```
