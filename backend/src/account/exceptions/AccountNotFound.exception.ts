import { HttpException, HttpStatus } from "@nestjs/common";


export class AccountNotFoundException extends HttpException {
	constructor(msg?: string, status?: HttpStatus) {
		super(msg || 'Account Not Found', status || HttpStatus.BAD_REQUEST);
	}
}

export class AccountAlreadyExistsException extends HttpException {
	constructor(msg?: string, status?: HttpStatus) {
		super(msg || 'Username is already taken', status || HttpStatus.BAD_REQUEST);
	}
}