import { Injectable } from '@nestjs/common';
import { ChatGPTGateWayService } from '../../../services/chatgpt-gateway-service/chatgpt.service';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { BaseFeatureChatGPTService } from '../base-feature-chat-gpt.service';
import { URLDocSummaryOptions } from '../../interface/chatgpt.service.interface';
import { PartCreateChatCompletionResponse } from '../../interface/create.completion.response.usage.for.rpc.interface';
import { ChatGPTChant } from '@asgard-hub/utils';
import PromisePool from '@supercharge/promise-pool/dist';
import { delay } from '@asgard-hub/utils';
import { DataSourceType } from '../../../data-source-adapter/adapter/interface/data-source-type.enum';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { PDFAdapter } from '../../../data-source-adapter/adapter/pdf-adapter';

@Injectable()
export class PDFChatGPTService extends BaseFeatureChatGPTService<PDFAdapter> {
  private readonly pdfSplitSize = 2560;
  private readonly maxParts = 25;

  constructor(
    private readonly asgardLogger: AsgardLogger,
    protected readonly chatGPTService: ChatGPTGateWayService,
    protected readonly dataSourceAdapterService: DataSourceAdapterService
  ) {
    super(dataSourceAdapterService, DataSourceType.PDF, PDFChatGPTService.name);
  }

  async fetchSummaryWithGPT(
    data: URLDocSummaryOptions
  ): Promise<PartCreateChatCompletionResponse[]> {
    // read pdf from url
    // convert pdf to text
    const { url, user } = data;
    const pdfContent = await this.getAdapter().getData(url);

    // split pdf content into array of strings
    // max length of each string is 2560 and can have 25 parts = 64000 characters
    const pdfContentArray = (
      await this.splitContent(pdfContent, this.pdfSplitSize)
    ).slice(0, this.maxParts);

    // call get PDF Summary for each part
    const pool = await PromisePool.withConcurrency(3)
      .for(pdfContentArray)
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
        const summary = await this.getPDFSummary(content, {
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

  private async getPDFSummary(
    pdfContent: string,
    info: {
      user: string;
      partNumber: number;
      userExpectation?: string;
    }
  ): Promise<PartCreateChatCompletionResponse> {
    this.asgardLogger.log('transcription start...');

    // call chatgpt service to general messages
    const generalMessages = this.chatGPTService.generalMessages(
      ChatGPTChant.pdfSummary
    );

    generalMessages.push({
      content: `
      PDF 段落 ${info.partNumber}: ${pdfContent}\n
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
