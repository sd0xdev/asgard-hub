import { Test, TestingModule } from '@nestjs/testing';
import { ChatGPTGateWayService } from './chatgpt.service';
import { ConfigService } from '@nestjs/config';
import { NestOpenAIClientService } from '@sd0x/nest-openai-client';
import { mockOpenAIClient } from '../../__mocks__/mock-openai-client.spec';
import { ChatGPTChant } from '@asgard-hub/utils';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { mockedLogger } from '../../__mocks__/logger-helper.service.spec';

describe('ChatGPTGateWayService', () => {
  let service: ChatGPTGateWayService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AsgardLogger,
          useClass: mockedLogger,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: NestOpenAIClientService,
          useValue: mockOpenAIClient,
        },
        ChatGPTGateWayService,
      ],
    }).compile();

    service = module.get<ChatGPTGateWayService>(ChatGPTGateWayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // call generalMessages with ChatGPTChant
  describe('generalMessages', () => {
    it('should be defined', () => {
      expect(service.generalMessages).toBeDefined();
    });

    it('should return ChatCompletionRequestMessage[]', () => {
      const chant = ChatGPTChant.astrologyExpert;
      const result = service.generalMessages(chant);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // call getGPTResponse with ChatCompletionRequestMessage[], and mock createOpenAIApiChatClient
  describe('getGPTResponse', () => {
    it('should be defined', () => {
      expect(service.getGPTResponse).toBeDefined();
    });

    it('should return CreateChatCompletionResponse', async () => {
      const messages = service.generalMessages(ChatGPTChant.astrologyExpert);
      messages.push({
        role: 'user',
        content: 'Hi',
      });

      const result = await service.getGPTResponse(messages, 'user');

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Object);
      expect(result.choices).toBeDefined();
      expect(result.choices).toBeInstanceOf(Array);
      expect(result.choices.length).toBeGreaterThan(0);

      expect(mockOpenAIClient.getOpenAIApiClient).toBeCalledTimes(1);
    });
  });
});
