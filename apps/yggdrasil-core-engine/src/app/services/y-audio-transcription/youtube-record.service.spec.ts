import { YAudioTranscription } from '../../mongo/schemas/y.audio.transcription.schema';
import { YAudioTranscriptionService } from './youtube-record.service';

describe('YoutubeDataService', () => {
  it('test_create_record_unique', async () => {
    // Arrange
    const mockRecord = new YAudioTranscription();
    mockRecord.url = 'https://example.com/audio1';
    mockRecord.fingerprint = '1234567890';
    mockRecord.extension = 'mp3';
    mockRecord.data = [];
    const mockModel: any = {
      create: jest.fn().mockResolvedValue(mockRecord),
      findOne: jest.fn().mockResolvedValue(null),
    };
    const service = new YAudioTranscriptionService(mockModel);

    // Act
    const result = await service.createRecord(mockRecord);

    // Assert
    expect(result).toEqual(mockRecord);
    expect(mockModel.create).toHaveBeenCalledWith(mockRecord);
    expect(mockModel.findOne).toHaveBeenCalledWith({ url: mockRecord.url });
  });

  it('test_update_valid', async () => {
    // Arrange
    const mockRecord = new YAudioTranscription();
    mockRecord.url = 'https://example.com/audio1';
    mockRecord.fingerprint = '1234567890';
    mockRecord.extension = 'mp3';
    mockRecord.data = [];
    const mockModel: any = {
      updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn().mockResolvedValue(mockRecord),
    };
    const service = new YAudioTranscriptionService(mockModel);

    // Act
    const result = await service.updateRecord(mockRecord);

    // Assert
    expect(result).toBe(true);
    expect(mockModel.updateOne).toHaveBeenCalledWith(
      { url: mockRecord.url },
      { ...mockRecord }
    );
    expect(mockModel.findOne).toHaveBeenCalledWith({ url: mockRecord.url });
  });

  it('test_create_non_unique', async () => {
    // Arrange
    const mockRecord = new YAudioTranscription();
    mockRecord.url = 'https://example.com/audio1';
    mockRecord.fingerprint = '1234567890';
    mockRecord.extension = 'mp3';
    mockRecord.data = [];
    const mockModel: any = {
      create: jest.fn().mockResolvedValue(mockRecord),
      findOne: jest.fn().mockResolvedValue(mockRecord),
    };
    const service = new YAudioTranscriptionService(mockModel);

    // Act
    const result = await service.createRecord(mockRecord);

    // Assert
    expect(result).toEqual(mockRecord);
    expect(mockModel.create).not.toHaveBeenCalled();
    expect(mockModel.findOne).toHaveBeenCalledWith({ url: mockRecord.url });
  });

  it('test_update_non_existing', async () => {
    // Arrange
    const mockRecord = new YAudioTranscription();
    mockRecord.url = 'https://example.com/audio1';
    mockRecord.fingerprint = '1234567890';
    mockRecord.extension = 'mp3';
    mockRecord.data = [];
    const mockModel: any = {
      updateOne: jest.fn().mockResolvedValue({ acknowledged: false }),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockRecord),
    };
    const service = new YAudioTranscriptionService(mockModel);

    // Act
    const result = await service.updateRecord(mockRecord);

    // Assert
    expect(result).toBe(true);
    expect(mockModel.findOne).toHaveBeenCalledWith({ url: mockRecord.url });
    expect(mockModel.create).toHaveBeenCalledWith(mockRecord);
  });
});
