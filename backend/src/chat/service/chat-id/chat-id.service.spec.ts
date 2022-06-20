import { Test, TestingModule } from '@nestjs/testing';
import { ChatIdService } from './chat-id.service';

describe('ChatIdService', () => {
  let service: ChatIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatIdService],
    }).compile();

    service = module.get<ChatIdService>(ChatIdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
