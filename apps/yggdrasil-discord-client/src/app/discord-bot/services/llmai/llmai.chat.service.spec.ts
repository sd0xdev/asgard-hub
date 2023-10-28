import { Test, TestingModule } from '@nestjs/testing';
import { LLMAIChatService } from './llmai.chat.service';
import { AsgardLoggerSupplement } from '@asgard-hub/nest-winston';
import { MessageService } from '../message/message.service';

describe('LLMAIChatService', () => {
  let service: LLMAIChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AsgardLoggerSupplement.LOGGER_HELPER_SERVICE,
          useValue: {},
        },
        {
          provide: 'LLMAI_PACKAGE',
          useValue: {
            getService: jest.fn().mockImplementation(() => {
              return {};
            }),
          },
        },
        {
          provide: 'DISCORD_BOT_MODULE_OPTIONS',
          useValue: {},
        },
        {
          provide: MessageService,
          useValue: {},
        },
        LLMAIChatService,
      ],
    }).compile();

    service = module.get<LLMAIChatService>(LLMAIChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
