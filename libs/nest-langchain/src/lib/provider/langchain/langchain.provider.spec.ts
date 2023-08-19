import { Test, TestingModule } from '@nestjs/testing';
import { LangChainProvider } from './langchain.provider';
import { HahowNestWinstonOptionsSupplement } from '@hahowise-ai/hahow-nest-winston';
import { MockHahowNestLoggerService } from '../../mock/mock-hahow-nest-logger.service.spec';

describe('Langchain', () => {
  let provider: LangChainProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HahowNestWinstonOptionsSupplement.HAHOW_LOGGER_SERVICE,
          useValue: new MockHahowNestLoggerService(),
        },
        LangChainProvider,
      ],
    }).compile();

    provider = await module.resolve<LangChainProvider>(LangChainProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

export class MockLangChainProvider {
  createStructuredOutputChainFromZod() {
    return jest.fn().mockImplementation(() => ({
      run: jest.fn().mockImplementation(() => ({
        output: 'output',
      })),
    }));
  }

  createHahowiseCallbackHandler() {
    return {
      fetchCalledToolRecord: jest.fn().mockImplementation(() => []),
    };
  }
}
