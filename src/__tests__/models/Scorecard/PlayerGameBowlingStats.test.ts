import { PlayerGameBowlingStats } from '../../../models/Scorecard/PlayerGameBowlingStats';

describe('PlayerGameBowlingStats', () => {
    let defaultStats: PlayerGameBowlingStats;

    beforeEach(() => {
        defaultStats = new PlayerGameBowlingStats(
            1,              // id
            24,             // balls
            30,             // runs
            2,              // wickets
            1,              // maidens
            2,              // noBalls
            3,              // wides
            4,              // byes
            10              // dotBalls
        );
    });

    describe('constructor', () => {
        it('should create bowling stats with provided values', () => {
            expect(defaultStats.id).toBe(1);
            expect(defaultStats.balls).toBe(24);
            expect(defaultStats.runs).toBe(30);
            expect(defaultStats.wickets).toBe(2);
            expect(defaultStats.maidens).toBe(1);
            expect(defaultStats.noBalls).toBe(2);
            expect(defaultStats.wides).toBe(3);
            expect(defaultStats.byes).toBe(4);
            expect(defaultStats.dotBalls).toBe(10);
        });

        it('should handle good bowling figures', () => {
            const goodStats = new PlayerGameBowlingStats(
                2,              // id
                24,             // balls (4 overs)
                12,             // runs
                3,              // wickets
                2,              // maidens
                0,              // noBalls
                0,              // wides
                0,              // byes
                18              // dotBalls
            );
            expect(goodStats.runs).toBe(12);
            expect(goodStats.wickets).toBe(3);
            expect(goodStats.maidens).toBe(2);
            expect(goodStats.dotBalls).toBe(18);
        });

        it('should handle poor bowling figures', () => {
            const poorStats = new PlayerGameBowlingStats(
                3,              // id
                24,             // balls
                48,             // runs
                0,              // wickets
                0,              // maidens
                4,              // noBalls
                6,              // wides
                2,              // byes
                4               // dotBalls
            );
            expect(poorStats.runs).toBe(48);
            expect(poorStats.wickets).toBe(0);
            expect(poorStats.maidens).toBe(0);
            expect(poorStats.noBalls).toBe(4);
            expect(poorStats.wides).toBe(6);
            expect(poorStats.dotBalls).toBe(4);
        });

        it('should handle incomplete over', () => {
            const incompleteStats = new PlayerGameBowlingStats(
                4,              // id
                4,              // balls
                8,              // runs
                1,              // wickets
                0,              // maidens
                0,              // noBalls
                0,              // wides
                0,              // byes
                2               // dotBalls
            );
            expect(incompleteStats.balls).toBe(4);
            expect(incompleteStats.runs).toBe(8);
            expect(incompleteStats.wickets).toBe(1);
            expect(incompleteStats.dotBalls).toBe(2);
        });
    });

    describe('toJSON', () => {
        it('should convert bowling stats to JSON format', () => {
            const json = defaultStats.toJSON();
            expect(json).toEqual({
                id: 1,
                balls: 24,
                runs: 30,
                wickets: 2,
                maidens: 1,
                noBalls: 2,
                wides: 3,
                byes: 4,
                dotBalls: 10
            });
        });
    });

    describe('fromJSON', () => {
        it('should create instance from JSON with all fields', () => {
            const json = {
                id: 1,
                balls: 24,
                runs: 30,
                wickets: 2,
                maidens: 1,
                noBalls: 2,
                wides: 3,
                byes: 4,
                dotBalls: 10
            };
            const stats = PlayerGameBowlingStats.fromJSON(json);
            expect(stats).toEqual(defaultStats);
        });

        it('should create instance from JSON with zero values', () => {
            const json = {
                id: 5,
                balls: 0,
                runs: 0,
                wickets: 0,
                maidens: 0,
                noBalls: 0,
                wides: 0,
                byes: 0,
                dotBalls: 0
            };
            const stats = PlayerGameBowlingStats.fromJSON(json);
            expect(stats.id).toBe(5);
            expect(stats.balls).toBe(0);
            expect(stats.runs).toBe(0);
            expect(stats.wickets).toBe(0);
            expect(stats.maidens).toBe(0);
            expect(stats.noBalls).toBe(0);
            expect(stats.wides).toBe(0);
            expect(stats.byes).toBe(0);
            expect(stats.dotBalls).toBe(0);
        });
    });
}); 