export class TeamLineup {
    teamId: number;
    battingOrder: number[];
    bowlingOrder: number[];
    wicketKeeper: number;

    constructor(
        teamId: number,
        battingOrder: number[],
        bowlingOrder: number[],
        wicketKeeper: number
    ) {
        this.teamId = teamId;
        this.wicketKeeper = wicketKeeper;
        
        // Only add wicketkeeper to non-empty batting orders
        if (battingOrder.length > 0 && !battingOrder.includes(wicketKeeper)) {
            this.battingOrder = [...battingOrder.slice(0, -1), wicketKeeper];
        } else {
            this.battingOrder = [...battingOrder];
        }
        
        this.bowlingOrder = [...bowlingOrder];
    }

    toJSON() {
        return {
            teamId: this.teamId,
            battingOrder: this.battingOrder,
            bowlingOrder: this.bowlingOrder,
            wicketKeeper: this.wicketKeeper
        };
    }

    static fromJSON(json: ReturnType<TeamLineup['toJSON']>): TeamLineup {
        return new TeamLineup(
            json.teamId,
            json.battingOrder,
            json.bowlingOrder,
            json.wicketKeeper
        );
    }
} 