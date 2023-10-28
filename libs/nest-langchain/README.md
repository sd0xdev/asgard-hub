# nest-langchain

This is a client for the [LangChain.js](https://github.com/hwchase17/langchainjs) library.

[x] OpenAI API
[x] Azure OpenAI API

## Installation

```bash
npm install @sd0x/nest-langchain
```

## Usage

```typescript
import { NestLangChainModule } from '@sd0x/nest-langchain';
...
NestLangChainModule.registerAsync({
      imports: [ProviderModule],
      useFactory: (openAIProvider: OpenAIProvider) => ({
        runtime: {
          isDev,
          isStaging,
          isProd,
        },
        langChainAIChatOAuth: openAIProvider.fetchChatOpenAIInput(),
      }),
      inject: [OpenAIProvider],
    }),

// OpenAIProvider
fetchChatOpenAIInput(temperature = 0): NestLangChainAIChatOAuth {
    const openAIConfig = this.configService.get<IOpenAIConfig>(
      ConfigPath.OpenAI
    );

    const azureOpenAIConfig = this.configService.get<IAzureOpenAIConfig>(
      ConfigPath.AzureOpenAI
    );

    if (azureOpenAIConfig.enable) {
      return {
        temperature,
        azureOpenAIApiKey: azureOpenAIConfig.apiKey,
        azureOpenAIApiDeploymentName: azureOpenAIConfig.deploymentName,
        azureOpenAIApiInstanceName: azureOpenAIConfig.instanceName,
        azureOpenAIApiVersion: azureOpenAIConfig.apiVersion,
      };
    } else {
      return {
        temperature,
        openAIApiKey: openAIConfig.apiKey,
        modelName: openAIConfig.modelName,
      };
    }
  }
```
