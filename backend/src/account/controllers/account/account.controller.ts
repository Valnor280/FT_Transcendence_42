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
	Res
} from '@nestjs/common';
import { SerializedAccount, PublicSerializedAccount } from 'src/account/types/account';
import { AccountService } from '../../services/account/account.service';
import { AccountNotFoundException } from '../../exceptions/AccountNotFound.exception';
import { CreateAccountDto } from 'src/account/dto/CreateAccount.dto';
import { JwtAuthGuard } from 'src/auth/utils/JwtGuard';
import { IsNumber } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express'
import { Readable } from 'stream';
import { NewUsernameDto } from 'src/account/dto/NewUsername.dto';
import { Achievement } from 'src/typeorm';
import { ChatService } from 'src/chat/service/chat/chat.service';

@Controller('account')
export class AccountController {

	constructor(
		@Inject('ACCOUNT_SERVICE') private readonly accountService:
		AccountService,
	) {}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('')
	async getAccounts() {
		return this.accountService.getAccounts();
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/self')
	async getMyAccount(@Request() req: any) {
		console.log(req.user.login42);
		const	account = await this.accountService.findAccountById(req.user.userId);
		if (account)
			return await new SerializedAccount(account);
		else
			throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/search/username/:username')
	async getByUsername(@Param('username') username:string) {
		const account = await this.accountService.findAccountByUsername(username);
		if (account)
			return new PublicSerializedAccount(account);
		else
			throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/search/id/:id')
	async getById(@Param('id', ParseIntPipe) id: number, ) {
		const account = await this.accountService.findAccountById(id);
		if (account)
			return new PublicSerializedAccount(account);
		else
		{
			throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
			// throw new AccountNotFoundException();
			// throw new AccountNotFoundException();
			// throw new AccountNotFoundException('Account was not found unfortunately.', 400);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete('/delete/id/:id')
    async DeleteOne(@Param('id', ParseIntPipe) id: number)
    {
		if (await this.accountService.findAccountById(id))
			this.accountService.DeleteOne(id);
		else
			throw new AccountNotFoundException();
	}

	@UseGuards(JwtAuthGuard)
	@Put('/modify/username/:name')
    async PutByName(@Param('username') username: string, @Query() query)
    {
		
		console.log(username);
		if (query.username && await this.accountService.findAccountByUsername(query.username))
			throw new HttpException('Username already taken', HttpStatus.BAD_REQUEST);	
		else if(query.email && await this.accountService.findAccountByUsername(query.email))
			throw new HttpException('Email taken', HttpStatus.BAD_REQUEST);	
		else if (await this.accountService.findAccountByUsername(username))		
			return this.accountService.PutByName(username, query.username, query.email, query.password, query.rank, query.win, query.loss)
		else
			throw new AccountNotFoundException();
	}

	@UseGuards(JwtAuthGuard)
	@UsePipes(ValidationPipe)
	@Put('/register_username')
    async RegisterNewUsername(@Body() body: NewUsernameDto, @Request() req: any)
    {
		console.log('changing username:');
		console.log(body);
		const	account = await this.accountService.findAccountByUsername(body.username);
		console.log(account);
		if (account)
		{
			throw new HttpException('Username already taken', HttpStatus.BAD_REQUEST);
		}
		else
		{
			await this.accountService.UpdateUsername(req.user.login42, body.username);
		}
	}

	// @UseGuards(JwtAuthGuard)
	// @UseInterceptors(ClassSerializerInterceptor)
	// @Put('/modify/match')	
	// async PutMatchByName(@Query() query)
	// {
	// 	if (query.winner === undefined || query.looser === undefined)
	// 		throw new HttpException('No winner or looser name given', HttpStatus.BAD_REQUEST);
	// 	else if (query.winner == query.looser)
	// 		throw new HttpException('Same winner name and looser name given', HttpStatus.BAD_REQUEST);
		
	// 	const winner = await this.accountService.findAccountByUsername(query.winner);
	// 	const looser = await this.accountService.findAccountByUsername(query.looser);
		

	// 	if (query.looserscore === undefined || query.winnerscore === undefined
	// 		|| !IsNumber(query.looserscore) || !IsNumber(query.winnerscore))
	// 		throw new HttpException('winnerscore:' + query.winnerscore + ' - looserscore:' + query.looserscore, HttpStatus.BAD_REQUEST);	
	// 	else if (winner && looser)
	// 		return this.accountService.PutMatchByName(winner, looser, query.winnerscore, query.looserscore);
	// 	else
	// 		throw new AccountNotFoundException();

	// }




	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('Achievement')
	async getAchievement(@Request() req: any) {
		return this.accountService.getAchievement(req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('Achievement/id/:id')
	async getAchievementbyId(@Param('id') id: number) {
		return this.accountService.getAchievement(id);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Put('Achievement/:achievement')
	async PutAchievement(@Request() req: any, @Param('achievement') achievement: string) {
		
		if (achievement != "one" &&
		achievement != "two" &&
		achievement != "three" &&
		achievement != "four" &&
		achievement != "five" &&
		achievement != "six" &&
		achievement != "seven" &&
		achievement != "height" &&
		achievement != "nine" &&
		achievement != "ten" &&
		achievement != "eleven" &&
		achievement != "twelve")
			throw new HttpException('Bad Param', HttpStatus.BAD_REQUEST);	
		else
			return this.accountService.PutAchievement(req.user.userId, achievement);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('friendslist')
	async getFriendslist(@Request() req: any) {
		return this.accountService.getFriendslist(req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Put('friendslist/:friendname')
	async putFriendslist(@Request() req: any, @Param('friendname') friendname: string) {
		return this.accountService.putFriendslist(req.user.userId, friendname);
	}

	@UseGuards(JwtAuthGuard)
	@Put('friendslist/remove/:friendname')
	async putRemoveFriendslist(@Request() req: any, @Param('friendname') friendname: string) {
		return this.accountService.putRemoveFriendslist(req.user.userId, friendname);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('blocklist')
	async getblocklist(@Request() req: any) {
		return this.accountService.getblocklist(req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Put('blocklist/:blocker')
	async putblocklist(@Request() req: any, @Param('blocker') blocker: string) {
		return this.accountService.putblocklist(req.user.userId, blocker);
	}

	@UseGuards(JwtAuthGuard)
	@Put('blocklist/remove/:blocker')
	async putRemoveblocklist(@Request() req: any, @Param('blocker') blocker: string) {
		return this.accountService.putRemoveblocklist(req.user.userId, blocker);
	}

	@UseGuards(JwtAuthGuard)
	@Get('matchHistory')
	async getMatch() {
		return this.accountService.getMatch();
	}

	@UseGuards(JwtAuthGuard)
	@Get('/matchHistory/id/:id')
	async getMatchHistory(@Param('id', ParseIntPipe) id: number) {
		return this.accountService.getMatchById(id);
	}

	@UseGuards(JwtAuthGuard)
	@Put('/toggle2fa')
	async toogle2fa_auth(@Request() req: any) {
		return await this.accountService.change_2fa_switch(req.user.login42);
	}

	@UseGuards(JwtAuthGuard)
	@Post('create')
	@UsePipes(ValidationPipe)
	async createAccount(@Body() createAccountDto: CreateAccountDto) {
		
		if (await this.accountService.findAccountByUsername(createAccountDto.username))
			throw new HttpException('Username taken', HttpStatus.BAD_REQUEST);
		else if (await this.accountService.findAccountByEmail(createAccountDto.email))
			throw new HttpException('Email taken', HttpStatus.BAD_REQUEST);
		else
			return this.accountService.createAccount(createAccountDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post('uploadfile')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file'))
	async uploadSingle(@Request() req: any, @UploadedFile() file: Express.Multer.File){
	    if (file)
			return this.accountService.uploadSingle(req.user.userId, file.buffer, file.originalname);
		else
			throw new HttpException('File is undefined', HttpStatus.BAD_REQUEST);

	}

	@Get('avatar/username/:name')
	async getFileByName(@Res() response: Response, @Param('name') name: string)
	{
		const avatarId = await (await this.accountService.findAccountByUsername(name)).avatarId;

		if (avatarId)
		{
			const file = await this.accountService.getFileById(avatarId);
			const stream = Readable.from(file.data);
			stream.pipe(response);	
		}
		else
			throw new HttpException('Avatar not found', HttpStatus.BAD_REQUEST);

	}

	@Get('avatar/')
	async getFileByCookie(@Request() req: any, @Res() response: Response, @Param('name') name: string)
	{
		const avatarId = await (await this.accountService.findAccountByLogin(req.user.login42)).avatarId;

		if (avatarId)
		{
			const file = await this.accountService.getFileById(avatarId);
			const stream = Readable.from(file.data);
			stream.pipe(response);	
		}
		else
			throw new HttpException('Avatar not found', HttpStatus.BAD_REQUEST);

	}

}
