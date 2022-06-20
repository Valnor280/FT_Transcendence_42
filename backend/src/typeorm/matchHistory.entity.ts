import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MatchHistory{

    @PrimaryGeneratedColumn({
		type: 'bigint',
	})
	id: number;

    @Column()
    winner: number;

    @Column()
    looser: number;

	@Column()
	winner_name: string;

	@Column()
	looser_name: string;

    @Column()
    winnerscore: number;

    @Column()
    looserscore: number;

	@Column()
	winner_rank: number;

	@Column()
	looser_rank: number;
}