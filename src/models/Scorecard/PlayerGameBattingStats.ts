import { Dismissal } from "../Player/Dismissal";

export class PlayerGameBattingStats {
    id: number; //PlayerId
    position: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    out: boolean;
    batted: boolean;
    dismissalType: Dismissal;   
    dismissalPlayer1?: number; //PlayerId
    dismissalPlayer2?: number; //PlayerId
    dissmalBall?: number;

    constructor(id: number, position: number, runs: number, balls: number, fours: number, sixes: number, out: boolean, batted: boolean, dismissalType: Dismissal, dismissalPlayer1?: number, dismissalPlayer2?: number, dissmalBall?: number) {
        this.id = id;
        this.position = position;
        this.runs = runs;
        this.balls = balls;
        this.fours = fours;
        this.sixes = sixes;
        this.out = out;
        this.batted = batted;
        this.dismissalType = dismissalType;
        this.dismissalPlayer1 = dismissalPlayer1;
        this.dismissalPlayer2 = dismissalPlayer2;
        this.dissmalBall = dissmalBall;
    }

    toJSON() {
        return {
            id: this.id,
            position: this.position,
            runs: this.runs,
            balls: this.balls,
            fours: this.fours,
            sixes: this.sixes,
            out: this.out,
            batted: this.batted,
            dismissalType: this.dismissalType,
            dismissalPlayer1: this.dismissalPlayer1,
            dismissalPlayer2: this.dismissalPlayer2,
            dissmalBall: this.dissmalBall
        };
    }

    static fromJSON(json: {
        id: number,
        position: number,
        runs: number,
        balls: number,
        fours: number,
        sixes: number,
        out: boolean,
        batted: boolean,
        dismissalType: Dismissal,
        dismissalPlayer1?: number,
        dismissalPlayer2?: number,
        dissmalBall?: number
    }): PlayerGameBattingStats {
        return new PlayerGameBattingStats(
            json.id,
            json.position,
            json.runs,
            json.balls,
            json.fours,
            json.sixes,
            json.out,
            json.batted,
            json.dismissalType,
            json.dismissalPlayer1,
            json.dismissalPlayer2,
            json.dissmalBall
        );
    }
}
