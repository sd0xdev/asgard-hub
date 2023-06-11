import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { YTRecord } from '../../mongo/schemas/yt.record.schema';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class YoutubeRecordService {
  constructor(
    @InjectModel(YTRecord.name)
    private readonly ytRecordModel: Model<YTRecord>
  ) {}

  // create a new record
  async createRecord(record: YTRecord): Promise<YTRecord> {
    // check if the record already exists, if so, return the record
    const findRecord = await this.findRecordByUrl(record.url);
    if (findRecord) {
      return findRecord;
    }

    // if not, create a new record
    const newRecord = await this.ytRecordModel.create(record);
    return newRecord;
  }

  // update a record
  async updateRecord(record: YTRecord): Promise<boolean> {
    // check if the record already exists, if so, return the record
    const findRecord = await this.findRecordByYtId(record.ytId);
    if (!findRecord) {
      return (await this.createRecord(record)) ? true : false;
    }

    // if not, update the record
    const updatedRecord = await this.ytRecordModel.updateOne(
      { ytId: record.ytId },
      {
        title: record.title,
        channel: record.channel,
        channelId: record.channelId,
        channelUrl: record.channelUrl,
        duration: record.duration,
        response: record.response,
      },
      {
        multi: true,
      }
    );

    return updatedRecord.acknowledged;
  }

  @OnEvent('create.record')
  async createRecordHandler(payload: YTRecord) {
    await this.createRecord(payload);
  }

  @OnEvent('update.record')
  async updateRecordHandler(payload: YTRecord) {
    await this.updateRecord(payload);
  }

  // find yt id
  async findRecordByYtId(id: string): Promise<YTRecord> {
    const findRecord = await this.ytRecordModel.findOne({ ytId: id });
    return findRecord;
  }

  // find a record by url
  async findRecordByUrl(url: string): Promise<YTRecord> {
    const findRecord = await this.ytRecordModel.findOne({ url });
    return findRecord;
  }
}
