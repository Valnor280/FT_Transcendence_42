import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany } from 'typeorm'
import { chatRoomId } from './chatRoomId.entity';

@Entity()
export class roomLog {
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column({nullable: true})
	hisId : number;

	@Column({nullable: true})
	hisStatue : string;

	@Column({nullable: true})
	timeLeft : number;
	
	@JoinTable()
	@ManyToMany(() => chatRoomId, { cascade: true })
	RoomId: chatRoomId
}