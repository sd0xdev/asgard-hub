import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigPath } from '../../config/app.config';
import { IAzureOpenAIConfig } from '../../config/azure.openai.config';
import { NestLangChainAIChatOAuth } from '@sd0x/nest-langchain';
import { IOpenAIConfig } from '../../config/open.ai.config';

@Injectable()
export class OpenAIProvider {
  @Inject()
  private readonly configService: ConfigService;

  fetchChatOpenAIInput(temperature = 0): NestLangChainAIChatOAuth {
    const openAIConfig = this.configService.get<IOpenAIConfig>(
      ConfigPath.OpenAI
    );

    const azureOpenAIConfig = this.configService.get<IAzureOpenAIConfig>(
      ConfigPath.AzureOpenAI
    );

    // NOTE: 我們目前預設使用 Azure OpenAI GPT-3.5 Turbo 0613 版本，因為提供了 functions 的功能。
    if (azureOpenAIConfig.enable) {
      // Current API Version: 2023-07-01-preview
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

  get openAIApiKey(): string {
    const openAIConfig = this.configService.get<IOpenAIConfig>(
      ConfigPath.OpenAI
    );
    return openAIConfig.apiKey;
  }
}
