import { Test, TestingModule } from '@nestjs/testing';
import { DiscordClientService } from './discord-client.service';
import { DISCORD_BOT_MODULE_OPTIONS } from '../../constants/discord-bot.constants';
import { AsgardLogger } from '@asgard-hub/nest-winston';
import { mockedLogger } from '../../../__mocks__/logger-helper.service.spec';

describe('DiscordClientService', () => {
  let service: DiscordClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AsgardLogger,
          useClass: mockedLogger,
        },
        {
          provide: DISCORD_BOT_MODULE_OPTIONS,
          useValue: {},
        },
        DiscordClientService,
      ],
    }).compile();

    service = module.get<DiscordClientService>(DiscordClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
