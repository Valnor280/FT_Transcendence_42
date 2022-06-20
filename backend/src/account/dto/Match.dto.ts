import { IsNotEmpty } from "class-validator";

export class MatchDto
{
    winner: number;

    looser: number;

	winner_name: string;

	looser_name: string;

    winnerscore: number;

    looserscore: number;

	winner_rank: number;

	looser_rank: number;

}