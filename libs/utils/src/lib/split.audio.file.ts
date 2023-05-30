import * as ffmpeg from 'fluent-ffmpeg';
import { PromisePool } from '@supercharge/promise-pool';

// 分割音頻檔案並返回 Promise<Array<string>>，每個元素都是新檔案的完整路徑
export function splitAudioFile(
  audioFilePath: string,
  segmentLength: number
): Promise<Array<string>> {
  const maxDuration = 7201;
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioFilePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const duration = metadata.format.duration ?? 0;

      if (duration > maxDuration) {
        reject(new Error('Audio is too long'));
        return;
      }

      const segmentCount = Math.ceil(duration / segmentLength);
      const durationMap: Array<{ start: number; end: number }> = [];

      for (let i = 0; i < segmentCount; i++) {
        const start = i * segmentLength;
        const end = Math.min(start + segmentLength, duration);
        durationMap.push({ start, end });
      }

      PromisePool.withConcurrency(3)
        .for(durationMap)
        .onTaskFinished(async (item, pool) => {
          const formatted =
            pool.processedPercentage().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + '%';
          console.log(`percentage: ${formatted}`);
        })
        .process(async (item, index, pool) => {
          const { start, end } = item;
          const command = ffmpeg(audioFilePath);

          const promise = new Promise<string>((resolve, reject) => {
            command
              .setStartTime(start)
              .setDuration(end - start)
              .on('error', (err) => {
                reject(err);
              })
              .on('end', () => {
                resolve(`${audioFilePath}_${index}.mp3`);
              })
              .outputOptions('-f mp3')
              .output(`${audioFilePath}_${index}.mp3`)
              .run();
          });

          return await promise;
        })
        .then((r) => {
          resolve(r.results?.filter((r) => r !== undefined) ?? []);
        });
    });
  });
}
