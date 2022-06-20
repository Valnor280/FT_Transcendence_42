import { HttpException, HttpStatus, Injectable, Param, ParseIntPipe, forwardRef, Inject  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreateAccountDto } from 'src/account/dto/CreateAccount.dto';
import { MatchDto } from 'src/account/dto/Match.dto';
import { Achievement, User as UserEntity} from 'src/typeorm';
import { MatchHistory as MatchEntity} from 'src/typeorm';
import { DatabaseFile as DatabaseFileEntity } from 'src/typeorm';
import { Achievement as AchievementEntity} from 'src/typeorm';
import { blocMessages } from 'src/typeorm';
import { chatRoomId } from 'src/typeorm';
import { Account, SerializedAccount } from '../../types/account';
import { encodePassword } from 'src/utils/bcrypt';
import { AccountAlreadyExistsException, AccountNotFoundException } from '../../exceptions/AccountNotFound.exception';
import { isNumber } from 'class-validator';
import { tsImportEqualsDeclaration } from '@babel/types';
import { ChatService } from 'src/chat/service/chat/chat.service';

@Injectable()
export class AccountService {

	constructor(
		@InjectRepository(UserEntity) private readonly accountRepository: Repository<UserEntity>,
		@InjectRepository(MatchEntity) private readonly MatchRepository: Repository<MatchEntity>,
		@InjectRepository(DatabaseFileEntity) private readonly DatabaseFileRepository: Repository<DatabaseFileEntity>,
		@InjectRepository(AchievementEntity) private readonly AchievementRepository: Repository<AchievementEntity>,
		// @InjectRepository(blocMessages) private readonly blocmessages
		// : Repository<blocMessages>,
		){}
		// @InjectRepository(forwardRef(() => chatRoomId)) private chatRoomIdRepository: Repository<chatRoomId>,

	getAccounts() {
		return this.accountRepository.find();
	}

	async UpdateUsername(login: string, new_username: string)
	{
		const account = await this.accountRepository.findOne({
			where: {
				login42: login,
			}
		});
		const tempUsername = account.username;
		account.username = new_username;
		await this.accountRepository.save(account);
		// this.chatService.updateMessages(tempUsername, account.username);
	}


	async createAccount(createAccountDto: CreateAccountDto) {
		const verif = this.accountRepository.findOne({
			where: {
				username: createAccountDto.username,
			}
		})

		const newAccount = await this.accountRepository.create(createAccountDto);
		const newAchievement = await this.AchievementRepository.create({username: newAccount.username});
		await this.AchievementRepository.save(newAchievement);
		newAccount.achievementId = newAchievement.id;
		
		return await this.accountRepository.save(newAccount);
	}

	findAccountByUsername(username: string): Promise<UserEntity> {
		return this.accountRepository.findOne({
			where: {
				username: username,
			},
		});
	}

	findAccountByLogin(login42: string): Promise<UserEntity> {
		return this.accountRepository.findOne({
			where: {
				login42: login42,
			},
		});
	}

	findAccountByEmail(email: string): Promise<UserEntity> {
		return this.accountRepository.findOne({
			where: {
				email: email,
			},
		});
	}

	findAccountById(id: number) {
		return this.accountRepository.findOne({
			where: {
				id: id,
			},
		});
	}
//************************************************************** */
	
	async DeleteOne(id: number) {
		await this.accountRepository.delete(id);
	}



//************************ PUT FUNCTION **************************** */
	async PutByName(username: string, Username: string, Email: string, Password: string, Rank: number, Win: number, Loss: number)
  	{
    
    	const bgdu37 = await this.accountRepository.findOne({
    		where: {
    	      username: username,
    		},
    	})

    	if (bgdu37)
    	{	
			if (Username)
				bgdu37.username = Username;
			if (Email)
				bgdu37.email = Email;
			if (Rank)
				bgdu37.rank = Rank;
			if (Win)
				bgdu37.win = Win;
			if (Loss)
				bgdu37.loss = Loss;
			
    		await this.accountRepository.save(bgdu37);
    		return bgdu37;
    	}
		else
			throw new AccountNotFoundException();
	}

	async change_2fa_switch(login: string)
	{
		const account = await this.accountRepository.findOne({
			where: {
				login42: login,
			}
		});
		var ret: number;
		if (account.doubleAuth)
		{
			account.doubleAuth = false;
			ret = 0;
		}
		else
		{
			account.doubleAuth = true;
			ret = 1;
		}
		this.accountRepository.save(account);
		return (ret);
	}

