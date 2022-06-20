import { PassportStrategy } from "@nestjs/passport";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../services/auth/auth.service";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from "../constant";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: any) {
		console.log('ca passe par JwtGuard');
		//const user = await this.authService.validateAccount(username, password);
		return { userId: payload.sub, login42: payload.login42};
	}
}