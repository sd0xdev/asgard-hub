import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function splitString(
  content: string,
  size: number
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: size,
    chunkOverlap: 1,
  });

  return await splitter.splitText(content);
}
