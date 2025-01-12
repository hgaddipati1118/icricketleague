export class BowlingStats {
    runs: number;
    balls: number;
    maidens: number;
    wickets: number;
    noBalls: number;
    wides: number;
    byes: number;
    dotBalls: number;

    constructor(
        runs: number = 0,
        balls: number = 0,
        maidens: number = 0,
        wickets: number = 0,
        noBalls: number = 0,
        wides: number = 0,
        byes: number = 0,
        dotBalls: number = 0
    ) {
        this.runs = runs;
        this.balls = balls;
        this.maidens = maidens;
        this.wickets = wickets;
        this.noBalls = noBalls;
        this.wides = wides;
        this.byes = byes;
        this.dotBalls = dotBalls;
    }

    toJSON() {
        return {
            runs: this.runs,
            balls: this.balls,
            maidens: this.maidens,
            wickets: this.wickets,
            noBalls: this.noBalls,
            wides: this.wides,
            byes: this.byes,
            dotBalls: this.dotBalls
        };
    }

    static fromJSON(json: {
        runs: number;
        balls: number;
        maidens: number;
        wickets: number;
        noBalls: number;
        wides: number;
        byes: number;
        dotBalls: number;
    }): BowlingStats {
        return new BowlingStats(
            json.runs,
            json.balls,
            json.maidens,
            json.wickets,
            json.noBalls,
            json.wides,
            json.byes,
            json.dotBalls
        );
    }
}