import { IsEmail, IsNotEmpty, Min, MinLength } from "class-validator";


export class CreateAccountDto {

	@IsNotEmpty()
	@MinLength(3)
	username: string;

	@IsNotEmpty()
	login42: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	win: number;

	loss: number;

	match: number;

	rank: number;

	picture: string;

	friendslist: number[];
	
	blocklist: number[];

}