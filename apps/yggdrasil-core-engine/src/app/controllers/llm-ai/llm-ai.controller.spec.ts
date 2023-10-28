import { Test, TestingModule } from '@nestjs/testing';
import { LLMAIController } from './llm-ai.controller';
import { AuthGuard } from '../../auth/auth.guard';
import { LLMAIService } from '../../llm-ai/service/llmai/llmai.service';

describe('LlmAiController', () => {
  let controller: LLMAIController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LLMAIService,
          useValue: {
            chat: jest.fn(),
          },
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
