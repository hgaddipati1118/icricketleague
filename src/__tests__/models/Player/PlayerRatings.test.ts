import { PlayerRatings } from '../../../models/Player/PlayerRatings';

describe('PlayerRatings', () => {
    let defaultRatings: PlayerRatings;

    beforeEach(() => {
        defaultRatings = new PlayerRatings(
            true,           // isBowler
            1,              // season_id
            70,             // fielding
            80,             // power
            75,             // technical
            70,             // defensive
            65,             // temperament
            85,             // economy
            80,             // control
            75,             // wicketTaking
            70,             // clutch
            80,             // fitness
            60,             // leadership
            70              // consistency
        );
    });

    describe('constructor', () => {
        it('should create ratings with provided values for bowler', () => {
            expect(defaultRatings.season_id).toBe(1);
            expect(defaultRatings.fielding).toBe(70);
            expect(defaultRatings.power).toBe(80);
            expect(defaultRatings.technical).toBe(75);
            expect(defaultRatings.defensive).toBe(70);
            expect(defaultRatings.temperament).toBe(65);
            expect(defaultRatings.economy).toBe(85);
            expect(defaultRatings.control).toBe(80);
            expect(defaultRatings.wicketTaking).toBe(75);
            expect(defaultRatings.clutch).toBe(70);
            expect(defaultRatings.fitness).toBe(80);
            expect(defaultRatings.leadership).toBe(60);
            expect(defaultRatings.consistency).toBe(70);
        });

        it('should create ratings with provided values for non-bowler', () => {
            const nonBowlerRatings = new PlayerRatings(
                false,          // isBowler
                1,              // season_id
                70,             // fielding
                80,             // power
                75,             // technical
                70,             // defensive
                65,             // temperament
                85,             // economy (should be set to 0)
                80,             // control (should be set to 0)
                75,             // wicketTaking (should be set to 0)
                70,             // clutch
                80,             // fitness
                60,             // leadership
                70              // consistency
            );

            expect(nonBowlerRatings.economy).toBe(0);
            expect(nonBowlerRatings.control).toBe(0);
            expect(nonBowlerRatings.wicketTaking).toBe(0);
        });

        it('should clamp ratings between 0 and 100', () => {
            const extremeRatings = new PlayerRatings(
                true,
                1,
                -10,            // should be 0
                150,            // should be 100
                75,
                70,
                65,
                85,
                80,
                75,
                70,
                80,
                60,
                70
            );

            expect(extremeRatings.fielding).toBe(0);
            expect(extremeRatings.power).toBe(100);
        });
    });

    describe('rating calculations', () => {
        it('should calculate batting rating correctly', () => {
            const expectedBatting = Math.round(
                0.35 * 80 +  // power
                0.25 * 75 +  // technical
                0.1 * 70 +   // defensive
                0.1 * 65 +   // temperament
                0.05 * 80    // fitness
            );
            expect(defaultRatings.calcBattingRating()).toBe(expectedBatting);
            expect(defaultRatings.batting).toBe(expectedBatting);
        });

        it('should calculate bowling rating correctly', () => {
            const expectedBowling = Math.round(
                0.35 * 85 +  // economy
                0.2 * 80 +   // control
                0.3 * 75 +   // wicketTaking
                0.1 * 70 +   // clutch
                0.05 * 80    // fitness
            );
            expect(defaultRatings.calcBowlingRating()).toBe(expectedBowling);
            expect(defaultRatings.bowling).toBe(expectedBowling);
        });

        it('should calculate fielding rating correctly', () => {
            const expectedFielding = Math.round(
                0.4 * 70 +   // fielding
                0.2 * 80 +   // fitness
                0.2 * 70 +   // clutch
                0.2 * 70     // consistency
            );
            expect(defaultRatings.calcFieldingRating()).toBe(expectedFielding);
            expect(defaultRatings.fieldingOverall).toBe(expectedFielding);
        });

        it('should calculate overall rating correctly', () => {
            // First calculate component ratings
            const battingRating = defaultRatings.calcBattingRating();
            const bowlingRating = defaultRatings.calcBowlingRating();
            const fieldingRating = defaultRatings.calcFieldingRating();

            // Then calculate overall based on the formula
            let expectedOverall;
            if (battingRating > bowlingRating) {
                expectedOverall = battingRating + (100 - battingRating) * Math.pow((bowlingRating / 100), 4);
            } else {
                expectedOverall = bowlingRating + (100 - bowlingRating) * Math.pow((battingRating / 100), 4);
            }
            expectedOverall = expectedOverall + 0.2 * (100 - expectedOverall) * Math.pow((fieldingRating / 100), 4);

            expect(defaultRatings.calcOverallRating()).toBe(Math.round(expectedOverall));
            expect(defaultRatings.overall).toBe(Math.round(expectedOverall));
        });
    });

    describe('toJSON', () => {
        it('should convert ratings to JSON format', () => {
            const json = defaultRatings.toJSON();
            expect(json).toEqual({
                season_id: 1,
                fielding: 70,
                power: 80,
                technical: 75,
                defensive: 70,
                temperament: 65,
                economy: 85,
                control: 80,
                wicketTaking: 75,
                clutch: 70,
                fitness: 80,
                leadership: 60,
                consistency: 70
            });
        });
    });
}); 