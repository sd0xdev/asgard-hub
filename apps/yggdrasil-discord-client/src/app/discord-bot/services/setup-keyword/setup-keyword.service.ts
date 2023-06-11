import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Message } from 'discord.js';
import { CreateChatCompletionResponse } from 'openai';
import pdfParse from 'pdf-parse';
import { lastValueFrom } from 'rxjs';
import {
  TrackerLoggerCreator,
  LoggerHelperService,
} from '@asgard-hub/nest-winston';
import {
  DISCORD_BOT_MODULE_OPTIONS,
  GPT_3_5_CHAR_URL_COUNT,
} from '../../constants/discord-bot.constants';
import { Metadata } from '@grpc/grpc-js';
import { ClientGrpc } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import * as cheerio from 'cheerio';
import { DiscordBotModuleOptions } from '../../interface/discord-bot-module';
import { ChatGPTChant } from '../../interface/chatgpt-chant.enum';
import { ChatGPTService } from '../../interface/chatgpt.service.interface';

@Injectable()
export class SetupKeywordService implements OnModuleInit {
  private readonly trackerLoggerCreator: TrackerLoggerCreator;
  private chatGPTService: ChatGPTService;
  private metadata = new Metadata();

  constructor(
    loggerHelperService: LoggerHelperService,
    @Inject(DISCORD_BOT_MODULE_OPTIONS)
    private readonly options: DiscordBotModuleOptions,
    @Inject('CHATGPT_PACKAGE')
    private readonly grpcClient: ClientGrpc,
    private readonly httpService: HttpService
  ) {
    this.trackerLoggerCreator = loggerHelperService.create(
      SetupKeywordService.name
    );
  }

  async onModuleInit() {
    this.chatGPTService = await this.grpcClient.getService<ChatGPTService>(
      'ChatGPTService'
    );

    this.metadata.set('authorization', this.options.config.rpcApiKey);
  }

