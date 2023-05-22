import { Inject, Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { NestOpenAIClientModuleOptions } from './interface/nest.openai.client-module';
import { NEST_OPENAI_CLIENT_MODULE_OPTIONS } from './constants/nest.openai.client.constants';
import {
  NestOpenAIApi,
  NestOpenAIConfiguration,
} from './client/nest.openai.api';

@Injectable()
export class NestOpenAIClientService {
  constructor(
    @Inject(NEST_OPENAI_CLIENT_MODULE_OPTIONS)
    private readonly options: NestOpenAIClientModuleOptions
  ) {}

  /**
   * Get the OpenAI API client
   */
  public getOpenAIApiClient(apiKey?: string) {
    const currentApiKey = apiKey ?? this.options?.apiKey;

    if (!currentApiKey) {
      throw new Error('OpenAI API key is required');
    }

    return new OpenAIApi(new Configuration({ apiKey: currentApiKey }));
  }

  /**
   * Get the Azure OpenAI API client
   */
  public getAzureOpenAIApiClient(
    apiKey?: string,
    endpoint?: string,
    // deploymentName is optional, if you don't set it, you need to set it in the request parameter
    deploymentName?: string
  ) {
    return new NestOpenAIApi(
      new NestOpenAIConfiguration({
        azure: {
          apiKey: apiKey ?? this.options?.azure?.apiKey,
          endpoint: endpoint ?? this.options?.azure?.endpoint,
          deploymentName: deploymentName ?? this.options?.azure?.deploymentName,
        },
      })
    );
  }
}
