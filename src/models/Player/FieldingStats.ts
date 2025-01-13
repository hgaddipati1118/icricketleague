export class FieldingStats {
    catches: number;
    runOuts: number;
    stumpings: number;
    missedCatches: number;
    missedStumpings: number;
    missedRunOuts: number;

    constructor(
        catches: number = 0,
        runOuts: number = 0,
        stumpings: number = 0,
        missedCatches: number = 0,
        missedStumpings: number = 0,
        missedRunOuts: number = 0
    ) {
        this.catches = catches;
        this.runOuts = runOuts;
        this.stumpings = stumpings;
        this.missedCatches = missedCatches;
        this.missedStumpings = missedStumpings;
        this.missedRunOuts = missedRunOuts;
    }

    toJSON() {
        return {
            catches: this.catches,
            runOuts: this.runOuts,
            stumpings: this.stumpings,
            missedCatches: this.missedCatches,
            missedStumpings: this.missedStumpings,
            missedRunOuts: this.missedRunOuts
        };
    }

    static fromJSON(json: ReturnType<FieldingStats['toJSON']>): FieldingStats {
        return new FieldingStats(
            json.catches,
            json.runOuts,
            json.stumpings,
            json.missedCatches,
            json.missedStumpings,
            json.missedRunOuts
        );
    }
}
