export class FieldingStats {
    catches: number;
    runOuts: number;
    stumpings: number;
    missedCatches: number;
    missedRunOuts: number;
    missedStumpings: number;

    constructor(
        catches: number = 0,
        runOuts: number = 0,
        stumpings: number = 0,
        missedCatches: number = 0,
        missedRunOuts: number = 0,
        missedStumpings: number = 0
    ) {
        this.catches = catches;
        this.runOuts = runOuts;
        this.stumpings = stumpings;
        this.missedCatches = missedCatches;
        this.missedRunOuts = missedRunOuts;
        this.missedStumpings = missedStumpings;
    }

    toJSON() {
        return {
            catches: this.catches,
            runOuts: this.runOuts,
            stumpings: this.stumpings,
            missedCatches: this.missedCatches,
            missedRunOuts: this.missedRunOuts,
            missedStumpings: this.missedStumpings
        };
    }

    static fromJSON(json: {
        catches: number;
        runOuts: number;
        stumpings: number;
        missedCatches: number;
        missedRunOuts: number;
        missedStumpings: number;
    }): FieldingStats {
        return new FieldingStats(
            json.catches,
            json.runOuts,
            json.stumpings,
            json.missedCatches,
            json.missedRunOuts,
            json.missedStumpings
        );
    }
}
