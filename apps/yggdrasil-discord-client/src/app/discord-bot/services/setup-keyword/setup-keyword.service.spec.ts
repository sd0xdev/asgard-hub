import { Test, TestingModule } from '@nestjs/testing';
import { SetupKeywordService } from './setup-keyword.service';
import { LoggerHelperService } from '@asgard-hub/nest-winston';
import { MockLoggerHelperService } from '../../../__mocks__/logger-helper.service.spec';
import { DISCORD_BOT_MODULE_OPTIONS } from '../../constants/discord-bot.constants';
import { HttpService } from '@nestjs/axios';
describe('SetupKeywordService', () => {
  let service: SetupKeywordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerHelperService,
          useClass: MockLoggerHelperService,
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
          provide: HttpService,
          useValue: {
            get: jest.fn().mockImplementation(() => {
              return {};
            }),
          },
        },
        {
          provide: DISCORD_BOT_MODULE_OPTIONS,
          useValue: {},
        },
        SetupKeywordService,
      ],
    }).compile();

    service = module.get<SetupKeywordService>(SetupKeywordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
