import { Test, TestingModule } from '@nestjs/testing';
import { PDFChatGPTService } from './pdf-chat-gpt.service';
import { DataSourceAdapterService } from '../../../data-source-adapter/data-source-adapter.service';
import { ChatGPTGateWayService } from '../../../services/chatgpt-gateway-service/chatgpt.service';
import { LoggerHelperService } from '@asgard-hub/nest-winston';
import { MockLoggerHelperService } from '../../../__mocks__/logger-helper.service.spec';

describe('PdfChatGptService', () => {
  let service: PDFChatGPTService;

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
        PDFChatGPTService,
      ],
    }).compile();

    service = module.get<PDFChatGPTService>(PDFChatGPTService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