	async PutMatchByName(left_user: string, left_score: number, right_user: string, right_score: number)
	{
		console.log('pouet');
		const left_account = await this.accountRepository.findOne({
			where: {
				username: left_user,
			}
		});
		const right_account = await this.accountRepository.findOne({
			where: {
				username: right_user,
			}
		});
		console.log(left_user, right_user);
		console.log(left_account, right_account);
		if (!right_account || !left_account)
			console.log('on a pas les accounts bien charges');
		
		//calcul d'elo ici
		const R_left: number = Math.pow(10, left_account.rank / 400);
		const R_right: number = Math.pow(10, right_account.rank / 400);

		const E_left: number = R_left / (R_left + R_right);
		const E_right: number = R_right / (R_left + R_right);

		let S_left: number;
		let S_right: number;

		if (left_score === 11)
		{
			++left_account.win;
			++right_account.loss;
			S_left = 1;
			S_right = 0;
		}
		else
		{
			++left_account.loss;
			++right_account.win;
			S_left = 0;
			S_right = 1;
		}
		
		++right_account.match;
		++left_account.match;

		let new_left_rank = Math.round(left_account.rank + 32 * (S_left - E_left));
		let new_right_rank = Math.round(right_account.rank + 32 * (S_right - E_right));

		if (new_left_rank < 0)
			new_left_rank = 0;
		if (new_right_rank < 0)
			new_right_rank = 0;

		left_account.rank = new_left_rank;
		right_account.rank = new_right_rank;

		await this.accountRepository.save(left_account);
		await this.accountRepository.save(right_account);

		if (left_score === 11)
		{
			let Match: MatchDto = {
				winner: left_account.id,
				looser: right_account.id,
				winner_name: left_account.username,
				looser_name: right_account.username,
				winnerscore: left_score,
				looserscore: right_score,
				winner_rank: new_left_rank,
				looser_rank: new_right_rank,
			};
			const newMatch = this.MatchRepository.create(Match);
			await this.MatchRepository.save(newMatch);
			return newMatch;
		}
		else
		{
			let Match: MatchDto = {
				winner: right_account.id,
				looser: left_account.id,
				winner_name: right_account.username,
				looser_name: left_account.username,
				winnerscore: right_score,
				looserscore: left_score,
				winner_rank: new_right_rank,
				looser_rank: new_left_rank,
			};
			const newMatch = this.MatchRepository.create(Match);
			await this.MatchRepository.save(newMatch);
			return newMatch;
		}
	}

	async getMatch()
	{
		return this.MatchRepository.find();
	}

	async getMatchById(id: number)
	{
		return await this.MatchRepository.find({
				where: [
					{ winner: id },
					{ looser: id },
				],
			});
	}

