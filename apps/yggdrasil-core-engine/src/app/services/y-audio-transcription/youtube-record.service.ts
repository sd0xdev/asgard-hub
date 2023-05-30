import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { YAudioTranscription } from '../../mongo/schemas/y.audio.transcription.schema';

@Injectable()
export class YAudioTranscriptionService {
  public static readonly CREATE_EVENT = 'create-y.audio.transcription';
  public static readonly UPDATE_EVENT = 'update-y.audio.transcription';

  get createEvent() {
    return YAudioTranscriptionService.CREATE_EVENT;
  }

  get updateEvent() {
    return YAudioTranscriptionService.UPDATE_EVENT;
  }

  constructor(
    @InjectModel(YAudioTranscription.name)
    private readonly yAudioTranscriptionModel: Model<YAudioTranscription>,
  ) {}

  // create a new record
  async createRecord(
    record: YAudioTranscription,
  ): Promise<YAudioTranscription> {
    // check if the record already exists, if so, return the record
    const findRecord = await this.findRecordByUrl(record.url);
    if (findRecord) {
      return findRecord;
    }

    // if not, create a new record
    const newRecord = await this.yAudioTranscriptionModel.create(record);
    return newRecord;
  }

  // update a record
  async updateRecord(record: YAudioTranscription): Promise<boolean> {
    // check if the record already exists, if so, return the record
    const findRecord = await this.findRecordByUrl(record.url);
    if (!findRecord) {
      return (await this.createRecord(record)) ? true : false;
    }

    // if not, update the record
    const updatedRecord = await this.yAudioTranscriptionModel.updateOne(
      { url: record.url },
      {
        ...record,
      },
    );

    return updatedRecord.acknowledged;
  }

  @OnEvent(YAudioTranscriptionService.CREATE_EVENT)
  async createRecordHandler(payload: YAudioTranscription) {
    await this.createRecord(payload);
  }

  @OnEvent(YAudioTranscriptionService.UPDATE_EVENT)
  async updateRecordHandler(payload: YAudioTranscription) {
    await this.updateRecord(payload);
  }

  // find a record by url
  async findRecordByUrl(url: string): Promise<YAudioTranscription> {
    const findRecord = await this.yAudioTranscriptionModel.findOne({ url });
    return findRecord;
  }
}
