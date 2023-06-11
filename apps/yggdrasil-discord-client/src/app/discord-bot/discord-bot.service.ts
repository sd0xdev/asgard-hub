import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import fs = require('fs');
import {
  TrackerLoggerCreator,
  LoggerHelperService,
} from '@asgard-hub/nest-winston';
import {
  Client,
  Events,
  GatewayIntentBits,
  Message,
  Partials,
  TextChannel,
  ActivityType,
} from 'discord.js';

import { DISCORD_BOT_MODULE_OPTIONS } from './constants/discord-bot.constants';
import { DiscordBotModuleOptions } from './interface/discord-bot-module';
import { validateYoutubeUrl } from './utils/validate-youtube-url';
import { MessageService } from './services/message/message.service';
import { DataSourceType } from './interface/data-source-type.enum';
import { ClientProxy } from '@nestjs/microservices';
import { DiscordClientService } from './services/discord-client/discord-client.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DiscordBotService {
  private readonly trackerLoggerCreator: TrackerLoggerCreator;

  constructor(
    loggerHelperService: LoggerHelperService,
    @Inject(DISCORD_BOT_MODULE_OPTIONS)
    private readonly options: DiscordBotModuleOptions,
    @Inject('BOT_SERVICE')
    private botClient: ClientProxy,
    private readonly discordClientService: DiscordClientService
  ) {
    this.trackerLoggerCreator = loggerHelperService.create(
      DiscordBotService.name
    );
  }

  async onApplicationBootstrap() {
    await this.botClient.connect();

    if (!this.options.config.isStartClient) {
      return;
    }

    const { log, error } = this.trackerLoggerCreator.create('EVENTS');

    log('setup listener');
    try {
      this.discordClientService.discordClient.on(
        Events.ClientReady,
        this.clientReadyListeners
      );
      this.discordClientService.discordClient.on(
        Events.MessageCreate,
        this.messageCreateListeners
      );
    } catch (e) {
      error(e);
    }
  }

  private clientReadyListeners = async (): Promise<void> => {
    const { log, error } = this.trackerLoggerCreator.create('EVENTS');
    log(
      `${this.options.discordOptions.discordBotClientId} Discord Bot is ready!`
    );
    this.discordClientService.discordClient.user.setActivity(
      this.options.config.runtime.isProd
        ? '🏮 有什麼想跟我說嗎？'
        : `🏮 我是基於開發版本 ${process.env.SERVER_VERSION}，請不要跟我說話`,
      {
        type: this.options.config.runtime.isProd
          ? ActivityType.Listening
          : ActivityType.Watching,
      }
    );
  };

  // message create listeners
  private messageCreateListeners = async (
    message: Message<boolean>
  ): Promise<void> => {
    if (message.author.bot) return;

    const { log, verbose, error } = this.trackerLoggerCreator.create('EVENTS');

    const isNotNeedToResponse = this.isNotNeedToResponse(message);
    if (isNotNeedToResponse) {
      log('not prod and not develop channel, so no response');
      return;
    }

    const isDisableBotChannel = this.isDisableBotChannel(message);
    if (isDisableBotChannel) {
      log('this channel is disable bot channel');
      return;
    }

    const isNeedToResponse = this.isNeedToResponse(message);
    verbose(`isUserCreateMessage: ${isNeedToResponse}`);

    // if message is a reply
    log(`message is a reply: ${message?.reference ? true : false}`);
    if (await this.isReferenceAndNeedToResponse(message)) {
      verbose('is a reply message');
      this.botClient.emit('chatbot:discord:chat', message);
      return;
    }

    if (!isNeedToResponse) {
      log('not user create message, so no response');
      return;
    }

    // if message is a url
    const messageContent = message.content
      .replace(`<@${this.options.discordOptions.discordBotClientId}>`, '')
      .trim();

    //validate youtube url
    const isYtRequest = validateYoutubeUrl(messageContent);
    if (isYtRequest) {
      log(`message is a youtube url: ${isYtRequest}`);
      if (
        !this.options.discordOptions?.alphaWhitelistedUserIds?.includes(
          message.author.id
        )
      ) {
        this.botClient.emit('chatbot:discord:chat:reply', {
          text: '🎁 目前只有白名單的人才能使用此功能，請聯絡管理員開通',
          message,
        });
        return;
      }

      this.botClient.emit('chatbot:discord:chat:url:youtube', message);
      return;
    }

    if (this.hasPDFAttachment(message)) {
      this.botClient.emit('chatbot:discord:chat:url:docs', {
        message,
        type: DataSourceType.PDF,
      });
      return;
    }

    if (this.hasTXTAttachment(message)) {
      this.botClient.emit('chatbot:discord:chat:url:docs', {
        message,
        type: DataSourceType.TXT,
      });

      return;
    }

    if (this.hasImageAttachment(message)) {
      this.botClient.emit('chatbot:discord:chat:url:docs', {
        message,
        type: DataSourceType.TXT,
      });

      return;
    }

    if (messageContent.startsWith('url')) {
      this.botClient.emit('chatbot:discord:chat:url:docs', {
        message,
        type: DataSourceType.URL,
      });

      return;
    }

    if (this.hasAudioWithMP3OrWAVAttachment(message)) {
      this.botClient.emit('chatbot:discord:chat:audio:transcription', message);
      return;
    }

    if (this.hasAudioAttachment(message)) {
      const transcriptionMessage = await lastValueFrom(
        this.botClient.send('chatbot:discord:chat:audio:transcription', message)
      );

      if (!this.isPermanentChannel(message)) {
        log('not in permanent channel, so no response');
        return;
      }

      message.content = transcriptionMessage?.content;
    }

    if (this.isEmptyMessage(message)) {
      log('message is empty, so no response');
      return;
    }

    this.botClient.emit('chatbot:discord:chat', message);
    return;
  };

  private isNeedToResponse(message: Message<boolean>) {
    const { log, verbose, error } =
      this.trackerLoggerCreator.create('isNeedToResponse');

    const atBot = `<@${this.options.discordOptions.discordBotClientId}>`;

    const haveAttachment = message.attachments.size > 0;

    const haveAtBotMessage =
      message.content.startsWith(atBot) &&
      (message.content.replace(atBot, '').trim().length > 0 || haveAttachment);

    verbose(`message.channelId: ${message.channelId}`);
    verbose(`haveAtBotMessage: ${haveAtBotMessage}`);

    return (
      haveAtBotMessage ||
      (this.isPermanentChannel(message) && !message.reference)
    );
  }

  private isPermanentChannel(message: Message<boolean>) {
    return (
      message.channelId ===
        this.options.discordOptions.discordPermanentChannelId ||
      this.options.discordOptions.discordPermanentChannelIds.includes(
        message.channelId
      )
    );
  }

  private isDisableBotChannel(message: Message<boolean>) {
    return this.options.discordOptions.discordDisableBotChannelIds.includes(
      message.channelId
    );
  }

  private isNotNeedToResponse(message: Message<boolean>) {
    return (
      (this.options.config.runtime.isDev ||
        this.options.config.runtime.isStaging) &&
      message.channelId !==
        this.options.discordOptions.discordDevelopChannelId &&
      message.channelId !==
        this.options.discordOptions.discordPermanentChannelId &&
      !this.options.discordOptions.discordPermanentChannelIds.includes(
        message.channelId
      )
    );
  }

  private async isReferenceAndNeedToResponse(message: Message<boolean>) {
    const { log, verbose, error } = this.trackerLoggerCreator.create(
      'isReferenceAndNeedToResponse'
    );

    // if not reference
    if (
      !message?.reference ||
      !message?.reference?.messageId ||
      (!message?.content && !message?.attachments?.first())
    ) {
      return false;
    }

    const replyMessage = await (message.channel as TextChannel).messages.fetch(
      message.reference.messageId
    );

    if (
      !replyMessage?.author ||
      replyMessage.author.id !== this.options.discordOptions.discordBotClientId
    ) {
      verbose('reply message is not bot message, so no response');
      return false;
    }

    return true;
  }

  private isEmptyMessage(message: Message<boolean>) {
    const atBot = `<@${this.options.discordOptions.discordBotClientId}>`;
    return (
      !message.content || message.content.replace(atBot, '').trim().length === 0
    );
  }

  private hasPDFAttachment(message: Message<boolean>) {
    const attachment = message?.attachments?.first();
    if (!attachment) return false;

    // read attachment
    const attachmentName = attachment.name;
    const attachmentExtension = attachmentName.split('.').pop();

    return attachmentExtension === 'pdf';
  }

  // txt attachment
  private hasTXTAttachment(message: Message<boolean>) {
    const attachment = message?.attachments?.first();
    if (!attachment) return false;

    // read attachment
    const attachmentName = attachment.name;
    const attachmentExtension = attachmentName.split('.').pop();

    return attachmentExtension === 'txt';
  }

  // image attachment
  private hasImageAttachment(message: Message<boolean>) {
    const attachment = message?.attachments?.first();
    if (!attachment) return false;

    // read attachment
    const attachmentName = attachment.name;

    // like: (jpg|jpeg|png|gif|bmp)
    const attachmentExtension = attachmentName.split('.').pop();

    const imageRegEx = /\.(jpg|jpeg|png|gif|bmp)$/i;
    const isImage = imageRegEx.test(`.${attachmentExtension}`);

    return isImage;
  }

  // audio - ogg attachment
  private hasAudioAttachment(message: Message<boolean>) {
    const attachment = message?.attachments?.first();
    if (!attachment) return false;

    // read attachment
    const attachmentName = attachment.name;
    const attachmentExtension = attachmentName.split('.').pop();

    return attachmentExtension === 'ogg';
  }

  // audio - mp3, wav attachment
  private hasAudioWithMP3OrWAVAttachment(message: Message<boolean>) {
    const attachment = message?.attachments?.first();
    if (!attachment) return false;

    // read attachment
    const attachmentName = attachment.name;
    const attachmentExtension = attachmentName.split('.').pop();

    const audioRegEx = /\.(mp3|wav)$/i;
    const isAudio = audioRegEx.test(`.${attachmentExtension}`);

    return isAudio;
  }
}
