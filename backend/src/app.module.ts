import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import entities from './typeorm';
import { PassportModule } from '@nestjs/passport';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongModule } from './pong/pong.module';
import { PongGateway} from './pong.gateway';
import { ChatGateway } from './chat.gateway';
import { ChatModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController, chatidController } from './chat/controller/chat/chat.controller';
import { ChatService } from './chat/service/chat/chat.service';
import { ChatIdService, CronService } from './chat/service/chat-id/chat-id.service';
import { RoomGateway } from './room.gateway';
import { PongService } from './pong/services/pong/pong.service';
import { ConfigModule } from '@nestjs/config';
import { RoomLogService } from './chat/service/room-log/room-log.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AccountModule, TypeOrmModule.forRoot({
	  type: 'postgres',
	  host: 'postgres_container',
	  port: 5432,
	  username: 'postgres',
	  password: 'pswd',
	  database: 'transcendence_db',
	  entities: entities,
	  synchronize: true,
  }),
  ScheduleModule.forRoot(),
  AuthModule,
	PassportModule.register({
		session: true,
	}),
	PongModule,
	ChatModule,
	ConfigModule.forRoot({
		envFilePath: '../env/back.env',
	})],
  controllers: [ChatController, chatidController],
  providers: [AppService, PongGateway, ChatGateway, ChatService, ChatIdService, PongService, RoomLogService, CronService],
})
export class AppModule {}