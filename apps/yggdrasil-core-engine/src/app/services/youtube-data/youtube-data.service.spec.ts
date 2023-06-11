import { YoutubeDataService } from './youtube-data.service';
import { YTData } from '../../mongo/schemas/yt.data.schema';

describe('YoutubeDataService', () => {
  it('test_create_data_successfully', async () => {
    const mockData = new YTData();
    mockData.ytId = '123';
    mockData.url = 'https://www.youtube.com/watch?v=123';
    mockData.data = [{ text: 'test', partNumber: 1 }];
    mockData.channelId = '456';
    const mockYTDataModel: any = {
      create: jest.fn().mockResolvedValue(mockData),
      findOne: jest.fn().mockResolvedValue(null),
    };
    const youtubeDataService = new YoutubeDataService(mockYTDataModel);
    const result = await youtubeDataService.createData(mockData);
    expect(result).toEqual(mockData);
    expect(mockYTDataModel.create).toHaveBeenCalledWith(mockData);
  });

  it('test_update_existing_data_successfully', async () => {
    const mockData = new YTData();
    mockData.ytId = '123';
    mockData.url = 'https://www.youtube.com/watch?v=123';
    mockData.data = [{ text: 'test', partNumber: 1 }];
    mockData.channelId = '456';
    const mockYTDataModel: any = {
      updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn().mockResolvedValue(mockData),
    };
    const youtubeDataService = new YoutubeDataService(mockYTDataModel);
    const result = await youtubeDataService.updateData(mockData);
    expect(result).toBe(true);
    expect(mockYTDataModel.updateOne).toHaveBeenCalledWith(
      { ytId: mockData.ytId },
      { channelId: mockData.channelId, data: mockData.data }
    );
  });

  it('test_create_data_already_exists', async () => {
    const mockData = new YTData();
    mockData.ytId = '123';
    mockData.url = 'https://www.youtube.com/watch?v=123';
    mockData.data = [{ text: 'test', partNumber: 1 }];
    mockData.channelId = '456';
    const mockYTDataModel: any = {
      findOne: jest.fn().mockResolvedValue(mockData),
    };
    const youtubeDataService = new YoutubeDataService(mockYTDataModel);
    const result = await youtubeDataService.createData(mockData);
    expect(result).toEqual(mockData);
    expect(mockYTDataModel.findOne).toHaveBeenCalledWith({ url: mockData.url });
  });

  it('test_update_data_doesnt_exist', async () => {
    const mockData = new YTData();
    mockData.ytId = '123';
    mockData.url = 'https://www.youtube.com/watch?v=123';
    mockData.data = [{ text: 'test', partNumber: 1 }];
    mockData.channelId = '456';
    const mockYTDataModel: any = {
      updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockData),
    };
    const youtubeDataService = new YoutubeDataService(mockYTDataModel);
    const result = await youtubeDataService.updateData(mockData);
    expect(result).toBe(true);
    expect(mockYTDataModel.create).toHaveBeenCalledWith(mockData);
  });
});
