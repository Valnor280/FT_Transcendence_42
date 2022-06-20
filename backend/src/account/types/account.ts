import { Exclude } from "class-transformer";
export interface Account {
	id: number;
	username: string;
	login42: string;
	email: string;
	rank: number;
	win: number;
	loss: number;
	picture: string;
	doubleAuth: boolean;
}

export class SerializedAccount {
	id: number;
	username: string;
	email: string;
	rank: number;
	win: number;
	loss: number;
	picture: string;
	doubleAuth: boolean;
	
	login42: string;



	constructor(partial: Partial<SerializedAccount>) {
		Object.assign(this, partial);
	}
}

export class PublicSerializedAccount {
	id: number;
	username: string;
	rank: number;
	win: number;
	loss: number;
	picture: string;

	@Exclude()
	email: string;

	@Exclude()
	login42: string;

	@Exclude()
	doubleAuth: boolean;

	constructor(partial: Partial<PublicSerializedAccount>) {
		Object.assign(this, partial);
	}
}