import { Test, TestingModule } from '@nestjs/testing';
import { LLMAIController } from './llm-ai.controller';

describe('LlmAiController', () => {
  let controller: LLMAIController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LLMAIController],
    }).compile();

    controller = module.get<LLMAIController>(LLMAIController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
