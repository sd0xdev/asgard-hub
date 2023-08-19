import { BaseLangChainPrompt } from '@sd0x/nest-langchain';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { z } from 'zod';

export interface TranslateToEnglishPromptParams {
  userInput: string;
}

export interface TranslateToEnglishPromptResponse {
  translationResult: string;
}

export class TranslateToEnglishPrompt
  implements BaseLangChainPrompt<TranslateToEnglishPromptParams>
{
  private readonly inputVariables = ['userInput'];

  private readonly systemPrompt = `English translation assistant`;
  private readonly prompt = `You are an English translation assistant. Users will provide you with sentences in any language, and you need to translate them into English, paying attention to the tone and wording to ensure smooth language flow.
  
  Please note that there is no need to provide feedback on the translated content. Just focus on the translation. There is no need to include Input in the answer.
  
  ---
  Let's start translating the content:
  {${this.inputVariables[0]}}
`;

  private zodSchema = z.object({
    translationResult: z.string(),
  });

  generatePrompt() {
    const prompt = new ChatPromptTemplate({
      promptMessages: [
        SystemMessagePromptTemplate.fromTemplate(this.systemPrompt),
        HumanMessagePromptTemplate.fromTemplate(this.prompt),
      ],
      inputVariables: this.inputVariables,
    });

    return prompt;
  }

  getZodSchema() {
    return this.zodSchema;
  }

  generateInputVariables(
    params: TranslateToEnglishPromptParams
  ): TranslateToEnglishPromptParams {
    const inputVariables = {
      userInput: params.userInput,
    };

    return inputVariables;
  }
}
