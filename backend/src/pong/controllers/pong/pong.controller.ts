import { Controller, Inject } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { AccountService } from 'src/account/services/account/account.service';
import { PongService } from 'src/pong/services/pong/pong.service';

// // @WebSocketGateway(3000){};

@Controller('pong')
export class PongController {

	constructor (@Inject('ACCOUNT_SERVICE') private readonly accountService:
	AccountService){};

    //at machin requetes
    // io.on('connection', (socket) => {

    
    // @WebSocketGateway(81, { transports: ['websocket'] });

    // @SubscribeMessage('startGame')
    // handleEvent(@MessageBody() data: string): string {
    //   // return data;
    //   console.log("hello");
    //   return;
    // };
      
    // @SubscribeMessage('connection')
    // handleEvent(@MessageBody() data: string): string {
    //   // return data;
    //   console.log("hello");
    //   return;
    // }
    

}

// import {
//  SubscribeMessage,
//  WebSocketGateway,
//  OnGatewayInit,
//  WebSocketServer,
//  OnGatewayConnection,
//  OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
// import { Socket, Server } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

//  @WebSocketServer() server: Server;
//  private logger: Logger = new Logger('AppGateway');

//  @SubscribeMessage('msgToServer')
//  handleMessage(client: Socket, payload: string): void {
//   this.server.emit('msgToClient', payload);
//  }

//  afterInit(server: Server) {
//   this.logger.log('Init');
//  }

//  handleDisconnect(client: Socket) {
//   this.logger.log(`Client disconnected: ${client.id}`);
//  }

//  handleConnection(client: Socket, ...args: any[]) {
//   this.logger.log(`Client connected: ${client.id}`);
//  }
// }
