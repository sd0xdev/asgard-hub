import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeDlService } from './youtube-dl.service';

describe('YoutubeDlService', () => {
  it('test_get_id_from_valid_url', async () => {
    const youtubeDlService = new YoutubeDlService();
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const result = await youtubeDlService.getIdFromUrl(url);
    expect(result).toEqual('dQw4w9WgXcQ');
  });
});
