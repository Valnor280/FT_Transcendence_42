import { SubscribeMessage, WebSocketGateway, WebSocketServer,
	OnGatewayConnection, OnGatewayDisconnect,
	 OnGatewayInit } from '@nestjs/websockets';
  import { Logger, Module, UseGuards, Request, Inject } from '@nestjs/common';
  import { Socket, Server } from 'socket.io';
  import { PongService } from './pong/services/pong/pong.service';
  import { JwtAuthGuard } from './auth/utils/JwtGuard';
  import { AccountService } from './account/services/account/account.service';
  import { roomLog } from './typeorm';
  import { emit } from 'process';
  
  let role = { isleft: 0, isright: 0, isviewer: 0}
  
  
  @WebSocketGateway({ cors: true })
  
  
  export class PongGateway {
  
	constructor(private pongroom : PongService,
	  @Inject('ACCOUNT_SERVICE') private readonly accountService,
	  ){};
  
	// constructor (private pongroom : PongGateway, private serviceschat : ChatService){};
	  //    init socket
	  // @WebSocketServer() server: Server;
	  // private logger: Logger = new Logger('PongGateway');
	  private rooms:Array<PongService> = new Array<PongService>();
	  private waitingList:Array<Socket> = new Array<Socket>();
	  private waitingListid:Array<string> = new Array<string>();
	private waitingListspecial:Array<Socket> = new Array<Socket>();
	  private waitingListidspecial:Array<string> = new Array<string>();
	  private waitingListnoedge:Array<Socket> = new Array<Socket>();
	  private waitingListidnoedge:Array<string> = new Array<string>();
	  private waitingWatcherList:Array<Socket> = new Array<Socket>();
	  private waitingListChat:Array<{socket : Socket, matchid: number}> = new Array<{socket: Socket, matchid: number}>();
	  private waitingListChatid:Array<{name: string, matchid: number}> = new Array<{name: string, matchid: number}>();
	  private matchlist:Array<{leftname: string, rightname: string, rid: number, version: number}> = new Array<{leftname: string, rightname: string, rid: number, version: number}>();
	  private counter : number = 0;
	  private matchid : number = 0;
	  private start: number = 0;
  
	  
	  @SubscribeMessage('pongeject')
	  handlepongeject(client: Socket, data: any) : void {
			this.waitingList.forEach((element, index) => {
				if(element === client)
				{
					this.waitingList.splice(index, 1);
				}
			})
			this.waitingListspecial.forEach((element, index) => {
				if(element === client)
				{
					this.waitingListspecial.splice(index, 1);
				}
			})
			this.waitingListnoedge.forEach((element, index) => {
				if(element === client)
				{
					this.waitingListnoedge.splice(index, 1);
				}
			})

			this.waitingListid.forEach((element, index) => {
				if(element === data)
				{
					this.waitingListid.splice(index, 1);
				}
			})
			this.waitingListidspecial.forEach((element, index) => {
				if(element === data)
				{
					this.waitingListidspecial.splice(index, 1);
				}
			})
			this.waitingListidnoedge.forEach((element, index) => {
				if(element === data)
				{
					this.waitingListidnoedge.splice(index, 1);
				}
			})

			client.emit('stop');
	  }

	  @SubscribeMessage('pongplayrequest')
	  handlepongplayrequest(client: Socket, data: any): void {
		//console.log("new in list", client);
		//console.log(this.waitingList.length);
		this.waitingList.push(client);
		this.waitingListid.push(data);
		if (this.waitingList.length >= 2)
		  this.roommaker(this.waitingList[0], this.waitingList[1], this.waitingListid[0], this.waitingListid[1]);  
	  };
  
	  @SubscribeMessage('pongplayrequestspecial')
	  handlepongplayrequestspecial(client: Socket, data: any): void {
		console.log("new in list special");
		this.waitingListspecial.push(client);
		this.waitingListidspecial.push(data);
		if (this.waitingListspecial.length >= 2)
		  this.roommakerspecial(this.waitingListspecial[0], this.waitingListspecial[1], this.waitingListidspecial[0], this.waitingListidspecial[1]);  
	  };
  
	  @SubscribeMessage('pongplayrequestnoedge')
	  handlepongplayrequestnoedge(client: Socket, data: any): void {
		console.log("new in list noedge");
		this.waitingListnoedge.push(client);
		this.waitingListidnoedge.push(data);
		if (this.waitingListnoedge.length >= 2)
		  this.roommakernoedge(this.waitingListnoedge[0], this.waitingListnoedge[1], this.waitingListidnoedge[0], this.waitingListidnoedge[1]);  
	  };
  
	  @SubscribeMessage('pongspecatelist')
	  handlepongspecatelist(client: Socket): void {
		  client.emit('specatelist', this.matchlist);
	  }
  
	  @SubscribeMessage('pongwatchrequest')
	  handlepongwatchrequest(client: Socket, rooms: any): void {
		  const roomid = rooms.rid;
		  const roo = {room: rooms.rid, idl: rooms.lefname, idr: rooms.rightname};
		if(roomid >= 0 && roomid <= this.counter && this.rooms.length > 0 && this.rooms[roomid].role.isviewer < 150){
		  console.log("new watcher in list");
		  this.waitingWatcherList.push(client);
		  client.emit('roomassign', roo);
		  client.emit('hide');
		  client.join((this.counter - 1).toString());
		  this.rooms[roomid].setwatchrole(client)
		  this.waitingList.splice(0, 1);
		}
		else
		  console.log("room asked does not exist");
	  };
  
	  @SubscribeMessage('pongplayrequestfromchat')
	  handlepongplayrequestfromchat(client: Socket, data: any): void {
		console.log("new in list from chat", data);
  
		
		if(data.matchid >= 0)
		{
		  this.waitingListChat.forEach((element, index) => {
			  if(element.matchid === data.matchid) 
			  {
				  //console.log('chatlay', this.waitingListChat[index].socket, '\n\n', client, this.waitingListChatid[index].name, '\n\n', data.username, data.version)
				  this.roommakerchat(this.waitingListChat[index].socket, client, this.waitingListChatid[index].name, data.username, data.version);
				  this.waitingListChat[index].socket.emit('challengestart');
				  this.waitingListChat.splice(index, 1);
				  this.waitingListChatid.splice(index, 1);
				  console.log(this.waitingListChat);
			  }
		  });
		}
		else if (data.matchid === -1){
		  const roomwait = {socket: client, matchid: this.matchid}
		  this.waitingListChat.push(roomwait);
		  this.waitingListChatid.push({name: data.username, matchid: this.matchid});
		  console.log('chelou')
		  client.emit('challengemsg', {matchid: this.matchid, version : data.version});
		  this.matchid++;
		}  
	  };
  
	  matchmaker(){
		// match closest elo in this.waitingList
	  }
	  
	  // roommaker(leftplayerclient: Socket, rightplayerclient: Socket) {
	  roommaker(leftplayerclient: Socket, rightplayerclient: Socket, leftname: string, rightname: string) {
		//create new pong instance
		this.rooms.push(new PongService());
		//set room name
		// this.rooms.slice(-1)[0].set_roomid(this.counter);
		this.rooms.slice(-1)[0].roomid = this.counter;
		console.log("leght before", this.waitingList.length);
		//tell clients their room
		if(leftname == undefined)
		  leftname = 'test';
		if(rightname == undefined)
		  rightname = 'test';
		leftplayerclient.emit('roomassign', {room: this.counter, idl: leftname, idr: rightname});
		rightplayerclient.emit('roomassign', {room: this.counter, idl: leftname, idr: rightname});
		
		leftplayerclient.emit('hide');
		rightplayerclient.emit('hide');
		//put client in room
		leftplayerclient.join(this.counter.toString());
		rightplayerclient.join(this.counter.toString());
  
		leftplayerclient.broadcast.emit('startplaying', leftname);
		rightplayerclient.broadcast.emit('startplaying', rightname);
		//give roles
		this.rooms.slice(-1)[0].setroles(leftplayerclient, rightplayerclient, leftname, rightname);
		// remove clients from waiting list
		this.waitingList.splice(0, 2);
		this.waitingListid.splice(0, 2);
		// Socket.join(la room)
		
		// console.log("leght after", this.waitingList.length, "roomid", this.rooms.slice(-1)[0].roomid, "rooms number", this.rooms.length );
		// for (let index = 0; index < this.rooms.length; index++) {
		//   console.log("hello", this.rooms[index].roomid)
		  
		// }
	  //putmatchinlist
		  let match = {leftname, rightname, rid: this.rooms.slice(-1)[0].roomid, version: 0};
		  console.log('match', match)
		  this.matchlist.push(match);
		this.counter++;
	  };
  
	  roommakerspecial(leftplayerclient: Socket, rightplayerclient: Socket, leftname: string, rightname: string) {
		console.log("leght before");
		leftplayerclient.broadcast.emit('startplaying', leftname);
		rightplayerclient.broadcast.emit('startplaying', rightname);
		//create new pong instance
		this.rooms.push(new PongService());
		//set room name
		this.rooms.slice(-1)[0].roomid = this.counter;
		console.log("leght before", this.waitingListspecial.length);
		//tell clients their room
		  if(leftname == undefined)
			leftname = 'test';
		  if(rightname == undefined)
			rightname = 'test';
		leftplayerclient.emit('roomassign', {room: this.counter, idl: leftname, idr: rightname});
		rightplayerclient.emit('roomassign', {room: this.counter, idr: rightname, idl: leftname});
	   
		leftplayerclient.emit('hide');
		rightplayerclient.emit('hide');


		//put client in room
		leftplayerclient.join(this.counter.toString());
		rightplayerclient.join(this.counter.toString());
		//give roles
		this.rooms.slice(-1)[0].setroles(leftplayerclient, rightplayerclient, leftname, rightname);
		// remove clients from waiting list
		this.waitingListspecial.splice(0, 2);
		  this.waitingListidspecial.splice(0, 2);
		// Socket.join(la room)
		this.rooms.slice(-1)[0].setspecial(true);
		// console.log("leght after", this.waitingListspecial.length, "roomid", this.rooms.slice(-1)[0].roomid, "rooms number", this.rooms.length );
		// for (let index = 0; index < this.rooms.length; index++) {
		//   console.log("hello", this.rooms[index].roomid)
		  
		// }
	  //putmatchinlist
	  let match = {leftname, rightname, rid: this.rooms.slice(-1)[0].roomid, version: 1};
	  console.log('match', match)
	  this.matchlist.push(match);
		this.counter++;
	  };
  
	  roommakernoedge(leftplayerclient: Socket, rightplayerclient: Socket, leftname: string, rightname: string) {
		  console.log("leght before");

		  leftplayerclient.broadcast.emit('startplaying', leftname);
		  rightplayerclient.broadcast.emit('startplaying', rightname);
		  //create new pong instance
		  this.rooms.push(new PongService());
		  //set room name
		  this.rooms.slice(-1)[0].roomid = this.counter;
		  console.log("leght before", this.waitingListnoedge.length);
		  //tell clients their room
			if(leftname == undefined)
			  leftname = 'test';
			if(rightname == undefined)
			  rightname = 'test';
		  leftplayerclient.emit('roomassign', {room: this.counter, idl: leftname, idr: rightname});
		  rightplayerclient.emit('roomassign', {room: this.counter, idr: rightname, idl: leftname});
		  
		  leftplayerclient.emit('hide');
		  rightplayerclient.emit('hide');

		  //put client in room
		  leftplayerclient.join(this.counter.toString());
		  rightplayerclient.join(this.counter.toString());
		  //give roles
		  this.rooms.slice(-1)[0].setroles(leftplayerclient, rightplayerclient, leftname, rightname);
		  // remove clients from waiting list
		  this.waitingListnoedge.splice(0, 2);
			this.waitingListidnoedge.splice(0, 2);
		  // Socket.join(la room)
		  this.rooms.slice(-1)[0].setnoedge(true);
		  // console.log("leght after", this.waitingListspecial.length, "roomid", this.rooms.slice(-1)[0].roomid, "rooms number", this.rooms.length );
		  // for (let index = 0; index < this.rooms.length; index++) {
		  //   console.log("hello", this.rooms[index].roomid)
			
		  // }
		  let match = {leftname, rightname, rid: this.rooms.slice(-1)[0].roomid, version: 3};
		  console.log('match', match)
		  this.matchlist.push(match);
		  this.counter++;
		};
	  
		test(leftplayerclient: Socket, rightplayerclient: Socket, leftname: any, rightname: any, version: number) {
		  leftplayerclient.emit('challengestart');
		  rightplayerclient.emit('challengestart');
  
		  this.delay(1000);
  
		  leftplayerclient.emit('roomassign', {room: this.counter, idl: leftname, idr: rightname});
		  rightplayerclient.emit('roomassign', {room: this.counter, idr: rightname, idl: leftname});
		  leftplayerclient.emit('hide');
		  rightplayerclient.emit('hide');
  
		  //put client in room
		  leftplayerclient.join(this.counter.toString());
		  rightplayerclient.join(this.counter.toString());

		  leftplayerclient.broadcast.emit('startplaying', leftname);
		  rightplayerclient.broadcast.emit('startplaying', rightname);
		  //give roles
		  this.rooms.slice(-1)[0].setroles(leftplayerclient, rightplayerclient, leftname, rightname);
		  // remove clients from waiting list
		  if(version === 1)
			  this.rooms.slice(-1)[0].setspecial(true);
		  else if(version === 2)
			  this.rooms.slice(-1)[0].setnoedge(true);
		  
		  let match = {leftname, rightname, rid: this.rooms.slice(-1)[0].roomid, version: 3};
		  console.log('match', match)
		  this.matchlist.push(match);
		  this.counter++;
		}
	  async delay(ms: number) {
		  return await new Promise( resolve => setTimeout(resolve, ms) );
	  };
	  //make a room with players coming from chat 
	  roommakerchat(leftplayerclient: Socket, rightplayerclient: Socket, leftname: any, rightname: any, version: number) {
		  console.log("leght before Chatroom");
		  //create new pong instance
		  this.rooms.push(new PongService());
		  //set room name
		  this.rooms.slice(-1)[0].roomid = this.counter;
		  //tell clients their room
			if(leftname == undefined)
			  leftname = 'test';
			if(rightname == undefined)
			  rightname = 'test';
			  //console.log(leftplayerclient, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', rightplayerclient);
		  // leftplayerclient.emit('challengestart');
		  // rightplayerclient.emit('challengestart');
  
		  // this.delay(3000);
  
		  // leftplayerclient.emit('roomassign', {room: this.counter, idl: leftname, idr: rightname});
		  // rightplayerclient.emit('roomassign', {room: this.counter, idr: rightname, idl: leftname});
		  // leftplayerclient.emit('hide');
		  // rightplayerclient.emit('hide');
		  setTimeout(() => {this.test(leftplayerclient, rightplayerclient, leftname, rightname, version)}, 3000)
		};
  
  
  
  
	//init socket
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('PongGateway');
	
	// get_roomid(){
	//   return (this.roomid);
	// }
  
	// set_roomid(value : number){
	//   this.roomid = value;
	//   console.log("myid", this.roomid);
	// }
	//acknowledge server up
  //   afterInit(server: Server) {
  //    this.logger.log(`Server is up on port `); //${port}.`); 
  //    //pour francois comment acceder port de l'env
  //   }
   
	//disconnection
  //   handleDisconnect(client: Socket) {
  //    this.logger.log(`A user has disconnected: ${client.id}`);
  //    role.isleft = 0, role.isright = 0, role.isviewer = 0; //a changer
  //    this.isplaying = 0;
  //   }
   
	// const leftplayerclient: Socket = clientInformation;
	// const leftplayerclient: Socket;
	// const rightplayerclient: Socket;
  
  //   setroles(leftplayerclient: Socket, rightplayerclient: Socket){
  //       role.isleft = 1;
  //       leftplayerclient.emit('role', role);
  //       console.log(leftplayerclient.id + "im left");
  //       role.isright = 1;
  //       rightplayerclient.emit('role', role);
  //       console.log(rightplayerclient.id + "im right");
  //       console.log("" + this.roomid, "lolol")
  //   }
  
	@SubscribeMessage('startPong')
	handleStartPong(client: Socket, ...args: any[]) {
  // 	this.logger.log(`A user just connected: ${client.id}`);
  // 	//decide left right or viewer
  // 	//  if(role.isleft == 0 && role.isright == 0){
  // 	//    role.isleft = 1;
  // 	//  }
  // 	//  else if(role.isleft == 1 && role.isright == 0){
  // 	//    role.isright = 1;
  // 	//  }
  // 	//  else if(role.isleft == 1 && role.isright == 1){
  // 	//   //  role.isviewer++;
  //   //   role.isleft = 1;
  // 	//  }
  // 	//  client.emit('role', role);
	 }
  
  
  //   //handle point start
  timer(start: number, rid: number) {
		if(this.start === 1)
		{
			this.start = 0;
			return(this.rooms[rid].handlestartGame(this.server));
		}
  }
  @SubscribeMessage('startGame')
  handlestartGame(client: Socket, rid: any, pname: any) {
  //   console.log("hel", this.server);
  //   console.log('koko', this.rooms);
	  this.start++;
	  setTimeout(() => {this.timer(this.start, rid)}, 20000);
	  if(this.start === 2){
		  this.start = 0;
			return(this.rooms[rid].handlestartGame(this.server));
	  }
  };
  
  //handle hard stop
  @SubscribeMessage('hardstop')
	handlehardstopgame(client: Socket, rid: any): void {
	  console.log('coucou in est bien ici');
	  console.log(rid);
  
	  //client.emit('hardstop');
	  // this.accountService.PutMatchByName(this.rooms[rid].name.leftname, this.rooms[rid].getscores().leftscorecount, this.rooms[rid].name.rightname, this.rooms[rid].getscores().rightscorecount);
	  // this.rooms[rid].stopgame();
	  
	  // delete this.rooms[rid];
	  // // this.rooms.splice(rid, 1); // spprime la room de larray rooms
	  // //emit un disconnect de la room
	  
	  this.rooms[rid].leaveroom();
	  // delete this.rooms[rid];
	  return;
  };
  
  //handle point stop
  @SubscribeMessage('stop')
	handlestopgame(client: Socket, rid: any): void {
	  console.log('coucou in est bien ici');
	  console.log(rid, this.rooms[rid]);
	  this.matchlist.forEach((element, index) => {
		  console.log(element.rid);
		  if(element.rid == rid) 
		  {
			  this.matchlist.splice(index, 1);
		  }
	  });
	  this.accountService.PutMatchByName(this.rooms[rid].name.leftname, this.rooms[rid].getscores().leftscorecount, this.rooms[rid].name.rightname, this.rooms[rid].getscores().rightscorecount);
	  // this.rooms[rid].stopgame();
	  client.broadcast.emit('stopplaying', this.rooms[rid].name.leftname, this.rooms[rid].name.rightname);
	  client.emit('stopplaying', this.rooms[rid].name.leftname, this.rooms[rid].name.rightname);
	  // // delete this.rooms[rid];
	  // // this.rooms.splice(rid, 1); // spprime la room de larray rooms
	  // //emit un disconnect de la room
	  
	  this.rooms[rid].leaveroom();
	  // delete this.rooms[rid];
	  return;
  };
  
  //handle point pause
  @SubscribeMessage('pause')
  handlepausegame(client: Socket, rid: any): void {
	return(this.rooms[rid].pausegame());
  };
  
  //handle point play after pause
  @SubscribeMessage('play')
  handleplaygame(client: Socket, rid: any): void {
	return(this.rooms[rid].handleplaygame())
  };
  
	// //receive right player position
	@SubscribeMessage('updateright')
	handlerightOn(client: Socket, data: any): void {
	  // console.log("lol", data.rightplayerpositiony);
	  return(this.rooms[data.rid].rightOn(data.rightplayerpositiony));
		// this.data.rightplayery = rightplayerpositiony * this.globalheight;
	}
  
	//receive left player position
	@SubscribeMessage('updateleft')
	handleleftOn(client: Socket, data: any): void {
	  // console.log("lol", data.leftplayerpositiony);
	  return(this.rooms[data.rid].leftOn(data.leftplayerpositiony));
		// this.data.leftplayery = leftplayerpositiony * this.globalheight;
	}
  
	// @SubscribeMessage('pongplayrequest')
	// handlepongplayrequest(client: Socket, data: any): void {
	//   console.log("lol");
	// };
   }