import { Socket,Server } from 'socket.io'
import { Logger, Module } from '@nestjs/common';

export class dialogDto {
  event : string;
  username : string;
  addValue : string;
  socket : Socket;
  private logger : Logger = new Logger('dialgDto');
  constructor(event, usrnm, toadd, socket) 
  {
    this.event = event;
    this.addValue = toadd;
    this.username = usrnm;
    this.socket = socket;
  }
  connected(){
    this.logger.log("User " + this.socket.id + " : " + this.username + " just connected !");
  }
  logged(guestName : String){
    this.logger.log(this.username + " s'est log en " + guestName + " !");
  }
  disconnected(){
    this.logger.log("User " + this.socket.id + " : " + this.username + " just disconnected !");
  }
}