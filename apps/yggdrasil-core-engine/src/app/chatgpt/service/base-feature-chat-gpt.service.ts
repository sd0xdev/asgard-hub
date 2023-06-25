import { DataSourceType } from '../../data-source-adapter/adapter/interface/data-source-type.enum';
import { DataSourceAdapterService } from '../../data-source-adapter/data-source-adapter.service';
import { PartCreateChatCompletionResponse } from '../interface/create.completion.response.usage.for.rpc.interface';
import { BaseDataSourceAdapter } from '../../data-source-adapter/adapter/interface/data-source-adapter.interface';
import {} from '@asgard-hub/nest-winston';
import { splitString } from '@asgard-hub/utils';

export interface BaseFeatureChatGPTServiceInterface {
  fetchSummaryWithGPT<T>(data: T): Promise<PartCreateChatCompletionResponse[]>;
}

export abstract class BaseFeatureChatGPTService<T extends BaseDataSourceAdapter>
  implements BaseFeatureChatGPTServiceInterface
{
  protected temperature = 0.5;
  constructor(
    protected readonly dataSourceAdapterService: DataSourceAdapterService,
    protected readonly dataSourceType: string,
    protected readonly name: string
  ) {}

  fetchDataByDataSourceUrl(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  fetchSummaryWithGPT(data: any): Promise<PartCreateChatCompletionResponse[]> {
    throw new Error('Method not implemented.');
  }

  protected getAdapter() {
    return this.dataSourceAdapterService.getAdapter<T>(
      DataSourceType[this.dataSourceType]
    );
  }

  protected async splitContent(
    content: string,
    size: number
  ): Promise<string[]> {
    return await splitString(content, size);
  }
}
