import { Socket,Server } from 'socket.io'

export class blocDto {
	username = ``;
  messages = [];
  date = '';
  socketid = '';
  is_user = false;
  userId: number;
  id : number | null;
  chatRoomId : number | null;
  constructor(username, msg, date, socketid, chatRoomId) 
  {
    this.socketid = socketid;
    this.username = username;
    this.messages = msg;
    this.date = date;
    this.chatRoomId = chatRoomId;
  }
}