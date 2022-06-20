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
	ParseEnumPipe
} from '@nestjs/common';
import { blocDto } from 'src/chat/bloc.dto';
import { ChatService } from 'src/chat/service/chat/chat.service';
import { ChatIdService } from 'src/chat/service/chat-id/chat-id.service';
import { JwtAuthGuard } from 'src/auth/utils/JwtGuard';
import { AccountService } from '../../../account/services/account/account.service';
import { Socket,Server } from 'socket.io'
import { NewUsernameDto } from 'src/account/dto/NewUsername.dto';
import {comparePasswords, encodePassword} from '../../../utils/bcrypt'
import { RoomLogService } from 'src/chat/service/room-log/room-log.service';
import { AccountNotFoundException } from 'src/account/exceptions/AccountNotFound.exception';
import { query } from 'express';

@Controller('chat')
export class ChatController {
	constructor (private chatService : ChatService, @Inject('ACCOUNT_SERVICE') private readonly accountService:
	AccountService){};

	@UseGuards(JwtAuthGuard)
	@Get()
	async getAll() {
		return (this.chatService.getAll());
	}
	
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/search/chatRoom/:chatRoomName')
	async getById(@Param('chatRoomName') chatRoomName: string, @Request() req: any) {
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		return (this.chatService.getId(user.username, chatRoomName, null));
	}

