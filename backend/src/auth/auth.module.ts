import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from 'src/account/services/account/account.service';
import { User, MatchHistory, DatabaseFile, Encrypted2fa, Achievement } from 'src/typeorm';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { SessionSerializer } from './utils/SessionSerializer';
import { jwtConstants } from './constant';
import { JwtStrategy } from './utils/JwtStrategy';
import { AccountModule } from 'src/account/account.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule} from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([MatchHistory]),
		TypeOrmModule.forFeature([DatabaseFile]),
		TypeOrmModule.forFeature([Encrypted2fa]),
		TypeOrmModule.forFeature([Achievement]),
		//TypeOrmModule.forFeature([SessionEntity]),
		PassportModule,
		ConfigModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '24h'},
		}),
		MailerModule.forRoot({
			transport: {
			service: "gmail",
			secure: false,
			auth: {
			  user: 'PongOfTheCentury@gmail.com',
			  pass: 'rlunmspjwwxzbbnb',
			},
		  },
		  defaults: {
			from: '"No Reply" <PongOfTheCentury@gmail.com>',
		  },
		  template: {
			dir: join(__dirname, 'templates'),
			adapter: new HandlebarsAdapter(), 
			options: {
			  strict: true,
			},
		  },
		}),
		],
  controllers: [AuthController],
  providers: [
	  {
		  provide: 'AUTH_SERVICE',
		  useClass: AuthService,
	  },
	  {
		  provide: 'ACCOUNT_SERVICE',
		  useClass: AccountService,
	  },
	  JwtStrategy,
	  //SessionSerializer,
  ],
  exports : ['AUTH_SERVICE']
  //exports: [AuthService],
})
export class AuthModule {}
