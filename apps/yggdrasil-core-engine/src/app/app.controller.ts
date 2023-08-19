import { Controller } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  getData() {
    return 'OK';
  }
}
