import { PlayerStats } from '../../../models/Player/PlayerStats';
import { BattingStats } from '../../../models/Player/BattingStats';
import { BowlingStats } from '../../../models/Player/BowlingStats';
import { FieldingStats } from '../../../models/Player/FieldingStats';
import { Dismissal } from '../../../models/Player/Dismissal';

describe('PlayerStats', () => {
    let defaultStats: PlayerStats;
    let defaultBattingStats: BattingStats;
    let defaultBowlingStats: BowlingStats;
    let defaultFieldingStats: FieldingStats;

    beforeEach(() => {
        defaultBattingStats = new BattingStats(50, 30, 3, 5, 2, true, Dismissal.CAUGHT);
        defaultBowlingStats = new BowlingStats(30, 24, 1, 2, 1, 2, 3, 12);
        defaultFieldingStats = new FieldingStats(2, 1, 1, 1, 1, 0);

        defaultStats = new PlayerStats(
            1,                      // game_id
            1,                      // season_id
            2,                      // curr_team
            3,                      // opp_team
            defaultBattingStats,    // battingStats
            defaultBowlingStats,    // bowlingStats
            defaultFieldingStats    // fieldingStats
        );
    });

    describe('constructor', () => {
        it('should create player stats with default values', () => {
            const stats = new PlayerStats();
            expect(stats.game_id).toBe(0);
            expect(stats.season_id).toBe(0);
            expect(stats.curr_team).toBe(0);
            expect(stats.opp_team).toBe(0);
            expect(stats.battingStats).toBeInstanceOf(BattingStats);
            expect(stats.bowlingStats).toBeInstanceOf(BowlingStats);
            expect(stats.fieldingStats).toBeInstanceOf(FieldingStats);
        });

        it('should create player stats with provided values', () => {
            expect(defaultStats.game_id).toBe(1);
            expect(defaultStats.season_id).toBe(1);
            expect(defaultStats.curr_team).toBe(2);
            expect(defaultStats.opp_team).toBe(3);
            expect(defaultStats.battingStats).toBe(defaultBattingStats);
            expect(defaultStats.bowlingStats).toBe(defaultBowlingStats);
            expect(defaultStats.fieldingStats).toBe(defaultFieldingStats);
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should correctly serialize player stats', () => {
            const json = defaultStats.toJSON();
            expect(json).toEqual({
                game_id: 1,
                season_id: 1,
                curr_team: 2,
                opp_team: 3,
                battingStats: defaultBattingStats.toJSON(),
                bowlingStats: defaultBowlingStats.toJSON(),
                fieldingStats: defaultFieldingStats.toJSON()
            });
        });

        it('should correctly deserialize player stats', () => {
            const json = defaultStats.toJSON();
            const recreatedStats = PlayerStats.fromJSON(json);

            expect(recreatedStats.game_id).toBe(defaultStats.game_id);
            expect(recreatedStats.season_id).toBe(defaultStats.season_id);
            expect(recreatedStats.curr_team).toBe(defaultStats.curr_team);
            expect(recreatedStats.opp_team).toBe(defaultStats.opp_team);

            // Check batting stats
            expect(recreatedStats.battingStats.runs).toBe(defaultBattingStats.runs);
            expect(recreatedStats.battingStats.balls).toBe(defaultBattingStats.balls);
            expect(recreatedStats.battingStats.position).toBe(defaultBattingStats.position);
            expect(recreatedStats.battingStats.fours).toBe(defaultBattingStats.fours);
            expect(recreatedStats.battingStats.sixes).toBe(defaultBattingStats.sixes);
            expect(recreatedStats.battingStats.out).toBe(defaultBattingStats.out);
            expect(recreatedStats.battingStats.dismissalType).toBe(defaultBattingStats.dismissalType);

            // Check bowling stats
            expect(recreatedStats.bowlingStats.runs).toBe(defaultBowlingStats.runs);
            expect(recreatedStats.bowlingStats.balls).toBe(defaultBowlingStats.balls);
            expect(recreatedStats.bowlingStats.maidens).toBe(defaultBowlingStats.maidens);
            expect(recreatedStats.bowlingStats.wickets).toBe(defaultBowlingStats.wickets);
            expect(recreatedStats.bowlingStats.noBalls).toBe(defaultBowlingStats.noBalls);
            expect(recreatedStats.bowlingStats.wides).toBe(defaultBowlingStats.wides);
            expect(recreatedStats.bowlingStats.byes).toBe(defaultBowlingStats.byes);
            expect(recreatedStats.bowlingStats.dotBalls).toBe(defaultBowlingStats.dotBalls);

            // Check fielding stats
            expect(recreatedStats.fieldingStats.catches).toBe(defaultFieldingStats.catches);
            expect(recreatedStats.fieldingStats.runOuts).toBe(defaultFieldingStats.runOuts);
            expect(recreatedStats.fieldingStats.stumpings).toBe(defaultFieldingStats.stumpings);
            expect(recreatedStats.fieldingStats.missedCatches).toBe(defaultFieldingStats.missedCatches);
            expect(recreatedStats.fieldingStats.missedRunOuts).toBe(defaultFieldingStats.missedRunOuts);
            expect(recreatedStats.fieldingStats.missedStumpings).toBe(defaultFieldingStats.missedStumpings);
        });
    });
}); 