import { BowlingStats } from '../../../models/Player/BowlingStats';

describe('BowlingStats', () => {
    let defaultStats: BowlingStats;

    beforeEach(() => {
        defaultStats = new BowlingStats(
            30,     // runs
            24,     // balls
            1,      // maidens
            2,      // wickets
            1,      // noBalls
            2,      // wides
            3,      // byes
            12      // dotBalls
        );
    });

    describe('constructor', () => {
        it('should create bowling stats with default values', () => {
            const stats = new BowlingStats();
            expect(stats.runs).toBe(0);
            expect(stats.balls).toBe(0);
            expect(stats.maidens).toBe(0);
            expect(stats.wickets).toBe(0);
            expect(stats.noBalls).toBe(0);
            expect(stats.wides).toBe(0);
            expect(stats.byes).toBe(0);
            expect(stats.dotBalls).toBe(0);
        });

        it('should create bowling stats with provided values', () => {
            expect(defaultStats.runs).toBe(30);
            expect(defaultStats.balls).toBe(24);
            expect(defaultStats.maidens).toBe(1);
            expect(defaultStats.wickets).toBe(2);
            expect(defaultStats.noBalls).toBe(1);
            expect(defaultStats.wides).toBe(2);
            expect(defaultStats.byes).toBe(3);
            expect(defaultStats.dotBalls).toBe(12);
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should correctly serialize bowling stats', () => {
            const json = defaultStats.toJSON();
            expect(json).toEqual({
                runs: 30,
                balls: 24,
                maidens: 1,
                wickets: 2,
                noBalls: 1,
                wides: 2,
                byes: 3,
                dotBalls: 12
            });
        });

        it('should correctly deserialize bowling stats', () => {
            const json = defaultStats.toJSON();
            const recreatedStats = BowlingStats.fromJSON(json);

            expect(recreatedStats.runs).toBe(defaultStats.runs);
            expect(recreatedStats.balls).toBe(defaultStats.balls);
            expect(recreatedStats.maidens).toBe(defaultStats.maidens);
            expect(recreatedStats.wickets).toBe(defaultStats.wickets);
            expect(recreatedStats.noBalls).toBe(defaultStats.noBalls);
            expect(recreatedStats.wides).toBe(defaultStats.wides);
            expect(recreatedStats.byes).toBe(defaultStats.byes);
            expect(recreatedStats.dotBalls).toBe(defaultStats.dotBalls);
        });

        it('should handle extreme values', () => {
            const extremeStats = new BowlingStats(
                999,    // runs
                600,    // balls (100 overs)
                10,     // maidens
                10,     // wickets
                20,     // noBalls
                30,     // wides
                15,     // byes
                300     // dotBalls
            );

            const json = extremeStats.toJSON();
            const recreatedStats = BowlingStats.fromJSON(json);

            expect(recreatedStats.runs).toBe(extremeStats.runs);
            expect(recreatedStats.balls).toBe(extremeStats.balls);
            expect(recreatedStats.maidens).toBe(extremeStats.maidens);
            expect(recreatedStats.wickets).toBe(extremeStats.wickets);
            expect(recreatedStats.noBalls).toBe(extremeStats.noBalls);
            expect(recreatedStats.wides).toBe(extremeStats.wides);
            expect(recreatedStats.byes).toBe(extremeStats.byes);
            expect(recreatedStats.dotBalls).toBe(extremeStats.dotBalls);
        });
    });
}); 