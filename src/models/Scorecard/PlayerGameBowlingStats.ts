export class PlayerGameBowlingStats {
    id: number; //PlayerId
    balls: number;
    runs: number;
    wickets: number;
    maidens: number;
    noBalls: number;
    wides: number;
    byes: number;
    dotBalls: number;

    constructor(id: number, balls: number, runs: number, wickets: number, maidens: number, noBalls: number, wides: number, byes: number, dotBalls: number) {
        this.id = id;
        this.balls = balls;
        this.runs = runs;
        this.wickets = wickets;
        this.maidens = maidens;
        this.noBalls = noBalls;
        this.wides = wides;
        this.byes = byes;
        this.dotBalls = dotBalls;
    }

    toJSON(){
        return {
            id: this.id,
            balls: this.balls,
            runs: this.runs,
            wickets: this.wickets,
            maidens: this.maidens,
            noBalls: this.noBalls,
            wides: this.wides,
            byes: this.byes,
            dotBalls: this.dotBalls
        };
    }
    static fromJSON(json: { id: number, balls: number, runs: number, wickets: number, maidens: number, noBalls: number, wides: number, byes: number, dotBalls: number }): PlayerGameBowlingStats {
        return new PlayerGameBowlingStats(
            json.id,
            json.balls,
            json.runs,
            json.wickets,
            json.maidens,
            json.noBalls,
            json.wides,
            json.byes,
            json.dotBalls
        );
    }
}
