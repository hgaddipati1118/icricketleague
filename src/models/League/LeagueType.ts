import { PlayoffType } from "./PlayoffType";
import { AuctionType } from "./AuctionType";

export class LeagueType {           
    GAMES_PER_TEAM: number; 
    PLAYOFF_TYPE: PlayoffType;
    AUCTION_TYPE: AuctionType;
    TEAM_NUMBER: number;
    MAX_PLAYERS_PER_TEAM: number;        
    PLAYOFF_HOMEFIELD_ADVANTAGE: boolean;

    constructor(gamesPerTeam: number, maxPlayersPerTeam: number, playoffType: PlayoffType, auctionType: AuctionType, teamNumber: number, playoffHomefieldAdvantage: boolean) {
        this.GAMES_PER_TEAM = gamesPerTeam;
        this.MAX_PLAYERS_PER_TEAM = maxPlayersPerTeam;
        this.PLAYOFF_TYPE = playoffType;
        this.AUCTION_TYPE = auctionType;
        this.TEAM_NUMBER = teamNumber;
        this.PLAYOFF_HOMEFIELD_ADVANTAGE = playoffHomefieldAdvantage;
    }

    toJSON() {
        return {
            GAMES_PER_TEAM: this.GAMES_PER_TEAM,
            MAX_PLAYERS_PER_TEAM: this.MAX_PLAYERS_PER_TEAM,
            PLAYOFF_TYPE: this.PLAYOFF_TYPE,
            AUCTION_TYPE: this.AUCTION_TYPE,
            TEAM_NUMBER: this.TEAM_NUMBER,
            PLAYOFF_HOMEFIELD_ADVANTAGE: this.PLAYOFF_HOMEFIELD_ADVANTAGE
        };
    }

    static fromJSON(json: {
        GAMES_PER_TEAM: number,
        MAX_PLAYERS_PER_TEAM: number,
        PLAYOFF_TYPE: PlayoffType,
        AUCTION_TYPE: AuctionType,
        TEAM_NUMBER: number,
        PLAYOFF_HOMEFIELD_ADVANTAGE: boolean
    }): LeagueType {
        return new LeagueType(
            json.GAMES_PER_TEAM,
            json.MAX_PLAYERS_PER_TEAM,
            json.PLAYOFF_TYPE,
            json.AUCTION_TYPE,
            json.TEAM_NUMBER,
            json.PLAYOFF_HOMEFIELD_ADVANTAGE
        );
    }
}
