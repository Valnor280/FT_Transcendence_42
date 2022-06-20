import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Achievement{

    @PrimaryGeneratedColumn({
		type: 'bigint',
	})
	id: number;

    @Column({nullable: true})
    username: string;

    @Column({default: false})
    one: boolean;

    @Column({default: false})
    two: boolean;

    @Column({default: false})
    three: boolean;

    @Column({default: false})
    four: boolean;//lol xD ptdr

    @Column({default: false})
    five: boolean;

    @Column({default: false})
    six: boolean;

    @Column({default: false})
    seven: boolean;

    @Column({default: false})
    height: boolean;

    @Column({default: false})
    nine: boolean;

    @Column({default: false})
    ten: boolean;

    @Column({default: false})
    eleven: boolean;

    @Column({default: false})
    twelve: boolean;

}