import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { google } from '@google-cloud/vision/build/protos/protos';
import { resolve } from 'path';

@Injectable()
export class CloudVisionService implements OnApplicationBootstrap {
  private client: ImageAnnotatorClient;

  onApplicationBootstrap() {
    this.client = new ImageAnnotatorClient({
      keyFilename: resolve(
        __dirname,
        '..',
        '..',
        'static',
        'key-files',
        'general-382514-77d9e50805af.json',
      ),
    });
  }

  async getImageText(
    imageUrl: string,
  ): Promise<google.cloud.vision.v1.IEntityAnnotation[]> {
    // Performs text detection on the gcs file
    const [result] = await this.client.documentTextDetection(imageUrl);
    const detections = result.textAnnotations;
    return detections;
  }
}
