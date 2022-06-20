import { HttpStatus, Injectable, Param } from '@nestjs/common';
import { Logger, Module , HttpException} from '@nestjs/common';
import { blocMessages, chatRoomId, User } from 'src/typeorm';
import { NoConnectionForRepositoryError, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketServer } from '@nestjs/websockets';
import { chatIdDto } from 'src/chat/chatId.dto';
import {comparePasswords, encodePassword} from '../../../utils/bcrypt'
import e from 'express';
import { Cron, CronExpression } from '@nestjs/schedule';
import { chatidController } from 'src/chat/controller/chat/chat.controller';

@Injectable()
export class ChatIdService {
	constructor(
		@InjectRepository(chatRoomId)
		private chatRoomIdRepository: Repository<chatRoomId>,
	  ) {}
	async getAll(): Promise<chatRoomId[]>{
		return this.chatRoomIdRepository.find();
	}
	async getAllAdmins(nameChat : string): Promise<string[]>{
		let temp = await this.chatRoomIdRepository.findOne({
			where:{
				chatRoomName : nameChat,
			},
			relations:{
				Admins : true,
			}
		});
		if (!temp || !temp.Admins)
			return;
		let temp2 = new Set<string>();
		temp.Admins.forEach((elem) => {
			temp2.add(elem.username);
		})
		return ([... temp2]);
	}
	async getChatRoom(id : string): Promise<boolean>{
		let biz = null;
		let temp = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : id
			},

		})
		return (temp !== null && temp.password == null);
	}
	async getPublic(username : string){
		let temp = await this.chatRoomIdRepository.find({
			where :{
				isPublic : true
			},
		})
		return (temp);
	}
	async PostBloc(bloc : chatIdDto){
		const newBloc = await this.chatRoomIdRepository.create(bloc);
		await this.chatRoomIdRepository.save(newBloc);
	}
	async tryChatRoom(user : any, pswd: string, nameChatRoom : string, ispublic : boolean){
		let returnvalue = new Array();
		let temp = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : nameChatRoom,
				isChatRoom : true
			}
		});
		if (temp){
			if (comparePasswords(pswd, temp.password) == true)
				returnvalue.push(temp);
			if (returnvalue.length)
				return (0);
			return (-1);
		}
		else{
			let cri = await this.chatRoomIdRepository.create({chatRoomName : nameChatRoom, isChatRoom: true, password : pswd === null ? null : encodePassword(pswd), Admins : [user], isPublic : ispublic});
			await this.chatRoomIdRepository.save(cri);
		}
		return (1);
	}
	async getNameAdmin(user : User, chatname : string, hisuser : User): Promise<boolean>{
		let booli = false;
		let temp = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : chatname,
				isChatRoom : true,
			},
			relations:{
				Admins : true,
			}
		});
		if (temp == null)
			return (false);
		temp.Admins.forEach((elem) => {
			if (elem.username == hisuser.username )
				return (false);
			if (elem.username == user.username)
				booli = true;
		})
		if (!booli)
			return (false);
		temp.Admins.push(hisuser);
		await this.chatRoomIdRepository.save(temp);
		return (true);
	}
	async deleteNameAdmin(user : User, chatname : string, hisuser : User): Promise<boolean>{
		let booli = false;
		let temp = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : chatname,
				isChatRoom : true,
			},
			relations:{
				Admins : true,
			}
		});
		if (temp == null)
			return (false);
		temp.Admins.forEach((elem) => {
			if (elem.username == user.username)
				booli = true;
		})
		if (!booli)
			return (false);
		temp.Admins.forEach((element, index) => {
			if(element.username == hisuser.username)
			{
				console.log(element.username + " a bien ete delete!");
				temp.Admins.splice(index, 1);
			}
		})
		await this.chatRoomIdRepository.save(temp);
		return (true);
	}
	async changeP(user : User, chatname : string, pswd : string): Promise<boolean>{
		let booli = false;
		let temp = await this.chatRoomIdRepository.findOne({
			where :{
				chatRoomName : chatname,
				isChatRoom : true,
			},
			relations:{
				Admins : true,
			}
		});
		if (temp == null)
			return (false);
		temp.Admins.forEach((elem) => {
			if (elem.username == user.username)
				booli = true;
		})
		if (!booli)
			return (false);
		if (pswd != null)
			temp.password = encodePassword(pswd);
		else
			temp.password = null;
		await this.chatRoomIdRepository.save(temp);
		return (true);
	}

	async getBanList(chatName: string)
	{
		const banlist = await this.chatRoomIdRepository.findOne({where: {chatRoomName: chatName, isChatRoom: true}, relations:{Ban:true,}});
		if (banlist)
			return {banlist: (await banlist).Ban, bantime: banlist.BanTime};
		else
			throw new HttpException('Chat room not found', HttpStatus.BAD_REQUEST);	
	}
	async getMuteList(chatName: string)
	{
		const banlist = await this.chatRoomIdRepository.findOne({where: {chatRoomName: chatName, isChatRoom: true}, relations:{Mute:true,}});
		if (banlist)
			return (await banlist).Mute;
		else
			throw new HttpException('Chat room not found', HttpStatus.BAD_REQUEST);	

	}
	async getBanListId(chatId: number)
	{
		const banlist = await this.chatRoomIdRepository.findOne({where: {id: chatId, isChatRoom: true}, relations:{Ban:true,}});
		if (banlist)
			return {banlist: (await banlist).Ban, bantime: banlist.BanTime};
		else
			throw new HttpException('Chat room not found', HttpStatus.BAD_REQUEST);	

	}

	async deleteBanId(userBan: User, chatName: string)
	{
		const chatroom = await this.chatRoomIdRepository.findOne({
				where:{
					chatRoomName : chatName,
					isChatRoom: true
				},
				relations:{
					Ban : true,
				}
			});
		if (chatroom)
		{
			if (chatroom.Ban === undefined || chatroom.Ban === null)
			{
				throw new HttpException(userBan.username + ' not in ban list', HttpStatus.BAD_REQUEST);	
			}
			for(let i = 0; i < chatroom.Ban.length; ++i)
			{
				if (userBan.id == chatroom.Ban[i].id)
				{
					console.log(userBan + " deban de " + chatroom.chatRoomName);
					chatroom.Ban.splice(i, 1);
					chatroom.BanTime.splice(i, 1);
					this.chatRoomIdRepository.save(chatroom);
					return (chatroom.Ban);
				}
			}
			throw new HttpException(userBan.username + ' not in ban list', HttpStatus.BAD_REQUEST);	
		}
		else
		{
			throw new HttpException('Chat room not found', HttpStatus.BAD_REQUEST);	
		}

	};

	
}

