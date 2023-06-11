import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeRecordService } from './youtube-record.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { YTRecord } from '../../mongo/schemas/yt.record.schema';

const moduleMocker = new ModuleMocker(global);

describe('YoutubeRecordService', () => {
  it('test_create_record_successfully', async () => {
    // Arrange
    const record = new YTRecord();
    record.ytId = '123';
    record.url = 'https://www.youtube.com/watch?v=123';
    record.title = 'Test Video';
    record.channel = 'Test Channel';
    record.channelId = '456';
    record.channelUrl = 'https://www.youtube.com/channel/456';
    record.duration = 60;
    record.response = [];

    const ytRecordModelMock: any = {
      create: jest.fn().mockResolvedValue(record),
      findOne: jest.fn().mockResolvedValue(null),
      updateOne: jest.fn(),
    };

    const youtubeRecordService = new YoutubeRecordService(ytRecordModelMock);

    // Act
    const result = await youtubeRecordService.createRecord(record);

    // Assert
    expect(result).toEqual(record);
    expect(ytRecordModelMock.create).toHaveBeenCalledWith(record);
  });
  it('test_update_existing_record_successfully', async () => {
    // Arrange
    const record = new YTRecord();
    record.ytId = '123';
    record.url = 'https://www.youtube.com/watch?v=123';
    record.title = 'Test Video';
    record.channel = 'Test Channel';
    record.channelId = '456';
    record.channelUrl = 'https://www.youtube.com/channel/456';
    record.duration = 60;
    record.response = [];

    const ytRecordModelMock: any = {
      findOne: jest.fn().mockResolvedValue(record),
      updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
    };

    const youtubeRecordService = new YoutubeRecordService(ytRecordModelMock);

    // Act
    const result = await youtubeRecordService.updateRecord(record);

    // Assert
    expect(result).toBe(true);
    expect(ytRecordModelMock.findOne).toHaveBeenCalledWith({
      ytId: record.ytId,
    });
    expect(ytRecordModelMock.updateOne).toHaveBeenCalledWith(
      { ytId: record.ytId },
      {
        title: record.title,
        channel: record.channel,
        channelId: record.channelId,
        channelUrl: record.channelUrl,
        duration: record.duration,
        response: record.response,
      },
      { multi: true }
    );
  });
  it('test_create_record_already_exists', async () => {
    // Arrange
    const record = new YTRecord();
    record.ytId = '123';
    record.url = 'https://www.youtube.com/watch?v=123';
    record.title = 'Test Video';
    record.channel = 'Test Channel';
    record.channelId = '456';
    record.channelUrl = 'https://www.youtube.com/channel/456';
    record.duration = 60;
    record.response = [];

    const ytRecordModelMock: any = {
      findOne: jest.fn().mockResolvedValue(record),
    };

    const youtubeRecordService = new YoutubeRecordService(ytRecordModelMock);

    // Act
    const result = await youtubeRecordService.createRecord(record);

    // Assert
    expect(result).toEqual(record);
    expect(ytRecordModelMock.findOne).toHaveBeenCalledWith({ url: record.url });
  });

  it('test_update_record_does_not_exist', async () => {
    // Arrange
    const record = new YTRecord();
    record.ytId = '123';
    record.url = 'https://www.youtube.com/watch?v=123';
    record.title = 'Test Video';
    record.channel = 'Test Channel';
    record.channelId = '456';
    record.channelUrl = 'https://www.youtube.com/channel/456';
    record.duration = 60;
    record.response = [];

    const ytRecordModelMock: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(record),
    };

    const youtubeRecordService = new YoutubeRecordService(ytRecordModelMock);

    // Act
    const result = await youtubeRecordService.updateRecord(record);

    // Assert
    expect(result).toBe(true);
    expect(ytRecordModelMock.findOne).toHaveBeenCalledWith({
      ytId: record.ytId,
    });
    expect(ytRecordModelMock.create).toHaveBeenCalledWith(record);
  });

  it('test_find_record_by_yt_id_successfully', async () => {
    // Arrange
    const record = new YTRecord();
    record.ytId = '123';
    record.url = 'https://www.youtube.com/watch?v=123';
    record.title = 'Test Video';
    record.channel = 'Test Channel';
    record.channelId = '456';
    record.channelUrl = 'https://www.youtube.com/channel/456';
    record.duration = 60;
    record.response = [];

    const ytRecordModelMock: any = {
      findOne: jest.fn().mockResolvedValue(record),
    };

    const youtubeRecordService = new YoutubeRecordService(ytRecordModelMock);

    // Act
    const result = await youtubeRecordService.findRecordByYtId(record.ytId);

    // Assert
    expect(result).toEqual(record);
    expect(ytRecordModelMock.findOne).toHaveBeenCalledWith({
      ytId: record.ytId,
    });
  });

  it('test_find_record_by_url_successfully', async () => {
    // Arrange
    const record = new YTRecord();
    record.ytId = '123';
    record.url = 'https://www.youtube.com/watch?v=123';
    record.title = 'Test Video';
    record.channel = 'Test Channel';
    record.channelId = '456';
    record.channelUrl = 'https://www.youtube.com/channel/456';
    record.duration = 60;
    record.response = [];

    const ytRecordModelMock: any = {
      findOne: jest.fn().mockResolvedValue(record),
    };

    const youtubeRecordService = new YoutubeRecordService(ytRecordModelMock);

    // Act
    const result = await youtubeRecordService.findRecordByUrl(record.url);

    // Assert
    expect(result).toEqual(record);
    expect(ytRecordModelMock.findOne).toHaveBeenCalledWith({ url: record.url });
  });
});
