import { GameType } from "./GameType";

export class ScheduleGame {
    id: number;
    stadium: number; //StadiumId
    homeTeam: number; //TeamId
    awayTeam: number; //TeamId
    gameType: GameType;
    homeScore?: number;
    awayScore?: number;
    homeWickets?: number;
    awayWickets?: number;

    constructor(id: number, stadium: number, homeTeam: number, awayTeam: number, gameType: GameType) {
        this.id = id;
        this.stadium = stadium;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.gameType = gameType;
        this.homeScore = undefined;
        this.awayScore = undefined;
        this.homeWickets = undefined;
        this.awayWickets = undefined;
    }

    toJSON() {
        return {
            id: this.id,
            stadium: this.stadium,
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            gameType: this.gameType,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            homeWickets: this.homeWickets,
            awayWickets: this.awayWickets
        };
    }

    static fromJSON(json: {
        id: number,
        stadium: number,
        homeTeam: number,
        awayTeam: number,
        gameType: GameType,
        homeScore?: number,
        awayScore?: number,
        homeWickets?: number,
        awayWickets?: number
    }): ScheduleGame {
        const game = new ScheduleGame(
            json.id,
            json.stadium,
            json.homeTeam,
            json.awayTeam,
            json.gameType
        );
        game.homeScore = json.homeScore;
        game.awayScore = json.awayScore;
        game.homeWickets = json.homeWickets;
        game.awayWickets = json.awayWickets;
        return game;
    }
}
