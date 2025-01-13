export class BowlingScorecard {
    playerId: number;
    balls: number;
    runs: number;
    wickets: number;
    maidens: number;
    wides: number;
    noBalls: number;
    byes: number;
    dotBalls: number;

    constructor(
        playerId: number,
        balls: number = 0,
        runs: number = 0,
        wickets: number = 0,
        maidens: number = 0,
        wides: number = 0,
        noBalls: number = 0,
        byes: number = 0,
        dotBalls: number = 0
    ) {
        this.playerId = playerId;
        this.balls = balls;
        this.runs = runs;
        this.wickets = wickets;
        this.maidens = maidens;
        this.wides = wides;
        this.noBalls = noBalls;
        this.byes = byes;
        this.dotBalls = dotBalls;
    }

    toJSON() {
        return {
            playerId: this.playerId,
            balls: this.balls,
            runs: this.runs,
            wickets: this.wickets,
            maidens: this.maidens,
            wides: this.wides,
            noBalls: this.noBalls,
            byes: this.byes,
            dotBalls: this.dotBalls
        };
    }

    static fromJSON(json: {
        playerId: number;
        balls?: number;
        runs?: number;
        wickets?: number;
        maidens?: number;
        wides?: number;
        noBalls?: number;
        byes?: number;
        dotBalls?: number;
    }): BowlingScorecard {
        return new BowlingScorecard(
            json.playerId,
            json.balls || 0,
            json.runs || 0,
            json.wickets || 0,
            json.maidens || 0,
            json.wides || 0,
            json.noBalls || 0,
            json.byes || 0,
            json.dotBalls || 0
        );
    }
} 