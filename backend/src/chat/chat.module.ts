import { Module } from '@nestjs/common';
import { ChatService } from './service/chat/chat.service';
import { ChatController } from './controller/chat/chat.controller';
import { ChatGateway } from 'src/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm'
import { blocMessages } from '../typeorm/blocMessages.entity'
import { chatRoomId } from 'src/typeorm';
import { ChatIdService } from './service/chat-id/chat-id.service';
import { AccountModule } from '../account/account.module'
import { AuthModule } from 'src/auth/auth.module';
import { roomLog } from 'src/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([chatRoomId, blocMessages, roomLog]), AccountModule, AuthModule],
  exports: [TypeOrmModule]
})
@Module({
  providers: [ChatService, ChatIdService],
  controllers: [ChatController],
  exports: [ChatService, blocMessages]
})
export class ChatModule {}
