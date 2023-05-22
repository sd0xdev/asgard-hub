import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NestOpenAIClientService } from '@sd0x/nest-openai-client';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
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
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      return;
    });
  });
});
