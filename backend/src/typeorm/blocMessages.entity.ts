import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm'
import { chatRoomId } from './chatRoomId.entity';
import { User } from './User';
// http://localhost:3000/api/chat
@Entity()
export class blocMessages {
	@PrimaryGeneratedColumn()
	idMsg : number | null;

	@Column({nullable: true})
	id: number | null;

	@Column({nullable: true})
	username : string;

	@Column({nullable: true})
	date : string;

	@Column({nullable: true})
	messages : string;
}