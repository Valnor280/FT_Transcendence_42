import { Socket,Server } from 'socket.io'

export class chatIdDto {
  id : number | null;
  usernames : string | null;
  constructor(usernames) 
  {
    this.usernames = usernames;
  }
}