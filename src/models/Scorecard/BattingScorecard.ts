import { Dismissal } from "@/models/Player/Dismissal";

export class BattingScorecard {
    playerId: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    howOut: Dismissal | null;
    bowler: number | null;
    fielder: number | null;

    constructor(
        playerId: number,
        runs: number = 0,
        balls: number = 0,
        fours: number = 0,
        sixes: number = 0,
        howOut: Dismissal | null = null,
        bowler: number | null = null,
        fielder: number | null = null
    ) {
        this.playerId = playerId;
        this.runs = runs;
        this.balls = balls;
        this.fours = fours;
        this.sixes = sixes;
        this.howOut = howOut;
        this.bowler = bowler;
        this.fielder = fielder;
    }

    toJSON() {
        return {
            playerId: this.playerId,
            runs: this.runs,
            balls: this.balls,
            fours: this.fours,
            sixes: this.sixes,
            howOut: this.howOut,
            bowler: this.bowler,
            fielder: this.fielder
        };
    }

    static fromJSON(json: {
        playerId: number,
        runs: number,
        balls: number,
        fours: number,
        sixes: number,
        howOut: Dismissal | null,
        bowler: number | null,
        fielder: number | null
    }): BattingScorecard {
        return new BattingScorecard(
            json.playerId,
            json.runs,
            json.balls,
            json.fours,
            json.sixes,
            json.howOut,
            json.bowler,
            json.fielder
        );
    }
} 