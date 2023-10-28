import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIProvider } from './open-ai';
import { ConfigService } from '@nestjs/config';

export class MockOpenAIProvider {
  getMock() {
    return {
      fetchChatOpenAIInput: jest.fn().mockImplementation(() => {
        return {
          temperature: 0,
          openAIApiKey: '123',
          modelName: '123',
        };
      }),
    };
  }
}

describe('OpenAi', () => {
  let provider: OpenAIProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation(() => {
              return {
                apiKey: '123',
              };
            }),
          },
        },
        OpenAIProvider,
      ],
    }).compile();

    provider = module.get<OpenAIProvider>(OpenAIProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
