import { AxiosResponse } from 'axios';
import {
  CreateChatCompletionResponse,
  CreateTranscriptionResponse,
} from 'openai';

const mockOpenAIClientFn = {
  createChatCompletion: jest.fn().mockImplementation(() => {
    const response: Partial<
      AxiosResponse<Partial<CreateChatCompletionResponse>, any>
    > = {
      data: {
        choices: [
          {
            message: {
              role: 'user',
              content: 'Hi',
            },
          },
          {
            message: {
              role: 'assistant',
              content: 'Hello, how are you?',
            },
          },
        ],
      },
      status: 200,
      statusText: 'OK',
    };
    return response;
  }),
  createTranscription: jest.fn().mockImplementation(() => {
    const response: Partial<
      AxiosResponse<Partial<CreateTranscriptionResponse>, any>
    > = {
      data: {
        text: 'Hello, how are you?',
      },
      status: 200,
      statusText: 'OK',
    };
    return response;
  }),
};

export const mockOpenAIClient = {
  getOpenAIApiClient: jest.fn().mockImplementation(() => mockOpenAIClientFn),
  getAzureOpenAIApiClient: jest
    .fn()
    .mockImplementation(() => mockOpenAIClientFn),
};

it('should be defined', () => {
  expect(mockOpenAIClient.getOpenAIApiClient).toBeDefined();
  expect(mockOpenAIClient.getAzureOpenAIApiClient).toBeDefined();
});
