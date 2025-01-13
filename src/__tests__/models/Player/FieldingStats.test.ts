import { FieldingStats } from '../../../models/Player/FieldingStats';

describe('FieldingStats', () => {
    let defaultStats: FieldingStats;

    beforeEach(() => {
        defaultStats = new FieldingStats(
            2,              // catches
            1,              // runOuts
            1,              // stumpings
            1,              // missedCatches
            1,              // missedStumpings
            0               // missedRunOuts
        );
    });

    describe('constructor', () => {
        it('should create fielding stats with provided values', () => {
            expect(defaultStats.catches).toBe(2);
            expect(defaultStats.runOuts).toBe(1);
            expect(defaultStats.stumpings).toBe(1);
            expect(defaultStats.missedCatches).toBe(1);
            expect(defaultStats.missedStumpings).toBe(1);
            expect(defaultStats.missedRunOuts).toBe(0);
        });

        it('should create fielding stats with default values', () => {
            const stats = new FieldingStats();
            expect(stats.catches).toBe(0);
            expect(stats.runOuts).toBe(0);
            expect(stats.stumpings).toBe(0);
            expect(stats.missedCatches).toBe(0);
            expect(stats.missedStumpings).toBe(0);
            expect(stats.missedRunOuts).toBe(0);
        });

        it('should handle wicketkeeper stats', () => {
            const wicketKeeperStats = new FieldingStats(
                3,              // catches
                0,              // runOuts
                2,              // stumpings
                1,              // missedCatches
                1,              // missedStumpings
                0               // missedRunOuts
            );
            expect(wicketKeeperStats.catches).toBe(3);
            expect(wicketKeeperStats.stumpings).toBe(2);
            expect(wicketKeeperStats.missedStumpings).toBe(1);
        });

        it('should handle outfield stats', () => {
            const outfieldStats = new FieldingStats(
                2,              // catches
                2,              // runOuts
                0,              // stumpings
                1,              // missedCatches
                0,              // missedStumpings
                1               // missedRunOuts
            );
            expect(outfieldStats.catches).toBe(2);
            expect(outfieldStats.runOuts).toBe(2);
            expect(outfieldStats.missedRunOuts).toBe(1);
        });
    });

    describe('toJSON', () => {
        it('should convert stats to JSON format', () => {
            const json = defaultStats.toJSON();
            expect(json).toEqual({
                catches: 2,
                runOuts: 1,
                stumpings: 1,
                missedCatches: 1,
                missedStumpings: 1,
                missedRunOuts: 0
            });
        });

        it('should handle zero values in JSON', () => {
            const stats = new FieldingStats();
            const json = stats.toJSON();
            expect(json).toEqual({
                catches: 0,
                runOuts: 0,
                stumpings: 0,
                missedCatches: 0,
                missedStumpings: 0,
                missedRunOuts: 0
            });
        });
    });

    describe('fromJSON', () => {
        it('should create instance from JSON with all fields', () => {
            const json = {
                catches: 2,
                runOuts: 1,
                stumpings: 1,
                missedCatches: 1,
                missedStumpings: 1,
                missedRunOuts: 0
            };
            const stats = FieldingStats.fromJSON(json);
            expect(stats).toEqual(defaultStats);
        });

        it('should create instance from JSON with zero values', () => {
            const json = {
                catches: 0,
                runOuts: 0,
                stumpings: 0,
                missedCatches: 0,
                missedStumpings: 0,
                missedRunOuts: 0
            };
            const stats = FieldingStats.fromJSON(json);
            expect(stats.catches).toBe(0);
            expect(stats.runOuts).toBe(0);
            expect(stats.stumpings).toBe(0);
            expect(stats.missedCatches).toBe(0);
            expect(stats.missedStumpings).toBe(0);
            expect(stats.missedRunOuts).toBe(0);
        });

        it('should handle high performance stats', () => {
            const json = {
                catches: 10,
                runOuts: 5,
                stumpings: 3,
                missedCatches: 0,
                missedStumpings: 0,
                missedRunOuts: 0
            };
            const stats = FieldingStats.fromJSON(json);
            expect(stats.catches).toBe(10);
            expect(stats.runOuts).toBe(5);
            expect(stats.stumpings).toBe(3);
            expect(stats.missedCatches).toBe(0);
            expect(stats.missedStumpings).toBe(0);
            expect(stats.missedRunOuts).toBe(0);
        });
    });
}); 