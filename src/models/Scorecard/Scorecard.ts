import { BattingScorecard } from "@/models/Scorecard/BattingScorecard";
import { BowlingScorecard } from "@/models/Scorecard/BowlingScorecard";

export class Scorecard {
    gameId: number;
    homeTeamBatting: BattingScorecard[];
    homeTeamBowling: BowlingScorecard[];
    awayTeamBatting: BattingScorecard[];
    awayTeamBowling: BowlingScorecard[];
    winner: number | null;

    constructor(
        gameId: number,
        homeTeamBatting: BattingScorecard[] = [],
        homeTeamBowling: BowlingScorecard[] = [],
        awayTeamBatting: BattingScorecard[] = [],
        awayTeamBowling: BowlingScorecard[] = [],
        winner: number | null = null
    ) {
        this.gameId = gameId;
        this.homeTeamBatting = homeTeamBatting;
        this.homeTeamBowling = homeTeamBowling;
        this.awayTeamBatting = awayTeamBatting;
        this.awayTeamBowling = awayTeamBowling;
        this.winner = winner;
    }

    toJSON() {
        return {
            gameId: this.gameId,
            homeTeamBatting: this.homeTeamBatting.map(s => s.toJSON()),
            homeTeamBowling: this.homeTeamBowling.map(s => s.toJSON()),
            awayTeamBatting: this.awayTeamBatting.map(s => s.toJSON()),
            awayTeamBowling: this.awayTeamBowling.map(s => s.toJSON()),
            winner: this.winner
        };
    }

    static fromJSON(json: {
        gameId: number,
        homeTeamBatting: ReturnType<BattingScorecard['toJSON']>[],
        homeTeamBowling: ReturnType<BowlingScorecard['toJSON']>[],
        awayTeamBatting: ReturnType<BattingScorecard['toJSON']>[],
        awayTeamBowling: ReturnType<BowlingScorecard['toJSON']>[],
        winner: number | null
    }): Scorecard {
        return new Scorecard(
            json.gameId,
            json.homeTeamBatting.map(s => BattingScorecard.fromJSON(s)),
            json.homeTeamBowling.map(s => BowlingScorecard.fromJSON(s)),
            json.awayTeamBatting.map(s => BattingScorecard.fromJSON(s)),
            json.awayTeamBowling.map(s => BowlingScorecard.fromJSON(s)),
            json.winner
        );
    }
}
