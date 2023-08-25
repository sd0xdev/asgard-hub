import { Test, TestingModule } from '@nestjs/testing';
import { LLMAIController } from './llm-ai.controller';
import { AsgardLoggerSupplement } from '@asgard-hub/nest-winston';
import { AuthGuard } from '../../auth/auth.guard';
import { LangChainService } from '../../llm-ai/lang-chain/lang-chain.service';

describe('LlmAiController', () => {
  let controller: LLMAIController;

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
      ],
      controllers: [LLMAIController],
    })
      .overrideGuard(AuthGuard)
      .useValue({})
      .compile();

    controller = module.get<LLMAIController>(LLMAIController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
