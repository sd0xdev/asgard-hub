import { BaseDataSourceAdapter } from './interface/data-source-adapter.interface';
import { DataSourceType } from './interface/data-source-type.enum';
import { CloudVisionService } from '../../services/cloud-vision/cloud-vision.service';
import { google } from '@google-cloud/vision/build/protos/protos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageAdapter extends BaseDataSourceAdapter {
  constructor(private readonly cloudVisionService: CloudVisionService) {
    super(DataSourceType.IMAGE);
  }

  public async getData(
    url: string
  ): Promise<google.cloud.vision.v1.IEntityAnnotation[]> {
    return await this.fetchImage(url);
  }

  private async fetchImage(
    url: string
  ): Promise<google.cloud.vision.v1.IEntityAnnotation[]> {
    return await this.cloudVisionService.getImageText(url);
  }
}
