import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  Message,
  MessagePayload,
  MessageReplyOptions,
  TextChannel,
  ThreadAutoArchiveDuration,
  ThreadChannel,
} from 'discord.js';
import { List, Stack } from 'immutable';
import { ReplaySubject, catchError, lastValueFrom, of, switchMap } from 'rxjs';
import {
  DISCORD_BOT_MODULE_OPTIONS,
  DiSCORD_SPLIT_MESSAGE_TARGET,
  GPT_3_5_CHAR_COUNT,
} from '../../constants/discord-bot.constants';
import { ChatCompletionRequestMessage, CreateCompletionResponse } from 'openai';
import { DiscordBotModuleOptions } from '../../interface/discord-bot-module';
import { SetupKeywordService } from '../setup-keyword/setup-keyword.service';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { splitString } from '../../utils/split-string';
import { delay } from '../../utils/delay';
import {
  ChatGPTService,
  ChatOptions,
  LLMAIService,
} from '../../interface/chatgpt.service.interface';
import { DiscordClientService } from '../discord-client/discord-client.service';
import { ChatGPTChant } from '../../interface/chatgpt-chant.enum';
import { DataSourceType } from '../../interface/data-source-type.enum';
import { CreateCompletionResponseUsageForRPC } from '../../interface/create.completion.response.usage.for.rpc.interface';
import { AsgardLogger } from '@asgard-hub/nest-winston';

@Injectable()
export class MessageService implements OnModuleInit {
  private chatGPTService: ChatGPTService;
  private llmAIService: LLMAIService;
  private metadata = new Metadata();

  constructor(
    private readonly asgardLogger: AsgardLogger,
    @Inject(DISCORD_BOT_MODULE_OPTIONS)
    private readonly options: DiscordBotModuleOptions,
    @Inject('CHATGPT_PACKAGE')
    private readonly grpcClient: ClientGrpc,
    @Inject('LLMAI_PACKAGE')
    private readonly llmaiGrpcClient: ClientGrpc,
    private readonly keywordService: SetupKeywordService,
    private readonly discordClientService: DiscordClientService
  ) {}

  async onModuleInit() {
    this.chatGPTService =
      this.grpcClient.getService<ChatGPTService>('ChatGPTService');
    this.llmAIService =
      this.llmaiGrpcClient.getService<LLMAIService>('LLMAIService');

    this.metadata.set('authorization', this.options.config.rpcApiKey);
    this.metadata.set('azure-service', `${this.options.config.isAzureService}`);
  }

  async createYoutubeResponse(message: Message<boolean>) {
    // validate youtube url
    const messageContent = this.trimDiscordBotClientId(message);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = messageContent.match(urlRegex);
    const url = urls[0];

    this.asgardLogger.log(`youtube url: ${url}`);

    let currentMessage = message;
    await this.sendMessageReply(
      '好的，我來觀賞一下這個 YT ...📮',
      currentMessage
    );

    // create a message thread
    currentMessage = await this.setupThread(
      message.channel as TextChannel,
      url,
      currentMessage
    );

    // call chat service
    try {
      const { responses } = await lastValueFrom(
        this.chatGPTService.fetchYoutubeSummary(
          {
            url,
            user: message.author.id,
            isForced: messageContent.startsWith('YT') ? true : false,
          },
          this.metadata
        )
      );

      // if no response, return
      if (!responses || responses.length === 0)
        await this.sendMessageReply(
          '相關核心依賴沒有返回資料，可能需要檢查 🎏',
          currentMessage
        );

      // send message reply
      for (const response of responses) {
        const content = response.choices[0].message?.content;
        if (!content) continue;

        currentMessage = await this.sendMessageReply(content, currentMessage);
      }
    } catch (e) {
      this.asgardLogger.error(e);
      await this.sendMessageReply(
        '相關核心依賴發生錯誤，可能需要檢查 🎏',
        currentMessage
      );
    }
  }

