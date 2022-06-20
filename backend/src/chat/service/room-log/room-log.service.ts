import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { roomLog } from 'src/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoomLogService {
	constructor(
		@InjectRepository(roomLog)
		private roomlogRepository: Repository<roomLog>,
	){}

	async getAll(): Promise<roomLog[]>{
		return this.roomlogRepository.find();
	}
}
