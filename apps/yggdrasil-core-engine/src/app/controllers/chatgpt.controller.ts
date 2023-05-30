import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthGuard } from '../auth/auth.guard';
import { ChatGPTGateWayService } from '../services/chatgpt-gateway-service/chatgpt.service';
import {
  GeneralMessagesOptions,
  GPTResponseOptions,
  CompletionResponseOptions,
  YTSummaryOptions,
  URLDocSummaryOptions,
} from '../chatgpt/interface/chatgpt.service.interface';
import {
  GatewayFeature,
  GatewayService,
} from '../chatgpt/service/gateway-service/gateway-service.service';
import { DataSourceType } from '../data-source-adapter/adapter/interface/data-source-type.enum';
import { ImageChatGptService } from '../chatgpt/service/image-chat-gpt/image-chat-gpt.service';
import { TXTChatGptService } from '../chatgpt/service/txt-chat-gpt/txt-chat-gpt.service';
import { URLChatGPTService } from '../chatgpt/service/url-chat-gpt/url-chat-gpt.service';
import { PDFChatGPTService } from '../chatgpt/service/pdf-chat-gpt/pdf-chat-gpt.service';
import { YTChatGPTService } from '../chatgpt/service/yt-chat-gpt/yt-chat-gpt.service';
import {
  AudioChatGPTService,
  AudioChatOptions,
} from '../chatgpt/service/audio-chat-gpt/audio-chat-gpt.service';
import { ChatGPTChant } from '@asgard-hub/utils';

@Controller()
export class ChatGPTController {
  constructor(
    private readonly service: ChatGPTGateWayService,
    private readonly gatewayService: GatewayService
  ) {}

  @UseGuards(AuthGuard)
  @GrpcMethod('ChatGPTService')
  generalMessages(
    data: GeneralMessagesOptions,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>
  ) {
    const result = this.service.generalMessages(
      data.chant as ChatGPTChant,
      data.customPrompt
    );
    return {
      messages: result,
    };
  }

  @UseGuards(AuthGuard)
  @GrpcMethod('ChatGPTService', 'FetchGgtResponse')
  fetchGptResponse(
    data: GPTResponseOptions,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>
  ) {
    const fromMetaData = (metadata.get('azure-service') ?? [])[0] ?? false;
    const isUseAzure = fromMetaData === 'true';
    const temperature = data?.temperature ?? 1;

    const result = this.service.getGPTResponse(
      data.contents,
      data.user,
      isUseAzure,
      {
        temperature,
        maxTokens: data.options?.maxTokens,
      }
    );

    return result;
  }

  @UseGuards(AuthGuard)
  @GrpcMethod('ChatGPTService', 'FetchGgtResponseStream')
  fetchGptResponseStream(
    data: GPTResponseOptions,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>
  ) {
    const fromMetaData = (metadata.get('azure-service') ?? [])[0] ?? false;
    const isUseAzure = fromMetaData === 'true';
    const temperature = data?.temperature ?? 1;

    const result = this.service.getGPTResponseSteam(
      data.contents,
      data.user,
      isUseAzure,
      {
        temperature,
        maxTokens: data.options?.maxTokens,
      }
    );

    return result;
  }

  @UseGuards(AuthGuard)
  @GrpcMethod('ChatGPTService', 'GetCompletionResponse')
  async getCompletionResponse(
    data: CompletionResponseOptions,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>
  ) {
    const result = await this.service.getCompletionResponse(
      data.prompt,
      data.model
    );
    return result;
  }

  // fetch Youtube Summary
  @UseGuards(AuthGuard)
  @GrpcMethod('ChatGPTService', 'FetchYoutubeSummary')
  async fetchYoutubeSummaryWithGPT(
    data: YTSummaryOptions,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>
  ) {
    const result = await this.gatewayService
      .getFeatureService<YTChatGPTService>(GatewayFeature.YT)
      .fetchSummaryWithGPT(data);
    return {
      responses: result,
    };
  }

  // fetch Docs Summary
  @UseGuards(AuthGuard)
  @GrpcMethod('ChatGPTService', 'FetchUrlDocSummary')
  async fetchPDFSummaryWithGPT(
    data: URLDocSummaryOptions,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>
  ) {
    let result = [];

    switch (data.dataSourceType) {
      case DataSourceType.PDF:
        result = await this.gatewayService
          .getFeatureService<PDFChatGPTService>(GatewayFeature.PDF)
          .fetchSummaryWithGPT(data);
        break;
      case DataSourceType.TXT:
        result = await this.gatewayService
          .getFeatureService<TXTChatGptService>(GatewayFeature.TXT)
          .fetchSummaryWithGPT(data);
        break;
      case DataSourceType.URL:
        result = await this.gatewayService
          .getFeatureService<URLChatGPTService>(GatewayFeature.URL)
          .fetchSummaryWithGPT(data);
        break;
      case DataSourceType.IMAGE:
        result = await this.gatewayService
          .getFeatureService<ImageChatGptService>(GatewayFeature.IMAGE)
          .fetchSummaryWithGPT(data);
        break;
      default:
        break;
    }

    return {
      responses: result,
    };
  }

  // fetch audio transcription
  @UseGuards(AuthGuard)
  @GrpcMethod('ChatGPTService', 'FetchAudioTranscription')
  async fetchAudioTranscription(
    data: AudioChatOptions,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>
  ) {
    const result = await this.gatewayService
      .getFeatureService<AudioChatGPTService>(GatewayFeature.Audio)
      .fetchDataByDataSourceUrl(data);
    return {
      responses: result,
    };
  }
}