  async createUrlContentResponse(
    message: Message<boolean>,
    dataSourceType: DataSourceType
  ) {
    // validate url
    const urlContent = this.trimDiscordBotClientId(message).replace('url', '');

    if (!urlContent) {
      await this.sendMessageReply(
        `沒有找到 ${dataSourceType} 檔案，請重新上傳 🎏`,
        message
      );
      return;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = urlContent.match(urlRegex);

    if (!urls || urls.length === 0) {
      await this.sendMessageReply(
        `沒有找到 ${dataSourceType} 檔案，請重新上傳 🎏`,
        message
      );
      return;
    }

    const url = urls[0];

    this.asgardLogger.log(`url: ${url}`);

    let currentMessage = message;
    await this.sendMessageReply(
      `好的，我來觀賞一下這個 ${dataSourceType} ...📮`,
      currentMessage
    );

    // create a message thread
    currentMessage = await this.setupThread(
      message.channel as TextChannel,
      url,
      currentMessage
    );

    // call chat service
    try {
      const messageContent = this.trimDiscordBotClientId(message);
      const { responses } = await lastValueFrom(
        this.chatGPTService.fetchUrlDocSummary(
          {
            url,
            user: message.author.id,
            isForced: messageContent.startsWith(`${dataSourceType}`)
              ? true
              : false,
            dataSourceType,
          },
          this.metadata
        )
      );

      // if no response, return
      if (!responses || responses.length === 0)
        await this.sendMessageReply(
          '相關核心依賴沒有返回資料，可能需要檢查 🎏',
          currentMessage
        );

      // send message reply
      for (const response of responses) {
        const content = response.choices[0].message?.content;
        if (!content) continue;

        currentMessage = await this.sendMessageReply(content, currentMessage);
      }
    } catch (e) {
      this.asgardLogger.error(e);
      await this.sendMessageReply(
        '相關核心依賴發生錯誤，可能需要檢查 🎏',
        currentMessage
      );
    }
  }

  async createUrlDocsResponse(
    message: Message<boolean>,
    dataSourceType: DataSourceType
  ) {
    // validate youtube url
    const docURL = message.attachments.first()?.url;
    const userMessageContent = this.trimDiscordBotClientId(message).replace(
      `${dataSourceType}`,
      ''
    );

    if (!docURL) {
      await this.sendMessageReply(
        `沒有找到 ${dataSourceType} 檔案，請重新上傳 🎏`,
        message
      );
      return;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = docURL.match(urlRegex);

    if (!urls || urls.length === 0) {
      await this.sendMessageReply(
        `沒有找到 ${dataSourceType} 檔案，請重新上傳 🎏`,
        message
      );
      return;
    }

    const url = urls[0];

    this.asgardLogger.log(`docs url: ${url}`);

    let currentMessage = message;
    await this.sendMessageReply(
      `好的，我來觀賞一下這個 ${dataSourceType} ...📮`,
      currentMessage
    );

    // create a message thread
    currentMessage = await this.setupThread(
      message.channel as TextChannel,
      url,
      currentMessage
    );

    // call chat service
    try {
      const messageContent = this.trimDiscordBotClientId(message);
      const { responses } = await lastValueFrom(
        this.chatGPTService.fetchUrlDocSummary(
          {
            url,
            user: message.author.id,
            isForced: messageContent.startsWith(`${dataSourceType}`)
              ? true
              : false,
            dataSourceType,
            options: {
              userExpectation: userMessageContent,
            },
          },
          this.metadata
        )
      );

      // if no response, return
      if (!responses || responses.length === 0)
        await this.sendMessageReply(
          '相關核心依賴沒有返回資料，可能需要檢查 🎏',
          currentMessage
        );

      // send message reply
      for (const response of responses) {
        const content = response.choices[0].message?.content;
        if (!content) continue;

        currentMessage = await this.sendMessageReply(content, currentMessage);
      }
    } catch (e) {
      this.asgardLogger.error(e);
      await this.sendMessageReply(
        '相關核心依賴發生錯誤，可能需要檢查 🎏',
        currentMessage
      );
    }
  }

  async createResponse(message: Message<boolean>) {
    message = await this.getRefreshedMessage(message);

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

          isMessage && (await this.sendMessageReply(response, message));

          this.asgardLogger.log(`successfully send message: ${response}`);
        }),
        catchError(async (e) => {
          this.asgardLogger.error(e);
          await this.sendMessageReply(
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

  async getRefreshedMessage(message: Message<boolean>) {
    const client = this.discordClientService.dClient;
    const refreshedChannel: TextChannel = (await client.channels.fetch(
      message.channelId,
      {
        force: true,
      }
    )) as TextChannel;

    const refreshedMessage = await refreshedChannel.messages.fetch(message.id);
    return refreshedMessage;
  }

  private isOggSpeechRef(message: Message<boolean>) {
    return (
      message.reference &&
      message.attachments.size > 0 &&
      message.attachments.first()?.url &&
      message.attachments.first()?.url.endsWith('.ogg')
    );
  }

  async createAudioTranscriptionResponse(message: Message<boolean>) {
    try {
      // show typing
      await (message.channel as TextChannel).sendTyping();

      const audioURL = message.attachments.first()?.url;

      if (!audioURL) {
        await this.sendMessageReply(`沒有找到音訊檔案，請重新上傳 🎏`, message);
        return;
      }

      this.asgardLogger.log(`setting up request...`);
      const response = await lastValueFrom(
        this.chatGPTService.fetchAudioTranscription(
          {
            url: audioURL,
            fileExtension: message.attachments.first()?.name?.split('.')?.[1],
          },
          this.metadata
        )
      );
      this.asgardLogger.log(`setting up response...`);
      let currentMessage = message;
      for (const r of response.responses) {
        currentMessage = await this.sendMessageReply(r.text, message);
        // show typing
        await (message.channel as TextChannel).sendTyping();
      }
      this.asgardLogger.log(`successfully get response`);

      return currentMessage;
    } catch (e) {
      this.asgardLogger.error(e);
      await this.sendMessageReply(
        `很遺憾，目前暫時無法服務您。請稍後再試， Message: ${e?.message}`,
        message
      );
    }
  }

  // setup content
  async setupContent(
    message: Message<boolean>,
    chant: ChatGPTChant = ChatGPTChant.general
  ) {
    let content = message.content;
    const role =
      message.author.id === this.options.discordOptions.discordBotClientId
        ? 'assistant'
        : 'user';

    let prefixTitle: string | undefined;
    if (role === 'user') {
      content = message.content
        .replace(`<@${this.options.discordOptions.discordBotClientId}>`, '')
        .trim();
      ({ content, chant, prefixTitle } = await this.keywordService.setupKeyword(
        content,
        chant,
        message
      ));
    }

    const chatCompletionRequestMessage: ChatCompletionRequestMessage = {
      role: role,
      content: content,
      name: role === 'user' ? message.author?.id ?? 'anonymous' : undefined,
    };

    return {
      chant,
      chatCompletionRequestMessage,
      prefixTitle,
    };
  }

  private async setupThread(
    channel: TextChannel,
    url: string,
    currentMessage: Message<boolean>
  ) {
    if (channel.isThread()) {
      return currentMessage;
    }

    const threads = await channel.threads.fetch();
    let thread: ThreadChannel<boolean> = threads.threads.find(
      (t) => t.name === url
    );

    // remove https:// or http:// and get 99 characters
    const titles = url.replace(/(^\w+:|^)\/\//, '').substring(0, 99);

    if (!thread) {
      thread = await channel.threads.create({
        name: titles,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      });
    } else {
      currentMessage = await this.sendMessageReply(
        `<#${thread.id}>`,
        currentMessage
      );
    }

    currentMessage = await thread.send({
      content: `👋🏻 正在努力分析內容...`,
      embeds: [
        {
          title: '📎 原始連結',
          url: url,
        },
      ],
    });
    return currentMessage;
  }

  // setup history messages
  async setupGeneralHistoryMessages(messageStack: Stack<Message<boolean>>) {
    let conversation: ChatCompletionRequestMessage[] = [];
    const totalSize = messageStack.size;
    let conversationChant = undefined;

    let totalCharCount = 0;

    while (messageStack.size > 0) {
      const currentMessage = messageStack.peek();
      const { chant, chatCompletionRequestMessage, prefixTitle } =
        await this.setupContent(currentMessage, conversationChant);

      if (!chatCompletionRequestMessage.content?.length) {
        messageStack = messageStack.pop();
        continue;
      }

      // if message is first message, then add prefix
      let retryCount = 0;
      let shouldRetry = true;

      // if message is first message, then add prefix
      if (messageStack.size === totalSize) {
        let messages: ChatCompletionRequestMessage[] = [];

        while (shouldRetry && retryCount < 3) {
          try {
            const response = await lastValueFrom(
              this.chatGPTService.generalMessages(
                {
                  chant: chant,
                  customPrompt: {
                    title: prefixTitle,
                    linguisticFraming:
                      chant === ChatGPTChant.alreadyHandledAssistant
                        ? chatCompletionRequestMessage.content
                        : undefined,
                  },
                },
                this.metadata
              )
            );
            messages = response.messages;
            shouldRetry = false;
          } catch (e) {
            // error code = cancal and auto retry twice
            if (e?.code === 1 && retryCount < 2) {
              messageStack = messageStack.push(currentMessage);
              continue;
            }
            throw e;
          }
          retryCount += 1;
        }

        if (!messages) {
          this.asgardLogger.log(`no prefix message, skip this message...`);
          messageStack = messageStack.pop();
          continue;
        }

        // add prefix special token
        conversation = conversation.concat(messages);
        conversationChant = chant;

        if (chant === ChatGPTChant.general) {
          chatCompletionRequestMessage.role = 'user';
        }
      }

      if (
        totalCharCount +
          (chatCompletionRequestMessage.content?.length ??
            GPT_3_5_CHAR_COUNT) >=
          GPT_3_5_CHAR_COUNT &&
        messageStack.size > 1
      ) {
        this.asgardLogger.log(`message is too long, skip this message...`);
        messageStack = messageStack.pop();
        continue;
      }

      // if message is first message & chant is alreadyHandledAssistant, then skip
      messageStack.size === totalSize &&
      chant === ChatGPTChant.alreadyHandledAssistant
        ? null
        : conversation.push(chatCompletionRequestMessage);

      totalCharCount += chatCompletionRequestMessage.content.length;
      messageStack = messageStack.pop();
    }

    return conversation;
  }

  async setupHistoryMessages(message: Message<boolean>) {
    const maxRun = 25;
    let messageStack = Stack<Message<boolean>>();
    let currentMessage = message;

    while (currentMessage?.reference && messageStack.size < maxRun) {
      messageStack = messageStack.push(currentMessage);
      currentMessage = await (
        currentMessage.channel as TextChannel
      ).messages.fetch(currentMessage.reference.messageId);
    }

    messageStack = messageStack.push(currentMessage);

    return messageStack;
  }

  async sendMessageReply(
    response: string,
    message: Message<boolean>,
    tokens = 0,
    isCode = false
  ) {
    let messageQueue = this.setupMessageQueue(
      response,
      DiSCORD_SPLIT_MESSAGE_TARGET
    );

    let currentMessage: Message<boolean> = message;

    this.asgardLogger.log(`start to send ${messageQueue.size} messages...`);
    while (messageQueue.size > 0) {
      try {
        this.asgardLogger.log(`total message queue: ${messageQueue.size}`);
        const content = messageQueue.first();
        if (!content) continue;
        messageQueue = messageQueue.shift();

        const payload: MessagePayload | MessageReplyOptions = {
          content: isCode ? `\`\`\`\n${content}\n\`\`\`` : content,
          allowedMentions: { parse: ['users'], repliedUser: true },
          embeds:
            tokens > 3090
              ? [
                  {
                    title:
                      '⚠️ Warning, this conversation is already over 3090 tokens, if tokens are over 4096, the conversation will not display. please split your conversation into multiple messages.',
                    color: 0xff0000,
                  },
                ]
              : undefined,
        };

        currentMessage = await currentMessage.reply(payload);

        // delay 256ms, to avoid rate limit
        await delay(256);
      } catch (e) {
        this.asgardLogger.error(e);
        await currentMessage.reply({
          content: `System error, please try again later.  ${e.message}`,
        });

        continue;
      }
    }

    this.asgardLogger.log(`successfully send message...`);
    return currentMessage;
  }

  private setupMessageQueue(response: string, splitTarget: number) {
    return List(splitString(response, splitTarget));
  }

  // respond user from chatgpt
  async responseUser(contents: ChatCompletionRequestMessage[], user: string) {
    try {
      let retryCount = 0;
      let shouldRetry = true;

      let result: CreateCompletionResponse | any;

      while (shouldRetry && retryCount < 3) {
        try {
          result = await lastValueFrom(
            this.chatGPTService.fetchGgtResponse(
              {
                contents,
                user,
              },
              this.metadata
            )
          );
          shouldRetry = false;
        } catch (e) {
          // error code = cancal and auto retry twice
          if (e?.code === 1) {
            shouldRetry = true;
          }
          shouldRetry = false;
          this.asgardLogger.error(e);
          throw new Error(`System Error: ${e.message} ${e.response?.data}`);
        }
        retryCount += 1;
      }

      const usage: CreateCompletionResponseUsageForRPC = result?.usage;

      this.asgardLogger.log(
        `use completion tokens: ${usage?.completionTokens}`
      );
      this.asgardLogger.log(`use prompt tokens: ${usage?.promptTokens}`);
      this.asgardLogger.log(`use tokens: ${usage?.totalTokens}`);

      return {
        response: result?.choices[0]?.message?.content,
        tokens: usage?.totalTokens,
      };
    } catch (e) {
      const eResponse = e.response?.data;
      this.asgardLogger.error(eResponse);
      this.asgardLogger.error(e, 'responseUser', e.message);
      return {
        response: `Sorry, System Error. Please try again later. ${
          eResponse?.error?.message ?? e.message
        }`,
        tokens: 0,
      };
    }
  }

  // create code response
  async createCodeResponse(message: Message<boolean>) {
    const code = message.content
      .replace(`<@${this.options.discordOptions.discordBotClientId}>`, '')
      .replace(`code`, '')
      .trim();

    // set up typing
    await (message.channel as TextChannel).sendTyping();

    const result = await this.responseUserFromCompletions(code);
    await this.sendMessageReply(result.response, message, result.tokens, true);
  }

  // response user from completions
  private async responseUserFromCompletions(prompt: string) {
    this.asgardLogger.log(`prompt code...`);
    this.asgardLogger.log(prompt);

    try {
      const result: CreateCompletionResponse | any = await lastValueFrom(
        this.chatGPTService.getCompletionResponse(
          {
            prompt,
            model: 'code-davinci-003',
          },
          this.metadata
        )
      );

      const usage: CreateCompletionResponseUsageForRPC = result?.usage;

      this.asgardLogger.log(
        `use completion tokens: ${usage?.completionTokens}`
      );
      this.asgardLogger.log(`use prompt tokens: ${usage?.promptTokens}`);
      this.asgardLogger.log(`use tokens: ${usage?.totalTokens}`);

      return {
        response: result?.choices[0]?.text,
        tokens: usage?.totalTokens,
      };
    } catch (e) {
      const eResponse = e.response?.data;
      this.asgardLogger.error(eResponse);
      this.asgardLogger.error(e, 'responseUserFromCompletions', e.message);
      return {
        response: `Sorry, System Error. Please try again later. ${
          eResponse?.error?.message ?? e.message
        }`,
        tokens: 0,
      };
    }
  }

  private trimDiscordBotClientId(message: Message<boolean>) {
    return message.content
      .replace(`<@${this.options.discordOptions.discordBotClientId}>`, '')
      .trim();
  }

  private async setupOggSpeech(messageStack: Stack<Message<boolean>>) {
    this.asgardLogger.log(`start to setup ogg...`);
    for (const message of messageStack) {
      try {
        const url = message.attachments.first()?.url;
        if (!url) continue;

        const response = await lastValueFrom(
          this.chatGPTService.fetchAudioTranscription(
            {
              url: url,
              fileExtension: message.attachments.first()?.name?.split('.')?.[1],
            },
            this.metadata
          )
        );

        const content = response.responses.map((r) => r.text).join('\n');
        message.content = content;
      } catch (e) {
        this.asgardLogger.error(e);
      }
    }

    this.asgardLogger.log(`successfully setup ogg...`);
    return messageStack;
  }
}
