import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { SetupKeywordService } from '../setup-keyword/setup-keyword.service';
import { LoggerHelperService } from '@asgard-hub/nest-winston';
import { MockLoggerHelperService } from '../../../__mocks__/logger-helper.service.spec';
import { DiscordClientService } from '../discord-client/discord-client.service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerHelperService,
          useClass: MockLoggerHelperService,
        },
        {
          provide: DiscordClientService,
          useValue: {
            discordClient: jest.fn().mockImplementation(() => {
              return {
                on: jest.fn().mockImplementation(() => {
                  return {};
                }),
              };
            }),
          },
        },
        {
          provide: 'DISCORD_BOT_MODULE_OPTIONS',
          useValue: {},
        },
        {
          provide: 'CHATGPT_PACKAGE',
          useValue: {
            getService: jest.fn().mockImplementation(() => {
              return {};
            }),
          },
        },
        {
          provide: SetupKeywordService,
          useValue: {},
        },
        MessageService,
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
