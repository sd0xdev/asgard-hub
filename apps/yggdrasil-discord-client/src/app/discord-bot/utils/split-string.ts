import * as nodejieba from 'nodejieba';

export function splitString(
  str: string,
  maxLength: number,
  maxTries = 10
): string[] {
  const queueMessage: string[] = [];

  const words = nodejieba.cut(str);

  let truncatedWords = [];
  let currentLength = 0;
  for (const word of words) {
    const wordLength = Buffer.from(word, 'utf-8').length;
    if (currentLength + wordLength > maxLength) {
      queueMessage.push(truncatedWords.join(''));
      truncatedWords = [];
      currentLength = 0;
    } else {
      truncatedWords.push(word);
      currentLength += wordLength;
    }
  }

  // don't forget the last one
  queueMessage.push(truncatedWords.join(''));
  return queueMessage.filter((m) => m.length > 0);
}