@Injectable()
export class CronService {
	constructor(
		@InjectRepository(chatRoomId)
		private chatRoomIdRepository: Repository<chatRoomId>,
	  ) {}
	@Cron('*/30 * * * * *')
  	async handleCron() 
	{
		const chatlist = await this.chatRoomIdRepository.find({where: {isChatRoom: true}, relations:{ Ban: true, Mute : true}});

		for (let i = 0; chatlist && i < chatlist.length; ++i)
		{
			for (let j = 0; !(chatlist[i].BanTime === undefined) && !(chatlist[i].BanTime === null) && j < chatlist[i].BanTime.length; ++j)
			{
				if (chatlist[i].BanTime[j] < 30)
				{
					console.log(chatlist[i].Ban[j].username + " deban de " + chatlist[i].chatRoomName);
					chatlist[i].Ban.splice(j, 1);
					chatlist[i].BanTime.splice(j, 1);
				}
				else
				{	
					chatlist[i].BanTime[j] -= 30;
				}
			}
			for (let j = 0; !(chatlist[i].MuteTime === undefined) && !(chatlist[i].MuteTime === null) && j < chatlist[i].MuteTime.length; ++j)
			{
				if (chatlist[i].MuteTime[j] < 30)
				{
					console.log(chatlist[i].Mute[j].username + " demute de " + chatlist[i].chatRoomName);
					chatlist[i].Mute.splice(j, 1);
					chatlist[i].MuteTime.splice(j, 1);
				}
				else
				{	
					chatlist[i].MuteTime[j] -= 30;
				}
			}
		}
		this.chatRoomIdRepository.save(chatlist);

		return (chatlist);

	}
}
