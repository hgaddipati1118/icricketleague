import { BattingStats } from "./BattingStats";
import { BowlingStats } from "./BowlingStats";
import { FieldingStats } from "./FieldingStats";

export class PlayerStats {
    game_id: number;
    season_id: number;
    curr_team: number;
    opp_team: number;
    battingStats: BattingStats;
    bowlingStats: BowlingStats;
    fieldingStats: FieldingStats;

    constructor(
        game_id: number = 0,
        season_id: number = 0,
        curr_team: number = 0,
        opp_team: number = 0,
        battingStats: BattingStats = new BattingStats(),
        bowlingStats: BowlingStats = new BowlingStats(),
        fieldingStats: FieldingStats = new FieldingStats()
    ) {
        this.game_id = game_id;
        this.season_id = season_id;
        this.curr_team = curr_team;
        this.opp_team = opp_team;
        this.battingStats = battingStats;
        this.bowlingStats = bowlingStats;
        this.fieldingStats = fieldingStats;
    }

    toJSON() {
        return {
            game_id: this.game_id,
            season_id: this.season_id,
            curr_team: this.curr_team,
            opp_team: this.opp_team,
            battingStats: this.battingStats.toJSON(),
            bowlingStats: this.bowlingStats.toJSON(),
            fieldingStats: this.fieldingStats.toJSON()
        };
    }

    static fromJSON(json: {
        game_id: number;
        season_id: number;
        curr_team: number;
        opp_team: number;
        battingStats: ReturnType<BattingStats['toJSON']>;
        bowlingStats: ReturnType<BowlingStats['toJSON']>;
        fieldingStats: ReturnType<FieldingStats['toJSON']>;
    }): PlayerStats {
        return new PlayerStats(
            json.game_id,
            json.season_id,
            json.curr_team,
            json.opp_team,
            BattingStats.fromJSON(json.battingStats),
            BowlingStats.fromJSON(json.bowlingStats),
            FieldingStats.fromJSON(json.fieldingStats)
        );
    }

}