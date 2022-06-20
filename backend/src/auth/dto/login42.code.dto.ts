import { IsNotEmpty, MaxLength, MinLength } from "class-validator";


export class codeDto {

	@IsNotEmpty()
	code: string;

	@IsNotEmpty()
	auth: string;
}