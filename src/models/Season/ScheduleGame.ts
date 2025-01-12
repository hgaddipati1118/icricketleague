import { GameType } from "./GameType";

export class ScheduleGame {
    id: number;
    stadium: number; //StadiumId
    homeTeam: number; //TeamId
    awayTeam: number; //TeamId
    gameType: GameType;

    constructor(id: number, stadium: number, homeTeam: number, awayTeam: number, gameType: GameType) {
        this.id = id;
        this.stadium = stadium;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.gameType = gameType;
    }

    toJSON() {
        return {
            id: this.id,
            stadium: this.stadium,
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            gameType: this.gameType
        };
    }

    static fromJSON(json: {
        id: number,
        stadium: number,
        homeTeam: number,
        awayTeam: number,
        gameType: GameType
    }): ScheduleGame {
        return new ScheduleGame(
            json.id,
            json.stadium,
            json.homeTeam,
            json.awayTeam,
            json.gameType
        );
    }
}
