export class TeamLineup {
    teamId: number;
    battingOrder: number[];
    bowlingOrder: number[];
    wicketKeeper: number | undefined;

    constructor(teamId: number, battingOrder: number[], bowlingOrder: number[], wicketKeeper: number | undefined) {
        this.teamId = teamId;
        this.battingOrder = battingOrder;
        this.bowlingOrder = bowlingOrder;
        this.wicketKeeper = wicketKeeper;
    }

    toJSON() {
        return {
            teamId: this.teamId,
            battingOrder: this.battingOrder,
            bowlingOrder: this.bowlingOrder,
            wicketKeeper: this.wicketKeeper
        };
    }

    static fromJSON(json: {
        teamId: number,
        battingOrder: number[],
        bowlingOrder: number[],
        wicketKeeper: number | undefined
    }): TeamLineup {
        return new TeamLineup(
            json.teamId,
            json.battingOrder,
            json.bowlingOrder,
            json.wicketKeeper
        );
    }
} 