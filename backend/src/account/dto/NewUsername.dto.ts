import { IsNotEmpty, MaxLength, MinLength } from "class-validator";


export class NewUsernameDto {

	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
	username: string;
}