import { Test, TestingModule } from '@nestjs/testing';
import { LLMAIService } from './llmai.service';
import { AsgardLoggerSupplement } from '@asgard-hub/nest-winston';
import { LangChainService } from '../langchain/langchain.service';

describe('LlmaiService', () => {
  let service: LLMAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AsgardLoggerSupplement.LOGGER_HELPER_SERVICE,
          useValue: {},
        },
        {
          provide: LangChainService,
          useValue: {},
        },
        LLMAIService,
      ],
    }).compile();

    service = module.get<LLMAIService>(LLMAIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
