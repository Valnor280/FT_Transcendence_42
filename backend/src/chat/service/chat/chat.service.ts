import { Inject, Injectable,HttpStatus} from '@nestjs/common';
import { blocDto } from '../../bloc.dto';
import { dialogDto } from '../../dialog.dto';
import { Socket,Server } from 'socket.io'
import { Logger, Module , HttpException} from '@nestjs/common';
import { blocMessages } from '../../../typeorm/blocMessages.entity';
import { chatRoomId } from '../../../typeorm/chatRoomId.entity';
import { NoConnectionForRepositoryError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketServer } from '@nestjs/websockets';
import { ChatIdService } from '../chat-id/chat-id.service';
import { AccountService } from 'src/account/services/account/account.service';
import e from 'express';
import { use } from 'passport';
import { ChatController } from 'src/chat/controller/chat/chat.controller';
import { Injector } from '@nestjs/core/injector/injector';
import { PongGateway  } from 'src/pong.gateway';
import {comparePasswords, encodePassword} from '../../../utils/bcrypt'
import { roomLog } from 'src/typeorm';
import { User } from 'src/typeorm';

@Injectable()
export class ChatService {
	private logger : Logger = new Logger('ChatService');
	private onlineplayers = new Map<Socket,dialogDto>();
	private list_users = new Map<string, Set<Socket>>();
	private list_chatRoom = new Map<string, Set<string> >();
	private tempdial : dialogDto;
	private counterGuest = 0;
	
