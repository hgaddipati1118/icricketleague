import { Dismissal } from "./Dismissal";

export class BattingStats {
    runs: number;
    balls: number;
    position: number;
    fours: number;
    sixes: number;
    out: boolean;
    dismissalType: Dismissal;

    constructor(
        runs: number = 0,
        balls: number = 0,
        position: number = 0,
        fours: number = 0,
        sixes: number = 0,
        out: boolean = false,
        dismissalType: Dismissal = Dismissal.BOWLED
    ) {
        this.runs = runs;
        this.balls = balls;
        this.position = position;
        this.fours = fours;
        this.sixes = sixes;
        this.out = out;
        this.dismissalType = dismissalType;
    }

    toJSON() {
        return {
            runs: this.runs,
            balls: this.balls,
            position: this.position,
            fours: this.fours,
            sixes: this.sixes,
            out: this.out,
            dismissalType: this.dismissalType
        };
    }

    static fromJSON(json: {
        runs: number;
        balls: number;
        position: number;
        fours: number;
        sixes: number;
        out: boolean;
        dismissalType: Dismissal;
    }): BattingStats {
        return new BattingStats(
            json.runs,
            json.balls,
            json.position,
            json.fours,
            json.sixes,
            json.out,
            json.dismissalType
        );
    }
}
