import { Test } from '@nestjs/testing';
import { NestLangchainService } from './nest-langchain.service';

describe('NestLangchainService', () => {
  let service: NestLangchainService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NestLangchainService],
    }).compile();

    service = module.get(NestLangchainService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
