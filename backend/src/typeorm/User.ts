import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne} from "typeorm";
import { Achievement } from "./Achievement.entity";
import { DatabaseFile } from "./dataFile.entity";

@Entity()
export class User {

	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'user_id',
	})
	id: number;

	@Column({
		nullable: false,
		default: '',
	})
	username: string;

	@Column({
		nullable: false,
		default: '',
	})
	login42: string;

	@Column({
		name: 'email_address',
		nullable: false,
		default: '',
	})
	email: string;

	@Column({
		nullable: false,
		default: 'database',
	})
	picture: string;

	@Column({
		default: 100
	})
	rank: number;

	@Column({
		default: 0
	})
	win: number;

	@Column({
		default: 0
	})
	loss: number;

	@Column({
		default: 0
	})
	match: number;

	@Column({
		default: false
	})
	doubleAuth: boolean;


	@JoinColumn({ name: 'avatarId' })
  	@OneToOne(
  	  () => DatabaseFile,
  	  {
  	    nullable: true
  	  }
  	)
  	public avatar?: DatabaseFile;
	
  	@Column({ nullable: true })
  	public avatarId?: number;

	@JoinColumn({ name: 'achievementId' })
  	@OneToOne(
  	  () => Achievement,
  	  {
  	    nullable: true
  	  }
  	)
  	public achievement?: Achievement;
	
  	@Column({ nullable: true })
  	public achievementId?: number;

	@Column("int", {array: true, nullable: true})
	friendslist: number[];  

	@Column("int", {array: true, nullable: true})
	blocklist: number[];

}