	constructor(
		@InjectRepository(blocMessages) private blocMessageRepository: Repository<blocMessages>,
		@InjectRepository(chatRoomId) private chatRoomIdRepository: Repository<chatRoomId>
		) {
		  this.list_chatRoom.set([1].toString(), new Set());
	  }
	async getAll(): Promise<blocMessages[]>{
		return this.blocMessageRepository.find();
	}
	async getId(username : string, chatRoomName : string, pswd : string){
		let chatRoom = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : chatRoomName
			}
		});
		if (chatRoom == null && chatRoomName == "General"){
			let general = await this.chatRoomIdRepository.create({chatRoomName : chatRoomName, isChatRoom: true, password : null, isPublic : true});
			await this.chatRoomIdRepository.save(general);
			return (null);
		}
		else if (chatRoom == null)
			throw new HttpException('Chat Not Found', HttpStatus.BAD_REQUEST);
		else if(!comparePasswords(pswd, chatRoom.password))
			throw new HttpException('Chat Password Wrong', HttpStatus.BAD_REQUEST);
		const banlist = await this.chatRoomIdRepository.findOne({where: {id: chatRoom.id, isChatRoom: true}, relations:{Ban:true,}});
		if (banlist){
			banlist.Ban.forEach((elem) => {
				if (username == elem.username)
					throw new HttpException('user Banned From Chat', HttpStatus.BAD_REQUEST);
			})
		}
		let temp = await this.blocMessageRepository.find({
			where :{
				id : chatRoom.id
			}
		});
		return (temp);
	}
	async getIds(hisName: string, username : string): Promise<blocMessages[]>{
		let id1 = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: hisName,
				isChatRoom : false
			},
		});
		let id2 = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: username,
				isChatRoom : false
			},
		});
		return await this.blocMessageRepository.find({
			where :[{
				id : id1.id,
				username : username
			},
			{
				id : id2.id,
				username : hisName
			}]
		})
	}
	async updateMessages(oldusername : string, new_username : string){
		const messages = await this.blocMessageRepository.find({
			where : {
				username : oldusername
			}
		});
		messages.forEach(async (elem) =>{
			elem.username = new_username;
			await this.blocMessageRepository.save(elem);
		});
		const room = await this.chatRoomIdRepository.findOne({
			where : {
				chatRoomName : oldusername,
				isChatRoom : false
			}
		});
		if (room){
			room.chatRoomName = new_username;
			await this.chatRoomIdRepository.save(room);
		}
		return;
	}
	async PostBloc(bloc : blocDto){
		const newBloc = await this.blocMessageRepository.create({id : bloc.id, username : bloc.username, date : bloc.date, messages : bloc.messages.toString()});
		await this.blocMessageRepository.save(newBloc);
	}

	newConnection(socket : Socket, myName : string) {
		this.tempdial = new dialogDto("None", myName, "None", socket);
		this.tempdial.connected();
		this.onlineplayers.set(socket,  this.tempdial);
		if (myName != undefined && myName != null){
			if (this.list_users.has(myName)){
				this.onlineplayers.get(socket).username = null;
				socket.emit('exist');
				return;
			}
			// this.list_users.set(myName, new Set<Socket>([socket]));
			// socket.emit("connection",  [... this.list_users.keys()]);
			// socket.broadcast.emit("addUser" + 1, myName);
		}
		this.logger.log("Number of Users! : " + this.onlineplayers.size);
		this.logger.log("Number of Connected Users! : " + this.list_users.size);
	}
	leave(socket : Socket, myName : string) {
		// this.logger.log("Ca veut leave !");
		// this.onlineplayers.get(socket).disconnected();
		socket.broadcast.emit('disconnection', myName);
		this.list_users.delete(myName);
		this.list_chatRoom.forEach((elem) => {
			elem.delete(myName);
		});
	}
	disconnected(socket : Socket, myName : string) {
		this.onlineplayers.get(socket).disconnected();
		socket.broadcast.emit('disconnection', myName);
		if (this.onlineplayers.get(socket).username == myName)
			this.list_users.delete(myName);
		this.onlineplayers.delete(socket);
		this.list_chatRoom.forEach((elem) => {
			elem.delete(myName);
		})
	}
	addName(server : Server, socket: Socket, name : string){
		this.logger.log("Je rajoute " + name + " et je delete " + this.onlineplayers.get(socket).username + " et ca donne " + this.list_users.has(name) + " " + this.list_users.size);
		if (this.onlineplayers.has(socket) && this.onlineplayers.get(socket).username != name){
			this.onlineplayers.get(socket).disconnected();
			this.list_users.delete(this.onlineplayers.get(socket).username)
			server.emit('disconnection', this.onlineplayers.get(socket).username);
		}
		if (name == null)
			return;
		this.tempdial = new dialogDto("None", name, "None", socket);
		this.tempdial.connected();
		this.onlineplayers.set(socket,  this.tempdial);
		this.logger.log("Je rajoute " + name + " et je delete " + this.onlineplayers.get(socket).username + " et ca donne " + this.list_users.has(name) + " " + this.list_users.size);
		
		if (this.list_users.has(name)){
			this.onlineplayers.get(socket).username = null;
			socket.emit('exist');
			return;
		}
		this.list_users.set(name, new Set<Socket>([socket]));
		server.emit("addUser" + 1, name);
		socket.emit("connection",  [... this.list_users.keys()]);
		this.list_chatRoom.get([1].toString(),).add(name);
	}
	addMessage({msg, id}) {
		this.logger.log("Message sur la room " + id + " depuis " + msg.username);
		if (this.list_chatRoom.has([id].toString()) === false){
			console.log(this.list_chatRoom.has(id) + " est pas normal")
			return;
		}
		this.list_chatRoom.get([id].toString()).forEach((elem) =>{
			if (this.list_users.has(elem) !== false)
				this.list_users.get(elem).forEach((elem2) => {
					elem2.emit('addMessage' + id, msg);
				});
		});
	}
	changeUserName(socket : Socket, blocvar : blocDto){
	}
	openTab(socket : Socket, {id1, id2, myName, hisName}){
		if (this.list_users.get(hisName) !== undefined)
			this.list_users.get(hisName).forEach((elem) => {
				elem.emit('openTab', {id1, id2, hisName : myName});
			});
	}
	async newMP(socket : Socket, myName : string, hisname : string){
		this.logger.log("Je mapprete a check avec " + hisname);
		let list_id1 = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: hisname,
				isChatRoom : false
			},
		});
		let list_id2 = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: myName,
				isChatRoom : false
			},
		});
		if (list_id1 == null){
			list_id1 = await this.chatRoomIdRepository.create({chatRoomName : hisname, isChatRoom: false});
			await this.chatRoomIdRepository.save(list_id1);
		}
		if (list_id2 == null){
			list_id2 = await this.chatRoomIdRepository.create({chatRoomName : myName, isChatRoom: false});
			await this.chatRoomIdRepository.save(list_id2);
		}
		socket.emit('newMP', {id1 : list_id1.id, id2 : list_id2.id, name : hisname});
		this.list_chatRoom.set([list_id1.id].toString(), new Set([myName, hisname]));
		this.list_chatRoom.set([list_id2.id].toString(), new Set([myName, hisname]));
	}
	async newCR(socket : Socket, myName : User, chatRoomName : string){
		this.logger.log("Je mapprete a creer la room " + chatRoomName);
		let list_id = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: chatRoomName,
				isChatRoom: true,
			},
		});
		if (list_id == null){
			list_id = await this.chatRoomIdRepository.create({chatRoomName : chatRoomName, isChatRoom : true});
			await this.chatRoomIdRepository.save(list_id);
		}
		if (this.list_chatRoom.has([list_id.id].toString()) == false)
			this.list_chatRoom.set([list_id.id].toString(), new Set([myName.username]));
		else
			this.list_chatRoom.get([list_id.id].toString()).add(myName.username);
		socket.emit('newMP', {id1 : list_id.id, id2 : list_id.id, name : chatRoomName});
		this.list_users.forEach((hissocket, name) => {
			if (this.list_chatRoom.get([list_id.id].toString()).has(name))
				hissocket.forEach((elem) => {
					elem.emit("addUser" + list_id.id, myName.username);
				});
		})
	}

	getelem(hisName: string): any {
		this.list_users.get(hisName).forEach((elem) => {
			return(elem);
		})
		return null;
	}

	defiance (client : Socket, myName : string, hisName : string, version: number, matchid: number){
		if (!this.list_users.has(hisName)){
			this.logger.log(hisName + " n'est pas connecte !");
			return ;
		}
		console.log('fcnt defiance', myName);
		this.list_users.get(hisName).forEach((elem) => {
			console.log('test');
			elem.emit('defiance', {myName, hisName, version, matchid});
		})

	}

	async getMyRooms(username : string){
		let temp = await this.blocMessageRepository.find({
			where :{
				username : username
			}
		});
		let tempTable = new Map();
		for(var i = 0; i < temp.length; i++) {
			var elem = temp[i];
			let tempvar = await this.chatRoomIdRepository.findOne({
				where :{
					id : elem.id,
					isChatRoom : true
				}
			});
			if (tempvar){
				tempvar.password = tempvar.password ? "mdp" : null; 
				tempTable.set(tempvar.chatRoomName, tempvar);
			}
		};
		return ([... tempTable.values()]);
	}

	async addFriend(client: Socket, hisName: string)
	{
		client.emit('addFriend');
	}
	async majAdmins(client : Socket, id : number)
	{
		this.list_chatRoom.get([id].toString()).forEach((elem) => {
			this.list_users.get(elem).forEach((elem2) => {
				elem2.emit("majAdmins" + id);
			})
		})
	}
	async closeBothChat(client : Socket, myName : string, hisName : string){
		let list_id = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: myName,
				isChatRoom : false
			},
		});
		if (list_id && this.list_chatRoom.has([list_id.id].toString())){
			this.list_chatRoom.get([list_id.id].toString()).forEach((elem) => {
				if (elem == hisName)
				this.list_users.get(elem).forEach((elem2) => {
					elem2.emit("deleteIt", myName);
				})
			})
			this.list_chatRoom.get([list_id.id].toString()).delete(hisName);
		}
		client.emit("deleteIt", hisName);
	}
	async postBanName(user : string, userBan: User, chatName: string, time: number)
	{
		let booli = false;
		let temp = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : chatName,
				isChatRoom : true,
			},
			relations:{
				Admins : true,
			}
		});
		if (temp == null)
			return (false);
		temp.Admins.forEach((elem) => {
			if (elem.username == user)
				booli = true;
		})
		if (!booli)
			return (false);

		const chatroom = await this.chatRoomIdRepository.findOne({
				where:{
					chatRoomName : chatName,
					isChatRoom: true
				},
				relations:{
					Ban : true,
				}
			});
		if (!chatroom)
			throw new HttpException('Chat room not found', HttpStatus.BAD_REQUEST);
		if (chatroom.Ban === undefined || chatroom.Ban === null)
			chatroom.Ban = chatroom.Ban || [];
		if (chatroom.BanTime === undefined || chatroom.BanTime === null)
			chatroom.BanTime = chatroom.BanTime || [];
		chatroom.Ban.push(userBan);
		chatroom.BanTime.push(time);
		await this.chatRoomIdRepository.save(chatroom);
		let list_id = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: chatName,
				isChatRoom: true,
			},
		});
		this.list_chatRoom.get([list_id.id].toString()).forEach((elem) => {
			this.list_users.get(elem).forEach((elem2) => {
				elem2.emit('kickChat', {chatRoomName : chatName, hisName : userBan.username, time : time});
				elem2.emit("Banned" + chatName , userBan.username);
			})
		})
		this.list_chatRoom.get([list_id.id].toString()).delete(userBan.username);
		return (chatroom.Ban);
	};
	async postMuteName(user : string, userMute: User, chatName: string, time : number)
	{
		let booli = false;
		let temp = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : chatName,
				isChatRoom : true,
			},
			relations:{
				Admins : true,
			}
		});
		if (temp == null)
			return (false);
		temp.Admins.forEach((elem) => {
			if (elem.username == user)
				booli = true;
		})
		if (!booli)
			return (false);

		const chatroom = await this.chatRoomIdRepository.findOne({
				where:{
					chatRoomName : chatName,
					isChatRoom: true
				},
				relations:{
					Mute : true,
				}
			});
		if (!chatroom)
			throw new HttpException('Chat room not found', HttpStatus.BAD_REQUEST);
		if (chatroom.Mute === undefined || chatroom.Mute === null)
			chatroom.Mute = chatroom.Mute || [];
		if (chatroom.MuteTime === undefined || chatroom.MuteTime === null)
			chatroom.MuteTime = chatroom.MuteTime || [];
		for (var i = 0; i < chatroom.Mute.length; i++){
			if (chatroom.Mute[i].username == userMute.username)
				return (this.deleteMuteUsername(userMute, chatName, user));
		}
		chatroom.Mute.push(userMute);
		chatroom.MuteTime.push(time);
		await this.chatRoomIdRepository.save(chatroom);
		this.logger.log("Mute de " + userMute.username + " pour " + time + " !!!");
		let list_id = await this.chatRoomIdRepository.findOne({
			where: {
				chatRoomName: chatName,
				isChatRoom: true,
			},
		});
		this.list_chatRoom.get([list_id.id].toString()).forEach((elem) => {
			this.list_users.get(elem).forEach((elem2) => {
				elem2.emit("Muted" + chatName , userMute.username);
			})
		})
		return (chatroom.Ban);
	};
	async deleteMuteUsername(userMute: User, chatName: string, myName : string)
	{
		this.logger.log("UnMute de " + userMute.username + " dans " + chatName + " !!!!!!!");
		let booli = false;
		const chatroom = await this.chatRoomIdRepository.findOne({
				where:{
					chatRoomName : chatName,
					isChatRoom: true
				},
				relations:{
					Mute : true,
					Admins : true
				}
			});
		if (chatroom)
		{
			chatroom.Admins.forEach((elem) => {
				if (elem.username == myName)
					booli = true;
			})
			if (!booli)
				throw new HttpException(myName + ' not Admin', HttpStatus.BAD_REQUEST);	
			if (chatroom.Mute === undefined || chatroom.Mute === null)
			{
				throw new HttpException(userMute.username + ' not in Mute list', HttpStatus.BAD_REQUEST);	
			}
			for(let i = 0; i < chatroom.Mute.length; ++i)
			{
				if (userMute.id == chatroom.Mute[i].id)
				{
					chatroom.Mute.splice(i, 1);
					chatroom.MuteTime.splice(i, 1);
					this.chatRoomIdRepository.save(chatroom);
					this.list_chatRoom.get([chatroom.id].toString()).forEach((elem) => {
						this.list_users.get(elem).forEach((elem2) => {
							this.logger.log("Jenvoie a " + elem + " que " + userMute.username + " a ete demute!" );
							elem2.emit("unMuted" + chatName , userMute.username);
						})
					})
					return (chatroom.Mute);
				}
			}
			throw new HttpException(userMute.username + ' not in Mute list', HttpStatus.BAD_REQUEST);	
		}
		else
		{
			throw new HttpException('Chat room not found', HttpStatus.BAD_REQUEST);	
		}

	};
}