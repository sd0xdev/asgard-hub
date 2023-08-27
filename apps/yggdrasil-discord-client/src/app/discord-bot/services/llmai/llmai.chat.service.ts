import { Metadata } from '@grpc/grpc-js';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Message, TextChannel } from 'discord.js';
import { ReplaySubject, switchMap, catchError } from 'rxjs';
import { AsgardLogger, AsgardLoggerSupplement } from '@asgard-hub/nest-winston';
import { DISCORD_BOT_MODULE_OPTIONS } from '../../constants/discord-bot.constants';
import {
  ChatOptions,
  LLMAIService,
} from '../../interface/chatgpt.service.interface';
import { DiscordBotModuleOptions } from '../../interface/discord-bot-module';
import { MessageService } from '../message/message.service';

@Injectable()
export class LLMAIChatService {
  private llmAIService: LLMAIService;
  private metadata = new Metadata();

  @Inject(AsgardLoggerSupplement.LOGGER_HELPER_SERVICE)
  private readonly asgardLogger: AsgardLogger;
  @Inject(DISCORD_BOT_MODULE_OPTIONS)
  private readonly options: DiscordBotModuleOptions;
  @Inject('LLMAI_PACKAGE')
  private readonly llmaiGrpcClient: ClientGrpc;
  @Inject()
  private readonly messageService: MessageService;

  async onModuleInit() {
    this.llmAIService =
      this.llmaiGrpcClient.getService<LLMAIService>('LLMAIService');

    this.metadata.set('authorization', this.options.config.rpcApiKey);
    this.metadata.set('azure-service', `${this.options.config.isAzureService}`);
  }

  async createResponse(message: Message<boolean>) {
    message = await this.messageService.getRefreshedMessage(message);

    // show typing
    await (message.channel as TextChannel).sendTyping();
    const request$ = new ReplaySubject<ChatOptions>();
    request$.next({
      userInput: message.content,
    });
    request$.complete();

    const subscription = this.llmAIService
      .chatStream(request$, this.metadata)
      .pipe(
        switchMap(async (result) => {
          const isMessage = result.event === 'message';

          const response = isMessage
            ? JSON.parse(result.data).response
            : result.data;

          isMessage &&
            (await this.messageService.sendMessageReply(response, message));

          this.asgardLogger.log(`successfully send message: ${response}`);
        }),
        catchError(async (e) => {
          this.asgardLogger.error(e);
          await this.messageService.sendMessageReply(
            `很遺憾，目前暫時無法服務您。請稍後再試， Message: ${e?.message}`,
            message
          );
          return;
        })
      )
      .subscribe({
        complete: () => {
          this.asgardLogger.log(`complete subscription`);
          subscription.unsubscribe();
        },
      });
  }
}
