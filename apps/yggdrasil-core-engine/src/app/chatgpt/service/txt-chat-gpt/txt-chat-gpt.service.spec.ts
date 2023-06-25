import { Test, TestingModule } from '@nestjs/testing';
import { TXTChatGptService } from './txt-chat-gpt.service';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { ChatGPTGateWayService } from '../../../services/chatgpt-gateway-service/chatgpt.service';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { mockedLogger } from '../../../__mocks__/logger-helper.service.spec';

describe('TxtChatGptService', () => {
  let service: TXTChatGptService;

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
          provide: ChatGPTGateWayService,
          useValue: {},
        },
        TXTChatGptService,
      ],
    }).compile();

    service = module.get<TXTChatGptService>(TXTChatGptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
