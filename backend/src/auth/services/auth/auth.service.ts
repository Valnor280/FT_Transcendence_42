import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountService } from 'src/account/services/account/account.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from 'src/utils/bcrypt';
import { Encrypted2fa as Encrypted2faentity} from 'src/typeorm';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {

	private code: number;

	constructor(
		private jwtService: JwtService,
		private mailerService: MailerService,
		//@Inject('JWT_SERVICE') private readonly jwtService: JwtService,
		@Inject('ACCOUNT_SERVICE') private readonly accountService: AccountService,
		@InjectRepository(Encrypted2faentity) private cryptedRepository: Repository<Encrypted2faentity>,
		//@Inject('MAILER_SERVICE') private readonly mailerService: MailerService,
		//@InjectRepository(SessionEntity) private readonly sessionRepository: Repository<SessionEntity>
	) {
		this.code = Math.floor(1000 + (Math.random() * 9000));
	}

	async sendConfirmedEmail(login42: string, email: string)
	{
		await this.mailerService.sendMail({
			to: email,
			subject: 'Welcome to the best pong',
			template: 'confirmed',
			context: {
				name: login42,
				email,
			},
		});
	}

	async sendConfirmationEmail(user: any, code: string) {
		const { email, login42 } = await user;

		await this.mailerService.sendMail({
			to: email,
			subject: 'Welcome to our Pong! Please confirm email',
			template: 'confirm',
			context: {
				name: login42,
				code: code,
			},
		});
	}

	async signup(login: string, email: string)
	{
		try {
			const reqBody = {
				login42: login,
				email: email,
				authConfirmToken: String(this.code),
			};
			const newUser = await this.cryptedRepository.insert(reqBody);
			await this.sendConfirmationEmail(reqBody, String(this.code));
			this.code = Math.floor(1000 + (Math.random() * 9000));
			return true;
		} catch(e) {
			return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async catchCode(code: string)
	{
		const account =  await this.cryptedRepository.findOne({
			where: {
				authConfirmToken: code,
			}
		});
		if (account)
		{
			account.isVerified = true;
			this.cryptedRepository.save(account);
			return(account.id);
		}
		else
		{
			return(-1);
		}
	}

	async deleteEncrypted(id: number)
	{
		await this.cryptedRepository.delete(id);
	}

	async findEncryptbyLogin(login42: string)
	{
		const account = await this.cryptedRepository.findOne({
			where: {
				login42: login42,
			},
		});
		return account;
	}

	async findEncryptbyId(Id: number)
	{
		const account = await this.cryptedRepository.findOne({
			where: {
				id: Id,
			},
		});
		return account;
	}

	async login(user: any) {
		const	payload = {login42: user.login42, sub: user.id};
		return await this.jwtService.sign(payload);
	}

	async decodeToken(token: string)
    {
        const decodedJwtToken = await this.jwtService.decode(token);
        return await decodedJwtToken;
    }
}
