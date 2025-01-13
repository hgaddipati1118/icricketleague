import { BattingStats } from '../../../models/Player/BattingStats';
import { Dismissal } from '../../../models/Player/Dismissal';

describe('BattingStats', () => {
    let defaultStats: BattingStats;

    beforeEach(() => {
        defaultStats = new BattingStats(
            50,     // runs
            30,     // balls
            3,      // position
            5,      // fours
            2,      // sixes
            true,   // out
            Dismissal.CAUGHT // dismissalType
        );
    });

    describe('constructor', () => {
        it('should create batting stats with default values', () => {
            const stats = new BattingStats();
            expect(stats.runs).toBe(0);
            expect(stats.balls).toBe(0);
            expect(stats.position).toBe(0);
            expect(stats.fours).toBe(0);
            expect(stats.sixes).toBe(0);
            expect(stats.out).toBe(false);
            expect(stats.dismissalType).toBe(Dismissal.BOWLED);
        });

        it('should create batting stats with provided values', () => {
            expect(defaultStats.runs).toBe(50);
            expect(defaultStats.balls).toBe(30);
            expect(defaultStats.position).toBe(3);
            expect(defaultStats.fours).toBe(5);
            expect(defaultStats.sixes).toBe(2);
            expect(defaultStats.out).toBe(true);
            expect(defaultStats.dismissalType).toBe(Dismissal.CAUGHT);
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should correctly serialize batting stats', () => {
            const json = defaultStats.toJSON();
            expect(json).toEqual({
                runs: 50,
                balls: 30,
                position: 3,
                fours: 5,
                sixes: 2,
                out: true,
                dismissalType: Dismissal.CAUGHT
            });
        });

        it('should correctly deserialize batting stats', () => {
            const json = defaultStats.toJSON();
            const recreatedStats = BattingStats.fromJSON(json);

            expect(recreatedStats.runs).toBe(defaultStats.runs);
            expect(recreatedStats.balls).toBe(defaultStats.balls);
            expect(recreatedStats.position).toBe(defaultStats.position);
            expect(recreatedStats.fours).toBe(defaultStats.fours);
            expect(recreatedStats.sixes).toBe(defaultStats.sixes);
            expect(recreatedStats.out).toBe(defaultStats.out);
            expect(recreatedStats.dismissalType).toBe(defaultStats.dismissalType);
        });

        it('should handle different dismissal types', () => {
            const dismissalTypes = [
                Dismissal.BOWLED,
                Dismissal.CAUGHT,
                Dismissal.LBW,
                Dismissal.RUN_OUT,
                Dismissal.STUMPED,
                Dismissal.HIT_WICKET,
                Dismissal.RETIRED_HURT
            ];

            dismissalTypes.forEach(dismissalType => {
                const stats = new BattingStats(0, 0, 0, 0, 0, true, dismissalType);
                const json = stats.toJSON();
                const recreatedStats = BattingStats.fromJSON(json);
                expect(recreatedStats.dismissalType).toBe(dismissalType);
            });
        });
    });
}); 