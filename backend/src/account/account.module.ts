import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { ChatModule } from 'src/chat/chat.module';
import { User, MatchHistory, DatabaseFile, Achievement,blocMessages } from '../typeorm';
import { AccountController } from './controllers/account/account.controller';
import { AccountService } from './services/account/account.service';
@Module({
	imports: [TypeOrmModule.forFeature([User]),
				TypeOrmModule.forFeature([MatchHistory]),
				TypeOrmModule.forFeature([DatabaseFile]),
				TypeOrmModule.forFeature([Achievement]),
		],
	controllers: [AccountController],
	providers: [{
	  provide: 'ACCOUNT_SERVICE',
	  useClass: AccountService,
	},
	],
	exports : ['ACCOUNT_SERVICE']
})
export class AccountModule {}
