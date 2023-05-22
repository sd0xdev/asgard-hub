import { Test } from '@nestjs/testing';
import { NestOpenAIClientService } from './nest-openai-client.service';

describe('NestOpenaiClientService', () => {
  let service: NestOpenAIClientService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NestOpenAIClientService],
    }).compile();

    service = module.get(NestOpenAIClientService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
