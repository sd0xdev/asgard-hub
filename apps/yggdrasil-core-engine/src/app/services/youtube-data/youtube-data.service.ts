import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { YTData } from '../../mongo/schemas/yt.data.schema';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class YoutubeDataService {
  constructor(
    @InjectModel(YTData.name)
    private readonly YTDataModel: Model<YTData>,
  ) {}

  // create a new Data
  async createData(data: YTData): Promise<YTData> {
    // check if the Data already exists, if so, return the Data
    const findData = await this.findDataByUrl(data.url);
    if (findData) {
      return findData;
    }

    // if not, create a new Data
    const newData = await this.YTDataModel.create(data);
    return newData;
  }

  // update a Data
  async updateData(data: YTData): Promise<boolean> {
    // check if the Data already exists, if so, return the Data
    const findData = await this.findDataByYtId(data.ytId);
    if (!findData) {
      return (await this.createData(data)) ? true : false;
    }

    // if not, update the Data
    const updatedData = await this.YTDataModel.updateOne(
      { ytId: data.ytId },
      {
        channelId: data.channelId,
        data: data.data,
      },
    );

    return updatedData.acknowledged;
  }

  @OnEvent('create.data')
  async createDataHandler(payload: YTData) {
    await this.createData(payload);
  }

  @OnEvent('update.data')
  async updateDataHandler(payload: YTData) {
    await this.updateData(payload);
  }

  // find a Data by ytId
  async findDataByYtId(ytId: string): Promise<YTData> {
    const findData = this.YTDataModel.findOne({ ytId });
    return findData;
  }

  // find a Data by url
  async findDataByUrl(url: string): Promise<YTData> {
    const findData = this.YTDataModel.findOne({ url });
    return findData;
  }
}
