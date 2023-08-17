import { Test, TestingModule } from '@nestjs/testing';
import { AudioChatGPTService } from './audio-chat-gpt.service';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { YAudioTranscriptionService } from '../../../services/y-audio-transcription/youtube-record.service';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { mockedLogger } from '../../../__mocks__/logger-helper.service.spec';
describe('AudioChatGptService', () => {
  let service: AudioChatGPTService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AsgardLogger,
          useClass: mockedLogger,
        },
        {
          provide: DataSourceAdapterService,
          useValue: {
            getAdapter: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: YAudioTranscriptionService,
          useValue: {
            findRecordByUrl: jest.fn(),
          },
        },
        AudioChatGPTService,
      ],
    }).compile();

    service = module.get<AudioChatGPTService>(AudioChatGPTService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
