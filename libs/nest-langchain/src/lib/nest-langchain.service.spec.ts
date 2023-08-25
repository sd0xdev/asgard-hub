import { Test } from '@nestjs/testing';
import { NestLangchainService } from './nest-langchain.service';
import { LangChainProvider } from './provider/langchain/langchain.provider';

describe('NestLangchainService', () => {
  let service: NestLangchainService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: 'NEST_LANGCHAIN_MODULE_OPTIONS',
          useValue: {},
        },
        {
          provide: LangChainProvider,
          useValue: {},
        },
        NestLangchainService,
      ],
    }).compile();

    service = module.get(NestLangchainService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
