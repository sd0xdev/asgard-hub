import { Test, TestingModule } from '@nestjs/testing';
import { LangChainService } from './langchain.service';
import { NestLangchainOptionsSupplement } from '@sd0x/nest-langchain';
import { AsgardLoggerSupplement } from '@asgard-hub/nest-winston';

describe('LangChainService', () => {
  let service: LangChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NestLangchainOptionsSupplement.NEST_LANGCHAIN_SERVICE,
          useValue: {},
        },
        {
          provide: AsgardLoggerSupplement.LOGGER_HELPER_SERVICE,
          useValue: {},
        },
        LangChainService,
      ],
    }).compile();

    service = module.get<LangChainService>(LangChainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
