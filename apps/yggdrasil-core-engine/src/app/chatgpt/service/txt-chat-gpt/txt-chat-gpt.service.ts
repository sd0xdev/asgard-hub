import { Injectable } from '@nestjs/common';
import { DataSourceType } from '../../../data-source-adapter/adapter/interface/data-source-type.enum';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { ChatGPTGateWayService } from '../../../services/chatgpt-gateway-service/chatgpt.service';
import { BaseFeatureChatGPTService } from '../base-feature-chat-gpt.service';
import PromisePool from '@supercharge/promise-pool/dist';
import { ChatGPTChant } from '@asgard-hub/utils';
import { PartCreateChatCompletionResponse } from '../../interface/create.completion.response.usage.for.rpc.interface';
import { URLDocSummaryOptions } from '../../interface/chatgpt.service.interface';
import { TXTAdapter } from '../../../data-source-adapter/adapter/txt-adapter';
import { delay } from '@asgard-hub/utils';

@Injectable()
export class TXTChatGptService extends BaseFeatureChatGPTService<TXTAdapter> {
  private readonly txtSplitSize = 2560;
  private readonly maxParts = 25;

  constructor(
    private readonly asgardLogger: AsgardLogger,
    protected readonly chatGPTService: ChatGPTGateWayService,
    protected readonly dataSourceAdapterService: DataSourceAdapterService
  ) {
    super(dataSourceAdapterService, DataSourceType.TXT, TXTChatGptService.name);
  }

  async fetchSummaryWithGPT(
    data: URLDocSummaryOptions
  ): Promise<PartCreateChatCompletionResponse[]> {
    // read txt from url
    // convert txt to text
    const { url, user } = data;
    const txtContent = await this.getAdapter().getData(url);

    // split txt content into array of strings
    // max length of each string is 2560 and can have 25 parts
    const txtContentArray = (
      await this.splitContent(txtContent, this.txtSplitSize)
    ).slice(0, this.maxParts);

    // call get TXT Summary for each part
    const pool = await PromisePool.withConcurrency(3)
      .for(txtContentArray)
      .useCorrespondingResults()
      .onTaskFinished(async (item, pool) => {
        const formatted =
          pool.processedPercentage().toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) + '%';
        this.asgardLogger.log(`percentage: ${formatted}`);
        await delay(Math.random() * 500 + 256);
      })
      .process(async (content, index) => {
        const summary = await this.getTXTSummary(content, {
          user,
          partNumber: index + 1,
        });

        return summary;
      });

    pool.errors?.length > 0 &&
      pool.errors.forEach((e) => this.asgardLogger.error(e.raw, e.stack, e));
    const results = pool.results.filter(
      (r) => r !== undefined && (r as any) !== Symbol.for('failed')
    );

    const summaries = results.sort((a, b) => a.partNumber - b.partNumber);

    return summaries;
  }

  private async getTXTSummary(
    txtContent: string,
    info: {
      user: string;
      partNumber: number;
      userExpectation?: string;
    }
  ): Promise<PartCreateChatCompletionResponse> {
    this.asgardLogger.log('transcription start...');

    // call chatgpt service to general messages
    const generalMessages = this.chatGPTService.generalMessages(
      ChatGPTChant.txtSunmmary
    );

    generalMessages.push({
      content: `
      TXT 段落 ${info.partNumber}: ${txtContent}\n
      段落摘要(繁體中文): \n`,
      role: 'user',
    });

    this.asgardLogger.log('get summary start...');
    // call chatgpt service to get summary
    const summary = await this.chatGPTService.getGPTResponse(
      generalMessages,
      info.user,
      true,
      {
        temperature: this.temperature,
      }
    );
    this.asgardLogger.log('get summary end...');

    return {
      ...summary,
      partNumber: info.partNumber,
    };
  }
}
