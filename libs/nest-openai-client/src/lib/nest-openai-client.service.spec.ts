import { Test } from '@nestjs/testing';
import { NestOpenAIClientService } from './nest-openai-client.service';
import { NEST_OPENAI_CLIENT_MODULE_OPTIONS } from './constants/nest.openai.client.constants';

describe('NestOpenaiClientService', () => {
  let service: NestOpenAIClientService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: NEST_OPENAI_CLIENT_MODULE_OPTIONS,
          useValue: jest.fn().mockReturnValue({
            runtime: {
              isDev: true,
              isStaging: false,
              isProd: false,
            },
            clientName: 'NestOpenAIClient',
            apiKey: 'test',
            azure: {
              apiKey: 'test',
              endpoint: 'test',
              deploymentName: 'test',
            },
          }),
        },
        NestOpenAIClientService,
      ],
    }).compile();

    service = module.get(NestOpenAIClientService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
