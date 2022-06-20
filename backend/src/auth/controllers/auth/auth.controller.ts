import { Controller, Ip, Post, Request, Session, UseGuards, Get, Req, Res, Headers, Inject, Options, Body, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { codeDto } from 'src/auth/dto/login42.code.dto';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/utils/JwtGuard';
import { PassThrough } from 'stream';
import $axios from 'src/plugin/axios';
import { login42constants } from 'src/auth/constant';
import { AccountService } from 'src/account/services/account/account.service';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';
import Mail from 'nodemailer/lib/mailer';


@Controller('auth')
export class AuthController {

	constructor(
		private configService: ConfigService,
		@Inject('AUTH_SERVICE') private readonly authService: AuthService,
		@Inject('ACCOUNT_SERVICE') private readonly accountService: AccountService,
	) {}

	// @UseGuards(LocalAuthGuard)
	// @Post('login')
	// async login(@Request() req, @Res( {passthrough: true} ) response: Response) {
	// 	//const	token = await this.authService.login(req.user);
	// 	//response.cookie('jwt', token.access_token, {httpOnly: true});
	// 	return await this.authService.login(req.user);
	// }
	
	@UseGuards(JwtAuthGuard)
	@Get('/status')
	async getAuthStatus(@Request() req: Request) {
	}

	@UseGuards(JwtAuthGuard)
	@Get('/ipAddress')
	async myEndpointFunc(@Ip() ip){
		console.log(ip)
	}


	@UsePipes(ValidationPipe)
	@Post('/login42')
	async call42api(@Body() code: codeDto) {
		console.log('login42 route here');
		console.log(code);
		// $axios.post('https://api.intra.42.fr/oauth/token', login42constants, )

		if (code.auth !== '0')
		{
			const encryptedAccount = await this.authService.findEncryptbyId(Number(code.auth));
			if (encryptedAccount)
			{
				const real_account = await this.accountService.findAccountByLogin(encryptedAccount.login42);
				console.log('Encrypted Acount exists');
				if (encryptedAccount.isVerified)
				{
					console.log('Encrypted Acount has been verified');
					this.authService.deleteEncrypted(encryptedAccount.id);
					return await {access_token: await this.authService.login({
								login42: real_account.login42,
								id: real_account.id,
							}),
								sign_in: 1,
						};
				}
				else
				{
					console.log('Encrypted Acount is not yet verified');
					await this.authService.sendConfirmationEmail({
						login42: encryptedAccount.login42,
						email: encryptedAccount.email,
					}, encryptedAccount.authConfirmToken);
					return ({sign_in: 2});
				}
			}
		}

		const postdata = {
			grant_type: this.configService.get<string>('GRANT_TYPE'),
			client_id: this.configService.get<string>('CLIENT_ID'),
			client_secret: this.configService.get<string>('CLIENT_SECRET'),
			code: code.code,
			redirect_uri: this.configService.get<string>('REDIRECT_URL'),
		}

		console.log('initiating token demand here');

		//api backend call to get 42token
		const res = await $axios({
			url: 'https://api.intra.42.fr/oauth/token',
			method: 'post',
			data: postdata,
		  });
		  console.log('coucou c moi err');
		if (!res)
		{
			console.log('cant receive token from 42API');
			throw new HttpException('Error getting token from the 42 API', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		var	token_42: string = 'Bearer '.concat(res.data.access_token);
		// get back info of 42api on user
		const account_info = await $axios({
			url: 'https://api.intra.42.fr/v2/me',
			method: 'get',
			headers: {
				'Authorization': token_42,
			}
		  }).catch(() => {
				console.log('Error with the 42 API, cant collect user data');
				throw new HttpException('Error contacting the 42 API', HttpStatus.INTERNAL_SERVER_ERROR);
		  });
		  if (!account_info)
		  {
			throw new HttpException('Error setting up account', HttpStatus.INTERNAL_SERVER_ERROR);
		  }

		const	account = await this.accountService.findAccountByLogin(account_info.data.login);

		if (account)
		{
			console.log('Account exists');
			if (account.doubleAuth === false)
			{
				console.log('doubleAuth === false');
				return {access_token: await this.authService.login({
							login42: account.login42,
							id: account.id,
						}),
							sign_in: 1,
				};
			}
			else
			{
				console.log('doubleAuth === true');
				const encryptedAccount = await this.authService.findEncryptbyLogin(account.login42);
				if (encryptedAccount)
				{
					console.log('Encrypted Acount exists');
					if (encryptedAccount.isVerified)
					{
						console.log('Encrypted Acount has been verified');
						this.authService.deleteEncrypted(encryptedAccount.id);
						return {access_token: await this.authService.login({
									login42: account.login42,
									id: account.id,
								}),
									sign_in: 1,
							};
					}
					else
					{
						console.log('Encrypted Acount is not yet verified');
						this.authService.sendConfirmationEmail({
							login42: encryptedAccount.login42,
							email: encryptedAccount.email,
						}, encryptedAccount.authConfirmToken);
						return ({sign_in: 2});
					}
				}
				else
				{
					console.log('Encrypted Acount does not exist');
					const response: any = this.authService.signup(account_info.data.login, account_info.data.email);
					return ({sign_in: 2});
				}
			}
		}
		else
		{
			console.log('Creating new Account');
			const new_account = await this.accountService.createAccount({
				username: account_info.data.login,
				login42: account_info.data.login,
				email: account_info.data.email,
				win: 0,
				loss: 0,
				match: 0,
				rank: 100,
				picture: account_info.data.image_url,
				friendslist: [],
				blocklist: [],
			})
			const key = await this.authService.login({
				login42: new_account.login42,
				id: new_account.id,
			});
			console.log('JWT-token sent is:');
			console.log(key);
			return {
				access_token: key,
				sign_in: 0,
			};
		}
	}

	@UsePipes(ValidationPipe)
	@Post('/confirmCode')
	async VerifyCode(@Body() body) {
		console.log(body);
		const id =  await this.authService.catchCode(body.code);
		if (id === -1)
		{
			console.log('error here <---------------------------------');
			throw new HttpException('Error setting up account', HttpStatus.NOT_ACCEPTABLE);
		}
		return id;
	}
}