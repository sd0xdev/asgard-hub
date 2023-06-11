import { Injectable } from '@nestjs/common';
import { ChatGPTChant } from '@asgard-hub/utils';
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse,
} from 'openai';
import { CreateCompletionResponseUsageForRPC } from '../../chatgpt/interface/create.completion.response.usage.for.rpc.interface';
import { createReadStream } from 'fs';
import { setupRequestMessage } from '@asgard-hub/utils';
import { Observable } from 'rxjs';
import { IncomingMessage } from 'node:http';
import { ConfigService } from '@nestjs/config';
import {
  LoggerHelperService,
  TrackerLoggerCreator,
} from '@asgard-hub/nest-winston';
import { NestOpenAIClientService } from '@sd0x/nest-openai-client';

@Injectable()
export class ChatGPTGateWayService {
  protected trackerLoggerCreator: TrackerLoggerCreator;

  constructor(
    loggerHelperService: LoggerHelperService,
    protected readonly configService: ConfigService,
    private readonly nestOpenAIClientService: NestOpenAIClientService
  ) {
    this.trackerLoggerCreator = loggerHelperService.create(
      ChatGPTGateWayService.name
    );
  }

  generalMessages(
    chant: ChatGPTChant,
    customPrompt?: { title: string; linguisticFraming: string }
  ): ChatCompletionRequestMessage[] {
    const { log, error } = this.trackerLoggerCreator.create('GeneralMessages');
    log(`called ${chant}`);

    const messageChant = setupRequestMessage(chant, customPrompt);
    return messageChant.messages;
  }

  // get response from gpt-3.5-turbo
  async getGPTResponse(
    messages: ChatCompletionRequestMessage[],
    user: string,
    isUseAzure = false,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<CreateChatCompletionResponse> {
    const { log, verbose, error } =
      this.trackerLoggerCreator.create('GeneralMessages');
    log(`getGPTResponse: user: ${user}`);
    log(`getGPTResponse: messages:`);
    messages?.forEach((m) =>
      verbose(`${m.role}: ${m.content}, ${m?.name ?? 'unknown'}`)
    );
    log(`temperature: ${options?.temperature}`);

    if (!messages) {
      return undefined;
    }

    const openai = isUseAzure
      ? this.nestOpenAIClientService.getAzureOpenAIApiClient()
      : this.nestOpenAIClientService.getOpenAIApiClient();

    const model = isUseAzure ? 'gpt-35-turbo' : 'gpt-3.5-turbo';

    const response = await openai.createChatCompletion({
      model,
      messages: messages,
      user: user,
      temperature: options?.temperature,
    });

    log(`id: ${response.data?.id}`);
    log(`model: ${response.data?.model}`);
    log(`created: ${response.data?.created}`);
    log(`total token: ${response.data?.usage?.total_tokens}`);

    const data = response.data;

    const usage: CreateCompletionResponseUsageForRPC = {
      ...data.usage,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
    };

    data.usage = usage;

    return data;
  }

  async getGPTResponseSteam(
    messages: ChatCompletionRequestMessage[],
    user: string,
    isUseAzure = false,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<
    Observable<{
      responses: CreateChatCompletionResponse[];
    }>
  > {
    const { log, error } = this.trackerLoggerCreator.create('GeneralMessages');
    log(`getGPTResponse: user: ${user}`);
    log(`getGPTResponse: messages:`);
    log(messages);
    log(`temperature: ${options?.temperature}`);

    const openai = isUseAzure
      ? this.nestOpenAIClientService.getAzureOpenAIApiClient()
      : this.nestOpenAIClientService.getOpenAIApiClient();

    const model = isUseAzure ? 'gpt-35-turbo' : 'gpt-3.5-turbo';

    const completion = await openai.createChatCompletion(
      {
        model,
        messages: messages,
        user: user,
        temperature: options?.temperature,
        stream: true,
        max_tokens: options?.maxTokens,
      },
      { responseType: 'stream' }
    );

    const stream = completion.data as unknown as IncomingMessage;

    return new Observable((observer) => {
      stream.on('data', (chunk) => {
        const payloads = chunk.toString().split('\n\n');

        const deltas: CreateChatCompletionResponse[] = [];
        for (const payload of payloads) {
          if (payload.includes('[DONE]')) return;
          if (payload.startsWith('data:')) {
            const data = payload.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
            try {
              const delta: CreateChatCompletionResponse = JSON.parse(
                data.trim()
              );
              deltas.push(delta);
            } catch (e) {
              error(`Error with JSON.parse and ${payload}.\n${e}`);
            }
          }
        }

        observer.next({
          responses: deltas,
        });
      });

      stream.on('end', () => {
        observer.complete();
      });

      stream.on('error', (err) => {
        observer.error(err);
      });
    });
  }

  // get response from completion api
  async getCompletionResponse(prompt: string, model: string) {
    console.debug(prompt);

    const openai = this.nestOpenAIClientService.getOpenAIApiClient();

    const response = await openai.createCompletion({
      prompt: prompt,
      model: model,
      temperature: 0,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.data;
  }

  // get response from transcription api by audio file
  async getTranscriptionResponse(audioFilePath: string) {
    const openai = this.nestOpenAIClientService.getOpenAIApiClient();
    const file = createReadStream(audioFilePath);

    const response = await openai.createTranscription(
      file as unknown as File,
      'whisper-1'
    );

    return response.data;
  }
}
