import { Inject } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AccountService } from "src/account/services/account/account.service";
import { User } from "src/typeorm";


export class SessionSerializer extends PassportSerializer {

	constructor(
		@Inject('ACCOUNT_SERVICE') private readonly accountService: AccountService,
	) {
		super();
	}

	serializeUser(account: User, done: (err, account: User) => void) {
		console.log('SerializeUser');
		done(null, account);
	}

	async deserializeUser(account: User, done: (err, account: User) => void) {
		console.log('DeserializeUser');
		const accountDB = await this.accountService.findAccountById(account.id);
		return accountDB ? done(null, accountDB) : done(null, null);
	}
}