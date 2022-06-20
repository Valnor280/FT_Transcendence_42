import { SubscribeMessage, WebSocketGateway, WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect,
   OnGatewayInit } from '@nestjs/websockets';
import { Logger, Module } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PongGateway } from './pong.gateway';
import { ChatService } from './chat/service/chat/chat.service';
import { Client } from 'socket.io/dist/client';
@WebSocketGateway()
export class RoomGateway {
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

    // constructor (private pongroom : PongGateway, private serviceschat : ChatService){};
    // //    init socket
    // // @WebSocketServer() server: Server;
    // // private logger: Logger = new Logger('PongGateway');
    // private rooms:Array<PongGateway> = new Array<PongGateway>();
    // private waitingList:Array<Socket> = new Array<Socket>();
    // private counter : number = 0;
    // @SubscribeMessage('pongplayrequest')
    // handlepongplayrequest(client: Socket, data: any): void {
    //   console.log("new in list");
    //   this.waitingList.push(client);
      
    //   if (this.waitingList.length >= 2)
    //     this.roommaker(this.waitingList[0], this.waitingList[1]);  
    // };
    

    // roommaker(leftplayerclient: Socket, rightplayerclient: Socket) {
    //   //create new pong instance
    //   this.rooms.push(new PongGateway());
    //   //set room name
    //   // this.rooms.slice(-1)[0].set_roomid(this.counter);
    //   this.rooms.slice(-1)[0].roomid = this.counter;
    //   console.log("leght before", this.waitingList.length);
    //   //tell clients their room
    //   leftplayerclient.emit('roomassign', this.counter);
    //   rightplayerclient.emit('roomassign', this.counter);
    //   //put client in room
    //   leftplayerclient.join(this.counter.toString());
    //   rightplayerclient.join(this.counter.toString());
    //   //give roles
    //   this.rooms.slice(-1)[0].setroles(leftplayerclient, rightplayerclient);
    //   // remove clients from waiting list
    //   this.waitingList.splice(0, 2);
    //   // Socket.join(la room)
      
    //   console.log("leght after", this.waitingList.length, "roomid", this.rooms.slice(-1)[0].roomid, "rooms number", this.rooms.length );
    //   for (let index = 0; index < this.rooms.length; index++) {
    //     console.log("hello", this.rooms[index].roomid)
        
    //   }
    //   this.counter++;
    //   //delete from lwaitiimlist
    //   // this.rooms.forEach((elem) => {
    //   //     console.log("foreach", elem.get_roomid());
    //   // })
    // };
    //  matchmaking(){};
    //  launchroom(){};
    //  closeroom(){};
  
}
