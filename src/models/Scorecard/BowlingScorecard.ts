export class BowlingScorecard {
    playerId: number;
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    wides: number;
    noBalls: number;

    constructor(
        playerId: number,
        overs: number = 0,
        maidens: number = 0,
        runs: number = 0,
        wickets: number = 0,
        wides: number = 0,
        noBalls: number = 0
    ) {
        this.playerId = playerId;
        this.overs = overs;
        this.maidens = maidens;
        this.runs = runs;
        this.wickets = wickets;
        this.wides = wides;
        this.noBalls = noBalls;
    }

    toJSON() {
        return {
            playerId: this.playerId,
            overs: this.overs,
            maidens: this.maidens,
            runs: this.runs,
            wickets: this.wickets,
            wides: this.wides,
            noBalls: this.noBalls
        };
    }

    static fromJSON(json: {
        playerId: number,
        overs: number,
        maidens: number,
        runs: number,
        wickets: number,
        wides: number,
        noBalls: number
    }): BowlingScorecard {
        return new BowlingScorecard(
            json.playerId,
            json.overs,
            json.maidens,
            json.runs,
            json.wickets,
            json.wides,
            json.noBalls
        );
    }
} 