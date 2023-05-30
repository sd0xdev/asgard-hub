import { Test, TestingModule } from '@nestjs/testing';
import { YTChatGPTService } from './yt-chat-gpt.service';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { ChatGPTGateWayService } from '../../../services/chatgpt-gateway-service/chatgpt.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { YoutubeRecordService } from '../../../services/youtube-record/youtube-record.service';
import { LoggerHelperService } from '@asgard-hub/nest-winston';
import { MockLoggerHelperService } from '../../../__mocks__/logger-helper.service.spec';

describe('YtChatGptService', () => {
  let service: YTChatGPTService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerHelperService,
          useClass: MockLoggerHelperService,
        },
        {
          provide: DataSourceAdapterService,
          useValue: {
            getAdapter: jest.fn(),
          },
        },
        {
          provide: ChatGPTGateWayService,
          useValue: {},
        },
        {
          provide: EventEmitter2,
          useValue: {},
        },
        {
          provide: YoutubeRecordService,
          useValue: {},
        },
        YTChatGPTService,
      ],
    }).compile();

    service = module.get<YTChatGPTService>(YTChatGPTService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