  async setupKeyword(
    content: string,
    chant: ChatGPTChant,
    message: Message<boolean>
  ) {
    const { log } = this.trackerLoggerCreator.create(`EVENT: setupKeyword`);

    log(`----- start -----`);

    // url Helper
    if (content.startsWith('http')) {
      chant = ChatGPTChant.urlHelper;

      // fetch url content
      const urlContent = await this.createUrlMessage(content.trim());

      content = `網址標題: ${
        urlContent.title
      } 網址內容如下:「 ${urlContent.content.slice(
        0,
        GPT_3_5_CHAR_URL_COUNT
      )} 」\n請你幫忙閱讀內容，並且盡量詳細的總結以上內容，給予 5 至 8 個重點整理。同時，確保返回的內容是繁體中文，謝謝！ Please answer in Traditional Chinese.`;
    }

    // translate to english
    if (
      content.startsWith('toe') ||
      chant === ChatGPTChant.translateToEnglish
    ) {
      chant = ChatGPTChant.translateToEnglish;
      content = `translate: "${content.replace('toe', '').trim()}"`;
    }

    // translate to chinese
    if (
      content.startsWith('toc') ||
      chant === ChatGPTChant.translateToChinese
    ) {
      chant = ChatGPTChant.translateToChinese;
      content = `翻譯: 「${content.replace('toc', '').trim()}」`;
    }

    // translate to japanese
    if (
      content.startsWith('toj') ||
      chant === ChatGPTChant.translateToJapanese
    ) {
      chant = ChatGPTChant.translateToJapanese;
      content = `翻訳: 「${content.replace('toj', '').trim()}」`;
    }

    // fallacy detect
    if (content.startsWith('fd') || chant === ChatGPTChant.fallacyDetect) {
      chant = ChatGPTChant.fallacyDetect;
      content = `檢測: ${content.replace('fd', '').trim()}\n\n結果:`;
    }

    // ai data detect
    if (content.startsWith('aidata.') || chant === ChatGPTChant.aiDataDetect) {
      chant = ChatGPTChant.aiDataDetect;
      content = `檢測:「${content.replace('aidata.', '').trim()}」\n\n結果:`;
    }

    // excel coach
    if (content.startsWith('excel') || chant === ChatGPTChant.excelCoach) {
      chant = ChatGPTChant.excelCoach;
      content = `問題: ${content.replace('excel', '').trim()}\n\n解答:`;
    }

    // vim coach
    if (content.startsWith('vim') || chant === ChatGPTChant.vimCoach) {
      chant = ChatGPTChant.vimCoach;
      content = `問題: ${content.replace('vim', '').trim()}\n\n解答:`;
    }

    // google cloud coach
    if (content.startsWith('gcp') || chant === ChatGPTChant.googleCloudCoach) {
      chant = ChatGPTChant.googleCloudCoach;
      content = `問題: ${content.replace('gcp', '').trim()}\n\n解答:`;
    }

    // aws expert
    if (content.startsWith('aws') || chant === ChatGPTChant.awsExpert) {
      chant = ChatGPTChant.awsExpert;
      content = `問題: ${content.replace('aws', '').trim()}\n\n解答:`;
    }

    // azure expert
    if (content.startsWith('azure') || chant === ChatGPTChant.azureExpert) {
      chant = ChatGPTChant.azureExpert;
      content = `問題: ${content.replace('azure', '').trim()}\n\n解答:`;
    }

    // k8s coach
    if (content.startsWith('k8s') || chant === ChatGPTChant.kubernetesCoach) {
      chant = ChatGPTChant.kubernetesCoach;
      content = `問題: ${content.replace('k8s', '').trim()}\n\n解答:`;
    }

    // sql general
    if (content.startsWith('sql') || chant === ChatGPTChant.sqlGeneral) {
      chant = ChatGPTChant.sqlGeneral;
      content = `產生: ${content.replace('sql', '').trim()}\n\n成果:`;
    }

    // typescript coach
    if (content.startsWith('ts') || chant === ChatGPTChant.typescriptCoach) {
      chant = ChatGPTChant.typescriptCoach;
      content = `問題: ${content.replace('ts', '').trim()}\n\n解答:`;
    }

    // nodejs coach
    if (content.startsWith('node') || chant === ChatGPTChant.nodejsCoach) {
      chant = ChatGPTChant.nodejsCoach;
      content = `問題: ${content.replace('node', '').trim()}\n\n解答:`;
    }

    // copywriting coach
    if (
      content.startsWith('copywriting') ||
      chant === ChatGPTChant.copywritingCoach
    ) {
      chant = ChatGPTChant.copywritingCoach;
      content = `keyword: ${content
        .replace('copywriting', '')
        .trim()}\n\n產生:`;
    }

    // personal lawyer
    if (content.startsWith('lawyer') || chant === ChatGPTChant.personalLawyer) {
      chant = ChatGPTChant.personalLawyer;
      content = `問題: ${content.replace('lawyer', '').trim()}\n\n解答:`;
    }

    // spiritual mentor
    if (content.startsWith('spir.') || chant === ChatGPTChant.spiritualMentor) {
      chant = ChatGPTChant.spiritualMentor;
      content = `問題: ${content.replace('spiritual', '').trim()}\n\n解答:`;
    }

    // astrology Expert
    if (content.startsWith('ast.') || chant === ChatGPTChant.astrologyExpert) {
      chant = ChatGPTChant.astrologyExpert;
      content = `內容: 「${content.replace('astrology', '').trim()}」\n\n分析:`;
    }

    // book assistant
    if (content.startsWith('book') || chant === ChatGPTChant.bookAssistant) {
      chant = ChatGPTChant.bookAssistant;
      content = `指定圖書: ${content.replace('book', '').trim()}\n\n內容:`;
    }

    // company assistant
    if (
      content.startsWith('company') ||
      chant === ChatGPTChant.companyAssistant
    ) {
      chant = ChatGPTChant.companyAssistant;
      content = `我想了解: ${content
        .replace('company', '')
        .trim()} 公司\n\n相關資訊:`;
    }

    // mindmapAssistant
    if (
      content.startsWith('mindmap') ||
      chant === ChatGPTChant.mindmapAssistant
    ) {
      chant = ChatGPTChant.mindmapAssistant;
      content = `「${content.replace('mindmap', '').trim()}」`;
    }

    // role playing assistant
    if (
      content.startsWith('rpa') ||
      chant === ChatGPTChant.rolePlayingAssistant
    ) {
      chant = ChatGPTChant.rolePlayingAssistant;
      content = `title: [${content.replace('rpa', '').trim()}]\n\n`;
    }

    let prefixTitle;
    // universal assistant
    if (content.startsWith('ua') || chant === ChatGPTChant.universalAssistant) {
      chant = ChatGPTChant.universalAssistant;
      const uaWhat = content.replace('ua', '').trim();
      const title = `Title: ${uaWhat}`;
      const { messages } = await lastValueFrom<{ messages }>(
        this.chatGPTService.generalMessages({ chant }, this.metadata)
      );
      const prefixContents = messages;
      prefixContents.push({
        role: 'user',
        content: title,
      });

      let retryCount = 0;
      let shouldRetry = true;

      let prefixContentsResponse: CreateChatCompletionResponse;

      while (shouldRetry && retryCount < 3) {
        try {
          prefixContentsResponse = await lastValueFrom(
            this.chatGPTService.fetchGgtResponse(
              {
                contents: prefixContents,
                user: message.author.id,
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
          throw e;
        }
        retryCount += 1;
      }

      let prefixSpell = prefixContentsResponse?.choices[0]?.message.content;

      if (prefixSpell.startsWith('Prompt')) {
        prefixSpell = prefixSpell.replace('Prompt', '').trim();
      }

      prefixTitle = uaWhat;
      content = `${prefixSpell} Please answer in Traditional Chinese.`;
      chant = ChatGPTChant.alreadyHandledAssistant;
    }

    // relation database professor
    if (
      content.startsWith('rdb') ||
      chant === ChatGPTChant.relationalDatabaseProfessor
    ) {
      chant = ChatGPTChant.relationalDatabaseProfessor;
      content = `問題: ${content.replace('rdb', '').trim()}\n\n解答:`;
    }

    // ddd expert
    if (content.startsWith('ddd') || chant === ChatGPTChant.dddExpert) {
      chant = ChatGPTChant.dddExpert;
      content = `問題: ${content.replace('ddd', '').trim()}\n\n解答:`;
    }

    // article summary
    if (content.startsWith('as') || chant === ChatGPTChant.articleSummary) {
      chant = ChatGPTChant.articleSummary;
      content = `文章: ${content.replace('as', '').trim()}\n\n總結:`;
    }

    // article generator
    if (content.startsWith('ag') || chant === ChatGPTChant.articleGenerator) {
      chant = ChatGPTChant.articleGenerator;
      content = `關鍵段落: ${content.replace('ag', '').trim()}\n\n成果:`;
    }

    // standupMeetingAssistant
    if (
      content.startsWith('standup') ||
      chant === ChatGPTChant.standupMeetingAssistant
    ) {
      chant = ChatGPTChant.standupMeetingAssistant;
      content = `昨日工作: ${content.replace('standup', '').trim()}\n\n輸出`;
    }

    // mongodb expert
    if (content.startsWith('mongodb') || chant === ChatGPTChant.mongoDBExpert) {
      chant = ChatGPTChant.mongoDBExpert;
      content = `問題: ${content.replace('mongodb', '').trim()}\n\n解答:`;
    }

    // software architect
    if (
      content.startsWith('sa') ||
      chant === ChatGPTChant.softwareSystemArchitectureExpert
    ) {
      chant = ChatGPTChant.softwareSystemArchitectureExpert;
      content = `問題: ${content.replace('sa', '').trim()}\n\n設計方案:`;
    }

    // json generator
    if (content.startsWith('json') || chant === ChatGPTChant.jsonGenerator) {
      chant = ChatGPTChant.jsonGenerator;
      content = `轉換: ${content.replace('json', '').trim()}\n\n結果:`;
    }

    // javascript expert
    if (content.startsWith('js') || chant === ChatGPTChant.javaScriptExpert) {
      chant = ChatGPTChant.javaScriptExpert;
      content = `問題: ${content.replace('js', '').trim()}\n\n解答:`;
    }

    // react expert
    if (content.startsWith('react') || chant === ChatGPTChant.reactExpert) {
      chant = ChatGPTChant.reactExpert;
      content = `問題: ${content.replace('react', '').trim()}\n\n解答:`;
    }

    // circleci expert
    if (
      content.startsWith('circleci') ||
      chant === ChatGPTChant.circleCIExpert
    ) {
      chant = ChatGPTChant.circleCIExpert;
      content = `問題: ${content.replace('circleci', '').trim()}\n\n解答:`;
    }

    // github action expert
    if (
      content.startsWith('gaction') ||
      chant === ChatGPTChant.githubActionExpert
    ) {
      chant = ChatGPTChant.githubActionExpert;
      content = `問題: ${content.replace('gaction', '').trim()}\n\n解答:`;
    }

    // gitlab ci expert
    if (content.startsWith('glci') || chant === ChatGPTChant.gitlabCIExpert) {
      chant = ChatGPTChant.gitlabCIExpert;
      content = `問題: ${content.replace('glci', '').trim()}\n\n解答:`;
    }

    // azure devops expert
    if (
      content.startsWith('azdevops') ||
      chant === ChatGPTChant.azureDevOpsExpert
    ) {
      chant = ChatGPTChant.azureDevOpsExpert;
      content = `問題: ${content.replace('azdevops', '').trim()}\n\n解答:`;
    }

    // helm expert
    if (content.startsWith('helm') || chant === ChatGPTChant.helmExpert) {
      chant = ChatGPTChant.helmExpert;
      content = `問題: ${content.replace('helm', '').trim()}\n\n解答:`;
    }

    // ubuntu expert
    if (content.startsWith('ubuntu') || chant === ChatGPTChant.ubuntuExpert) {
      chant = ChatGPTChant.ubuntuExpert;
      content = `問題: ${content.replace('ubuntu', '').trim()}\n\n解答:`;
    }

    // git expert
    if (content.startsWith('git') || chant === ChatGPTChant.gitExpert) {
      chant = ChatGPTChant.gitExpert;
      content = `問題: ${content.replace('git', '').trim()}\n\n解答:`;
    }

    // gpt expert
    if (content.startsWith('gpt') || chant === ChatGPTChant.gptExpert) {
      chant = ChatGPTChant.gptExpert;
      content = `問題: ${content.replace('gpt', '').trim()}\n\n解答:`;
    }

    // code review expert
    if (content.startsWith('cre') || chant === ChatGPTChant.codeReviewExpert) {
      chant = ChatGPTChant.codeReviewExpert;
      content = `審查: ${content.replace('cre', '').trim()}\n\n建議:`;
    }

    // code optimization expert
    if (
      content.startsWith('coe') ||
      chant === ChatGPTChant.codeOptimizationExpert
    ) {
      chant = ChatGPTChant.codeOptimizationExpert;
      content = `優化: ${content.replace('coe', '').trim()}\n\n建議:`;
    }

    log(`----- End -----`);
    return { content, chant, prefixTitle };
  }

  // create url message
  async createUrlMessage(url: string) {
    const { log } = this.trackerLoggerCreator.create(`EVENT: createUrlMessage`);

    log(`start to read url: ${url}`);
    const response = this.httpService.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    const result = await lastValueFrom(response);

    const buffer = Buffer.from(result.data);
    const $ = cheerio.load(buffer);

    const title = $('title').text();

    let content = '';

    // Find all div and span elements
    let target = $('main').find('h1, h2, p');

    if (target.length < 10) {
      target = $('body').find('h1, h2, p');
    }

    // Iterate over each div and span element and print its text content
    target.each((i, element) => {
      const text = $(element).text();
      content += text;
    });

    return {
      title,
      content,
    };
  }

  async createAttachmentMessage(message: Message<boolean>) {
    const attachment = message.attachments.first();
    if (!attachment)
      return {
        title: 'none',
        content: 'none',
      };

    // read attachment
    const attachmentUrl = attachment.url;
    const attachmentName = attachment.name;
    const attachmentExtension = attachmentName.split('.').pop();

    if (attachmentExtension !== 'pdf') return;

    // read pdf to buffer by httpService
    const response = this.httpService.get<ArrayBuffer>(attachmentUrl, {
      responseType: 'arraybuffer',
    });

    const result = await lastValueFrom(response);

    const buffer = Buffer.from(result.data);
    const pdfContent = await pdfParse(buffer);

    return {
      title: attachmentName,
      content: pdfContent?.text ?? 'none',
    };
  }
}