	async PutAchievement(@Param('userId', ParseIntPipe) userId: number, achievement: string)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user === undefined)
			throw new AccountNotFoundException();
		else
		{
			const Achievementlist = await this.AchievementRepository.findOne({where: {id: user.achievementId}});
			
			Achievementlist[achievement] = true;
			
			await this.AchievementRepository.save(Achievementlist);
			return Achievementlist;
		}
	}

	async getAchievement(@Param('userId', ParseIntPipe) userId: number)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user === undefined)
			throw new AccountNotFoundException();
		else
			return this.AchievementRepository.findOne({where: {id: user.achievementId}});
	}

	async getFriendslist(@Param('userId', ParseIntPipe) userId: number)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user)
		{
			
			if (user.friendslist === undefined || user.friendslist === null)
			{
				user.friendslist = user.friendslist || [];
			}
			let friendslist: CreateAccountDto[];
			
			friendslist = friendslist || [];
			
			for (let i = 0; i < user.friendslist.length; ++i)
				friendslist.push(await this.accountRepository.findOne({where: {id: user.friendslist[i]}}));
			console.log("friends -> "+ friendslist);
			return (friendslist);
		}
		else
			throw new AccountNotFoundException();
			
	}


	async putFriendslist(@Param('userId', ParseIntPipe)userId: number, friendname: string)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user)
		{
			const friend = await this.accountRepository.findOne({where: {username: friendname}});



			if (friend)
			{
				for (let i = 0; i < user.friendslist.length; ++i)
					if (user.friendslist[i] == friend.id)
						throw new HttpException(friend.username+' est déjà ton ami', HttpStatus.BAD_REQUEST);
				console.log(friend.id);
				user.friendslist.push(friend.id);
				await this.accountRepository.save(user);
				return (friend);
			}
			else
				throw new AccountNotFoundException();				
		}
		else
			throw new AccountNotFoundException();
	}

	async putRemoveFriendslist(@Param('userId', ParseIntPipe) userId: number, friendname: string)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user)
		{
			const friend = await this.accountRepository.findOne({where: {username: friendname}});

			if (friend)
			{
				for (let i = 0; i < user.friendslist.length; ++i)
					if (user.friendslist[i] == friend.id)
					{
						user.friendslist.splice(i, 1);
						await this.accountRepository.save(user);
						return (user.friendslist);						
					}
					throw new HttpException(friend.username + " n'est pas ton ami", HttpStatus.BAD_REQUEST);
			}
			else
				throw new AccountNotFoundException();				
		}
		else
			throw new AccountNotFoundException();

	}


	async getblocklist(@Param('userId', ParseIntPipe) userId: number)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user)
		{
			
			if (user.blocklist === undefined || user.blocklist === null)
			{
				user.blocklist = user.blocklist || [];
			}
			let blocklist: CreateAccountDto[];
			
			blocklist = blocklist || [];
			
			for (let i = 0; i < user.blocklist.length; ++i)
				blocklist.push(await this.accountRepository.findOne({where: {id: user.blocklist[i]}}));
			return (blocklist);
		}
		else
			throw new AccountNotFoundException();
			
	}


	async putblocklist(@Param('userId', ParseIntPipe)userId: number, blocker: string)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user)
		{
			const user2 = await this.accountRepository.findOne({where: {username: blocker}});



			if (user2)
			{
				if (!user.blocklist)
					user.blocklist = [];
				for (let i = 0;i < user.blocklist.length; ++i)
					if (user.blocklist[i] === user2.id)
						throw new HttpException(user2.username+' deja bloque', HttpStatus.BAD_REQUEST);
				console.log(user2.id);
				user.blocklist.push(user2.id);
				await this.accountRepository.save(user);
				return (user);
			}
			else
				throw new AccountNotFoundException();				
		}
		else
			throw new AccountNotFoundException();
	}

	async putRemoveblocklist(@Param('userId', ParseIntPipe) userId: number, blocker: string)
	{
		const user = await this.accountRepository.findOne({where: {id: userId}});

		if (user)
		{
			const user2 = await this.accountRepository.findOne({where: {username: blocker}});

			if (user2)
			{
				for (let i = 0; i < user.blocklist.length; ++i)
				{
					console.log(typeof(user.blocklist[i]), typeof(user2.id));
					if (user.blocklist[i] == user2.id)
					{
						console.log('shtroumph')
						user.blocklist.splice(i, 1);
						await this.accountRepository.save(user);
						return (user.blocklist);
					}
					console.log(user.blocklist[i], user2.id);
				}
				throw new HttpException(user2.username + " n'est pas bloque", HttpStatus.BAD_REQUEST);
			}
			else
				throw new AccountNotFoundException();				
		}
		else
			throw new AccountNotFoundException();

	}

	async uploadSingle(user_id: number, imageBuffer: Buffer, filename: string)
	{
		console.log(imageBuffer);
		console.log(filename);
		let fileparse = filename;
		const newFile = await this.DatabaseFileRepository.create({
			filename,
			data: imageBuffer
		})
		await this.DatabaseFileRepository.save(newFile);
		
		const user = await this.accountRepository.findOne({where: {id: user_id}});
		user.avatarId = newFile.id;
		await this.accountRepository.save(user);
		// await this.accountRepository.update(user_id, {
		// 	avatarId: newFile.id
		//   });
		return 'OK';
		  
	}


	async getFileById(id: number)
	{
		return await this.DatabaseFileRepository.findOne({where: {id: id}});
	}
	// ParseUsernameFromCookieSession(session: SessionEntity) {
	// 	var		temp: string = session.json.substring( session.json.indexOf("\"username\":") + 12, session.json.length);
	// 	var		username: string = temp.substring(0, temp.indexOf("\""));
	// 	return username;
	// }

	// ParseIdFromCookieSession(session: SessionEntity) {
	// 	var		temp: string = session.json.substring( session.json.indexOf("\"id\":") + 6, session.json.length);
	// 	var		username: string = temp.substring(0, temp.indexOf("\""));
	// 	return username;
	// }
}
