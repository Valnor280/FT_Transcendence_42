import { Test, TestingModule } from '@nestjs/testing';
import { RoomLogService } from './room-log.service';

describe('RoomLogService', () => {
  let service: RoomLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomLogService],
    }).compile();

    service = module.get<RoomLogService>(RoomLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
