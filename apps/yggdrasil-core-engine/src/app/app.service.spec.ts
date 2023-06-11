import { Test } from '@nestjs/testing';

import { AppService } from './app.service';
import { NestOpenAIClientService } from '@sd0x/nest-openai-client';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: NestOpenAIClientService,
          useValue: {
            getOpenAIApiClient: jest.fn().mockImplementation(() => {
              return {
                createChatCompletion: jest.fn().mockImplementation(() => {
                  return {
                    data: 'Hello API',
                  };
                }),
              };
            }),
            getAzureOpenAIApiClient: jest.fn().mockImplementation(() => {
              return {
                createChatCompletion: jest.fn().mockImplementation(() => {
                  return {
                    data: 'Hello API',
                  };
                }),
              };
            }),
          },
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service).toBeDefined();
    });
  });
});
