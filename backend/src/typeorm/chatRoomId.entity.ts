import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { blocMessages } from './blocMessages.entity';
import { User } from './User';

// http://localhost:3000/api/chatid
// @OneToMany(() => blocMessages, (id) => id.chatRoomId)
// isChatRoom : false = message prive, true
@Entity()
export class chatRoomId {
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column({nullable: true})
	chatRoomName : string;

	@Column({nullable: true})
	isChatRoom : boolean;

	@Column({nullable: true})
	isPublic : boolean;

	@Column({nullable: true})
	password : string;
	
	@JoinTable()
	@ManyToMany(() => User, { cascade: true })
	Admins: User[]

	@JoinTable()
	@ManyToMany(() => User, { cascade: true })
	Ban: User[]

	@Column("int", {nullable: true, array: true})
	BanTime: number[]

	@JoinTable()
	@ManyToMany(() => User, { cascade: true })
	Mute: User[]

	@Column("int", {nullable: true, array: true})
	MuteTime: number[]
}