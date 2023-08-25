import { Test, TestingModule } from '@nestjs/testing';
import { LangChainProvider } from './langchain.provider';
import { AsgardLoggerSupplement } from '@asgard-hub/nest-winston';

describe('Langchain', () => {
  let provider: LangChainProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'LOGGER_HELPER_SERVICE',
          useValue: {},
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
