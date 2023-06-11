import { ChatCompletionRequestMessage } from 'openai';
import { ChatGPTChant } from './chatgpt-chant.enum';
import {
  AIDataDetectChant,
  AWSExpertChant,
  AlreadyHandledAssistantChant,
  ArticleGeneratorChant,
  ArticleSummaryChant,
  AstrologyExpertChant,
  AzureDevOpsExpertChant,
  AzureExpertChant,
  BaseChant,
  BookAssistantChant,
  CircleCIExpertChant,
  CodeOptimizationExpertChant,
  CodeReviewExpertChant,
  CompanyAssistantChant,
  CopywritingCoachChant,
  DddExpertChant,
  DiscordExpertChant,
  DocsHelperChant,
  ExcelCoachChant,
  FallacyDetectChant,
  GPTExpertChant,
  GeneralChant,
  GitExpertChant,
  GithubActionExpertChant,
  GitlabCIExpertChant,
  GoogleCloudCoachChant,
  HelmExpertChant,
  ImageSummaryChant,
  JavaScriptExpertChant,
  JsonGeneratorChant,
  KubernetesCoachChant,
  MindmapAssistantChant,
  MongoDBExpertChant,
  NodejsCoachChant,
  PDFSummaryChant,
  PersonalLawyerChant,
  ReactExpertChant,
  RelationalDatabaseProfessorChant,
  RolePlayingAssistantChant,
  SQLGeneralChant,
  SoftwareSystemArchitectureExpertChant,
  SpiritualMentorChant,
  StandupMeetingAssistantChant,
  TXTSummaryChant,
  TranslateToChineseChant,
  TranslateToEnglishChant,
  TranslateToJapaneseChant,
  TypescriptCoachChant,
  URLSummaryChant,
  UbuntuExpertChant,
  UniversalAssistantChant,
  UrlHelperChant,
  UrlPartHelperChant,
  VimCoachChant,
  YoutubeSummaryChant,
} from './general-chant';

export function setupRequestMessage(
  chant: ChatGPTChant,
  customPrompt: { title: string; linguisticFraming: string }
): BaseChant {
  switch (chant) {
    case ChatGPTChant.general:
      return new GeneralChant(chant);
    case ChatGPTChant.translateToEnglish:
      return new TranslateToEnglishChant(chant);
    case ChatGPTChant.translateToChinese:
      return new TranslateToChineseChant(chant);
    case ChatGPTChant.translateToJapanese:
      return new TranslateToJapaneseChant(chant);
    case ChatGPTChant.fallacyDetect:
      return new FallacyDetectChant(chant);
    case ChatGPTChant.aiDataDetect:
      return new AIDataDetectChant(chant);
    case ChatGPTChant.vimCoach:
      return new VimCoachChant(chant);
    case ChatGPTChant.googleCloudCoach:
      return new GoogleCloudCoachChant(chant);
    case ChatGPTChant.azureExpert:
      return new AzureExpertChant(chant);
    case ChatGPTChant.awsExpert:
      return new AWSExpertChant(chant);
    case ChatGPTChant.excelCoach:
      return new ExcelCoachChant(chant);
    case ChatGPTChant.kubernetesCoach:
      return new KubernetesCoachChant(chant);
    case ChatGPTChant.sqlGeneral:
      return new SQLGeneralChant(chant);
    case ChatGPTChant.typescriptCoach:
      return new TypescriptCoachChant(chant);
    case ChatGPTChant.nodejsCoach:
      return new NodejsCoachChant(chant);
    case ChatGPTChant.copywritingCoach:
      return new CopywritingCoachChant(chant);
    case ChatGPTChant.personalLawyer:
      return new PersonalLawyerChant(chant);
    case ChatGPTChant.spiritualMentor:
      return new SpiritualMentorChant(chant);
    case ChatGPTChant.astrologyExpert:
      return new AstrologyExpertChant(chant);
    case ChatGPTChant.docsHelper:
      return new DocsHelperChant(chant);
    case ChatGPTChant.urlHelper:
      return new UrlHelperChant(chant);
    case ChatGPTChant.urlPartHelper:
      return new UrlPartHelperChant(chant);
    case ChatGPTChant.bookAssistant:
      return new BookAssistantChant(chant);
    case ChatGPTChant.companyAssistant:
      return new CompanyAssistantChant(chant);
    case ChatGPTChant.mindmapAssistant:
      return new MindmapAssistantChant(chant);
    case ChatGPTChant.universalAssistant:
      return new UniversalAssistantChant(chant);
    case ChatGPTChant.rolePlayingAssistant:
      return new RolePlayingAssistantChant(chant);
    case ChatGPTChant.alreadyHandledAssistant:
      return new AlreadyHandledAssistantChant(chant, customPrompt);
    case ChatGPTChant.relationalDatabaseProfessor:
      return new RelationalDatabaseProfessorChant(chant);
    case ChatGPTChant.discordExpert:
      return new DiscordExpertChant(chant);
    case ChatGPTChant.dddExpert:
      return new DddExpertChant(chant);
    case ChatGPTChant.youtubeSunmmary:
      return new YoutubeSummaryChant(chant);
    case ChatGPTChant.pdfSunmmary:
      return new PDFSummaryChant(chant);
    case ChatGPTChant.txtSunmmary:
      return new TXTSummaryChant(chant);
    case ChatGPTChant.urlSummary:
      return new URLSummaryChant(chant);
    case ChatGPTChant.imageSummary:
      return new ImageSummaryChant(chant);
    case ChatGPTChant.articleSummary:
      return new ArticleSummaryChant(chant);
    case ChatGPTChant.articleGenerator:
      return new ArticleGeneratorChant(chant);
    case ChatGPTChant.standupMeetingAssistant:
      return new StandupMeetingAssistantChant(chant);
    case ChatGPTChant.mongoDBExpert:
      return new MongoDBExpertChant(chant);
    case ChatGPTChant.softwareSystemArchitectureExpert:
      return new SoftwareSystemArchitectureExpertChant(chant);
    case ChatGPTChant.javaScriptExpert:
      return new JavaScriptExpertChant(chant);
    case ChatGPTChant.reactExpert:
      return new ReactExpertChant(chant);
    case ChatGPTChant.circleCIExpert:
      return new CircleCIExpertChant(chant);
    case ChatGPTChant.githubActionExpert:
      return new GithubActionExpertChant(chant);
    case ChatGPTChant.gitlabCIExpert:
      return new GitlabCIExpertChant(chant);
    case ChatGPTChant.azureDevOpsExpert:
      return new AzureDevOpsExpertChant(chant);
    case ChatGPTChant.helmExpert:
      return new HelmExpertChant(chant);
    case ChatGPTChant.ubuntuExpert:
      return new UbuntuExpertChant(chant);
    case ChatGPTChant.jsonGenerator:
      return new JsonGeneratorChant(chant);
    case ChatGPTChant.gitExpert:
      return new GitExpertChant(chant);
    case ChatGPTChant.gptExpert:
      return new GPTExpertChant(chant);
    case ChatGPTChant.codeReviewExpert:
      return new CodeReviewExpertChant(chant);
    case ChatGPTChant.codeOptimizationExpert:
      return new CodeOptimizationExpertChant(chant);
    default:
      return new GeneralChant(chant);
  }
}