	@UseGuards(JwtAuthGuard)
	@Put('/register_username')
    async RegisterNewUsername(@Body() body: NewUsernameDto, @Request() req: any)
    {
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		return await this.chatService.updateMessages(body.username, user.username);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Post('/search/chatRoom/:hisName')
	async getByIds(@Body() body: {pswd : string, is_chatRoom : boolean}, @Param('hisName') hisName: string, @Request() req: any) {
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		if (body.is_chatRoom)
			return (this.chatService.getId(user.username, hisName, body.pswd));
		let temp = await this.accountService.getblocklist(user.id);
		if (temp)
			temp.forEach((elem) => {
			if (elem.username == hisName)
				throw new HttpException('You Blocked him!', HttpStatus.BAD_REQUEST);
			});
		let hisUser = await this.accountService.findAccountByUsername(hisName);
		if (!hisUser)
			return;
		let temp2 = await this.accountService.getblocklist(hisUser.id);
		if (temp2)
			temp2.forEach((elem) => {
			if (elem.username == user.username)
				throw new HttpException('He Blocked you!', HttpStatus.BAD_REQUEST);
			})
		return (this.chatService.getIds(hisName, user.username));
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Post()
    async PostBloc(@Body() bloc: blocDto, @Request() req: any) {
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		bloc.username = user.username;
		return (this.chatService.PostBloc(bloc));
    }

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/search/myRooms')
	async getMyChatRooms(@Request() req: any){
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		return (await this.chatService.getMyRooms(user.username));
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Post('/ban')// 127.0.0.1/api/chat/ban/?username=1&chatName=lol&time=10
	async postBanByName(@Query() query, @Request() req: any)
	{
		if (query.username === undefined || query.chatName === undefined || query.time === undefined)
		throw new HttpException('no username, chatName or time', HttpStatus.BAD_REQUEST);	
		query.time *= 60;
		const userBan = await this.accountService.findAccountByUsername(query.username);
		
		if (userBan)
		{
			console.log("Ca va Ban " + query.username + " dans la room " + query.chatName + " pour " + query.time + " secs!");
			let user = (await this.accountService.findAccountByLogin(req.user.login42));
			if (user == null)
				return;
			return ( await this.chatService.postBanName(user.username , userBan, query.chatName, query.time));
		}
		else
		{
			throw new AccountNotFoundException();
		}
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Post('/mute')// 127.0.0.1/api/chat/mute/?username=1&chatName=lol&time=10
	async postMuteByName(@Query() query, @Request() req: any)
	{
		if (query.username === undefined || query.chatName === undefined || query.time === undefined)
			throw new HttpException('no username, chatName or time', HttpStatus.BAD_REQUEST);	
		query.time *= 60;
		const userMute = await this.accountService.findAccountByUsername(query.username);
		if (userMute)
		{
			let user = (await this.accountService.findAccountByLogin(req.user.login42));
			if (user == null)
				return;
			return ( await this.chatService.postMuteName(user.username , userMute, query.chatName, query.time));
		}
		else
		{
			throw new AccountNotFoundException();
		}
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Delete('/unmute/:chatName/:username')
	async deleteBanById(@Param('chatName') chatName : string, @Param('username') username : string, @Request() req: any)
	{
		const userMute = await this.accountService.findAccountByUsername(username);
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
			if (user == null)
				return;
		if (userMute)
		{
			return ( await this.chatService.deleteMuteUsername(userMute, chatName, user.username));
		}
		else
		{
			throw new AccountNotFoundException();
		}
	}
}

@Controller('chatid')
export class chatidController{
	constructor (private chatidService : ChatIdService,
		@Inject('ACCOUNT_SERVICE') private readonly accountService:AccountService
		){};

	@UseGuards(JwtAuthGuard)
	@Get()
	async getAll() {
		return (this.chatidService.getAll());
	}
	
	@UseGuards(JwtAuthGuard)
	@Get('/admins/:name')
	async getAllAdmins(@Param('name') name:string) {
		return (this.chatidService.getAllAdmins(name));
	}
	
	@UseGuards(JwtAuthGuard)
	@Get('/search/:id')
	async getChatRoom(@Param('id') id:string) {
		return (this.chatidService.getChatRoom(id));
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Post('/search')
	async getPrivateChatRoom(@Body() info : {nameChatRoom : string, pswd : string, isPublic : boolean}, @Request() req: any){
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		if (info.nameChatRoom == null)
			return;
		return (this.chatidService.tryChatRoom(user, info.pswd, info.nameChatRoom, info.isPublic));
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/promote/:chatname/:hisname')
	async getNameAdmin(@Param('chatname') chatname : string,@Param('hisname') hisname : string,@Request() req: any){
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		let hisuser = (await this.accountService.findAccountByUsername(hisname));
		if (hisuser == null)
			return;
		return (this.chatidService.getNameAdmin(user, chatname, hisuser));
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Delete('/demote/:chatname/:hisname')
	async deleteNameAdmin(@Param('chatname') chatname : string,@Param('hisname') hisname : string,@Request() req: any){
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		let hisuser = (await this.accountService.findAccountByUsername(hisname));
		if (hisuser == null)
			return;
		console.log("demote de " + hisname);
		return (this.chatidService.deleteNameAdmin(user, chatname, hisuser));
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/publicRooms')
	async getMyChatRooms(@Request() req: any){
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		return (await this.chatidService.getPublic(user.username));
	}
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Post('/pswd/:chatname')
	async changePassword(@Param('chatname') chatname : string, @Body() info : {pswd : string}, @Request() req: any){
		let user = (await this.accountService.findAccountByLogin(req.user.login42));
		if (user == null)
			return;
		return (this.chatidService.changeP(user, chatname, info.pswd));
	}

	@UseGuards(JwtAuthGuard)
	@Get('/ban/:chatName')// 127.0.0.1/api/chatid/ban/lol jujujul
	async getBanList(@Param('chatName') chatName: string)
	{
		return this.chatidService.getBanList(chatName);
	}

	@UseGuards(JwtAuthGuard)
	@Get('/mute/:chatName')// 127.0.0.1/api/chatid/ban/lol jujujul
	async getMuteList(@Param('chatName') chatName: string)
	{
		return this.chatidService.getMuteList(chatName);
	}
  
  @UseGuards(JwtAuthGuard)
	@Get('/banid/:chatId')// 127.0.0.1/api/chatid/ban/lol jujujul
	async getBanListId(@Param('chatId') chatId: number)
	{
		return this.chatidService.getBanListId(chatId);
	}
}
