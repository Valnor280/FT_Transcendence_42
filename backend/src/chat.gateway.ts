import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Controller,
	Inject,
	Get,
	Query,
	Put,
	Delete,
	Request,
	Headers,
	Param,
	HttpException,
	HttpStatus,
	UseInterceptors,
	ClassSerializerInterceptor,
	ParseIntPipe,
	NotFoundException,
	UseFilters,
	Post,
	Body,
	UsePipes,
	ValidationPipe,
	UseGuards,
	UploadedFile,
	Res,
	ParseArrayPipe,
  ConsoleLogger
} from '@nestjs/common';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger, Module} from '@nestjs/common';
import { Socket,Server } from 'socket.io'
import { ChatService } from './chat/service/chat/chat.service' 
import { blocDto } from './chat/bloc.dto'
import { PongGateway } from './pong.gateway';
import { JwtAuthGuard } from 'src/auth/utils/JwtGuard';
import { request } from 'http';
import { AuthService } from './auth/services/auth/auth.service';
import { LockNotSupportedOnGivenDriverError } from 'typeorm';
import { decode } from 'punycode';
import { User } from './typeorm';
import { HttpExceptionFilter } from 'src/account/filters/HttpException.filter';


@WebSocketGateway({ cors: true, credentials: true})
export class ChatGateway  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor (private service : ChatService,
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    @Inject('ACCOUNT_SERVICE') private readonly accountService)
    {};
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  async decoder(token : string){
    let elem = await this.authService.decodeToken(token);
    if (elem == null || elem == undefined)
      return (null);
    let user = await this.accountService.findAccountByLogin(elem['login42']);
		if (user == null)
			return;
    return (user.username);
  }
  async decoder2(token : string){
    let elem = await this.authService.decodeToken(token);
    if (elem == null || elem == undefined)
      return (null);
    let user = await this.accountService.findAccountByLogin(elem['login42']);
		if (user == null)
			return;
    return (user);
  }
  afterInit(server: Server) {
    this.logger.log("Server is on Port: " + process.env.PORT);
  }
  async handleDisconnect(client: Socket) {
    let myName = await this.decoder(client.handshake.headers.authorization);
    return (this.service.disconnected(client, myName));
   }
  async handleConnection(client: Socket) {
    let myName = await this.decoder(client.handshake.headers.authorization);
    return (this.service.newConnection(client, myName));
   }
   @SubscribeMessage('leave')
   async handleLeave(client: Socket) {
     let myName = await this.decoder(client.handshake.headers.authorization);
     return (this.service.leave(client, myName));
   }
  @SubscribeMessage('addName')
  async handleName(client: Socket, value : number) {
    this.logger.log("TOKEN : " + client.handshake.headers.authorization);
    let myName = await this.decoder(client.handshake.headers.authorization);
    console.log("addName de type " + value + " pour " + myName);
    return (this.service.addName(this.server, client, myName));
  }
  @SubscribeMessage('addMessage')
  async handleMessage(client: Socket, {msg, id}) {
    msg.username = await this.decoder(client.handshake.headers.authorization);
    return (this.service.addMessage({msg, id}));
  }
  @SubscribeMessage('changeUserName')
  async handleChangeUserName(client: Socket, blocvar : blocDto){
    blocvar.username = await this.decoder(client.handshake.headers.authorization);
		client.broadcast.emit('changeUserName', blocvar);
    client.emit('eraseName', blocvar.username);
    return (this.service.changeUserName(client, blocvar));
  }
  @SubscribeMessage('openTab')
  async handleOpenTab(client: Socket, {id1, id2, hisName}){
    let myName = await this.decoder(client.handshake.headers.authorization);
    return (this.service.openTab(client, {id1, id2, myName, hisName}));
  }
  @SubscribeMessage('newMP')
  async handlenewMP(client: Socket, hisname : string){
    let myName : User = await this.decoder2(client.handshake.headers.authorization);
    let temp = await this.accountService.getblocklist(myName.id);
    if (temp)
      temp.forEach((elem) => {
        if (elem.username == hisname)
          throw new HttpException('You Blocked him!', HttpStatus.BAD_REQUEST);
      });
    let hisUser = await this.accountService.findAccountByUsername(hisname);
    if (!hisUser)
      return;
    let temp2 = await this.accountService.getblocklist(hisUser.id);
    if (temp2)
      temp2.forEach((elem) => {
        if (elem.username == myName.username)
          throw new HttpException('He Blocked you!', HttpStatus.BAD_REQUEST);
      })
    return (this.service.newMP(client, myName.username, hisname));
  }
  @SubscribeMessage('newCR')
  async handlenewCR(client: Socket, chatRoomName : string){
    let myName : User = await this.decoder2(client.handshake.headers.authorization);
    return (this.service.newCR(client, myName, chatRoomName));
  }
	@SubscribeMessage('defier')
	async handleChallenge(client: Socket, hisName : any) {
    let myName = await this.decoder(client.handshake.headers.authorization);
    return (this.service.defiance(client , myName, hisName.hisName, hisName.version, hisName.matchid));
	}
	@SubscribeMessage('challengerefused')
	async handleChallengerefused(client: Socket)
	{
		//handle waitlist;
		client.emit('challengerefused');
	}
	@SubscribeMessage('addFriend')
  async handleFriendList(client: Socket, hisName: string)
  {
    return (this.service.addFriend(client, hisName));
  }
  @SubscribeMessage('majAdmins')
  async handleMajAdmins(client: Socket, id: number)
  {
    return (this.service.majAdmins(client, id));
  }
  @SubscribeMessage('blockChat')
  async handleBlockChat(client: Socket, hisName : string){
    let myName = await this.decoder(client.handshake.headers.authorization);
    return (this.service.closeBothChat(client, myName, hisName));
  }
}