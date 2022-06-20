import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  private last_message

  getHello(): string {
    return 'Hello World!';

  }
}
