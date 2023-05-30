import { Injectable } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool/dist';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { DataSourceType } from '../../../data-source-adapter/adapter/interface/data-source-type.enum';
import { LoggerHelperService } from '@asgard-hub/nest-winston';
import { ChatGPTChant } from '@asgard-hub/utils';
import { URLDocSummaryOptions } from '../../interface/chatgpt.service.interface';
import { PartCreateChatCompletionResponse } from '../../interface/create.completion.response.usage.for.rpc.interface';
import { ChatGPTGateWayService } from '../../../services/chatgpt-gateway-service/chatgpt.service';
import { BaseFeatureChatGPTService } from '../base-feature-chat-gpt.service';
import { delay } from '@asgard-hub/utils';
import { ImageAdapter } from '../../../data-source-adapter/adapter/image-adapter';

@Injectable()
export class ImageChatGptService extends BaseFeatureChatGPTService<ImageAdapter> {
  private readonly textSplitSize = 2560;
  private readonly maxParts = 10;

  constructor(
    loggerHelperService: LoggerHelperService,
    protected readonly chatGPTService: ChatGPTGateWayService,
    protected readonly dataSourceAdapterService: DataSourceAdapterService
  ) {
    super(
      loggerHelperService,
      dataSourceAdapterService,
      DataSourceType.IMAGE,
      ImageChatGptService.name
    );
  }

  async fetchSummaryWithGPT(
    data: URLDocSummaryOptions
  ): Promise<PartCreateChatCompletionResponse[]> {
    const { log, error } = this.trackerLoggerCreator.create(
      'fetchImageSummaryWithGPT'
    );

    // read txt from url
    // convert txt to text
    const { url, user } = data;
    const annotation = await this.getAdapter().getData(url);

    const textContent = annotation.map((a) => a.description).join(' ');

    // split txt content into array of strings
    // max length of each string is 2560 and can have 10 parts
    const textContentArray = (
      await this.splitContent(textContent, this.textSplitSize)
    ).slice(0, this.maxParts);

    // call get TXT Summary for each part
    const { results, errors } = await PromisePool.withConcurrency(3)
      .for(textContentArray)
      .useCorrespondingResults()
      .onTaskFinished(async (item, pool) => {
        const formatted =
          pool.processedPercentage().toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) + '%';
        log(`percentage: ${formatted}`);
        await delay(Math.random() * 500 + 256);
      })
      .process(async (content, index, pool) => {
        const summary = await this.getTXTSummary(content, {
          user,
          partNumber: index + 1,
          userExpectation: data?.options?.userExpectation,
        });

        return summary;
      });

    errors?.length > 0 && errors.forEach((e) => error(e.raw, e.stack, e));
    const summaries = results
      .filter((r) => r !== undefined)
      .sort((a, b) => a.partNumber - b.partNumber);

    return summaries;
  }

  private async getTXTSummary(
    textContent: string,
    info: {
      user: string;
      partNumber: number;
      userExpectation?: string;
    }
  ): Promise<PartCreateChatCompletionResponse> {
    const { log } = this.trackerLoggerCreator.create(
      `getTXTSummary: Part: ${info.partNumber}`
    );

    log('transcription start...');

    // call chatgpt service to general messages
    const generalMessages = this.chatGPTService.generalMessages(
      ChatGPTChant.imageSummary
    );

    generalMessages.push({
      content: `
          用戶期望: ${info.userExpectation}\n
          圖片段落 ${info.partNumber}: ${textContent}\n
          分析內容(繁體中文): \n`,
      role: 'user',
    });

    log('get summary start...');
    // call chatgpt service to get summary
    const summary = await this.chatGPTService.getGPTResponse(
      generalMessages,
      info.user,
      true,
      {
        temperature: this.temperature,
      }
    );
    log('get summary end...');

    return {
      ...summary,
      partNumber: info.partNumber,
    };
  }
}
