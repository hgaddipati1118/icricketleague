import { BattingScorecard } from '../../../models/Scorecard/BattingScorecard';
import { Dismissal } from '../../../models/Player/Dismissal';

describe('BattingScorecard', () => {
    let defaultScorecard: BattingScorecard;

    beforeEach(() => {
        defaultScorecard = new BattingScorecard(
            1,              // playerId
            50,             // runs
            30,             // balls
            5,              // fours
            2,              // sixes
            Dismissal.CAUGHT, // howOut
            2,              // bowler
            3               // fielder
        );
    });

    describe('constructor', () => {
        it('should create batting scorecard with provided values', () => {
            expect(defaultScorecard.playerId).toBe(1);
            expect(defaultScorecard.runs).toBe(50);
            expect(defaultScorecard.balls).toBe(30);
            expect(defaultScorecard.fours).toBe(5);
            expect(defaultScorecard.sixes).toBe(2);
            expect(defaultScorecard.howOut).toBe(Dismissal.CAUGHT);
            expect(defaultScorecard.bowler).toBe(2);
            expect(defaultScorecard.fielder).toBe(3);
        });

        it('should create batting scorecard with default values', () => {
            const scorecard = new BattingScorecard(1);
            expect(scorecard.playerId).toBe(1);
            expect(scorecard.runs).toBe(0);
            expect(scorecard.balls).toBe(0);
            expect(scorecard.fours).toBe(0);
            expect(scorecard.sixes).toBe(0);
            expect(scorecard.howOut).toBeNull();
            expect(scorecard.bowler).toBeNull();
            expect(scorecard.fielder).toBeNull();
        });

        it('should handle different dismissal types correctly', () => {
            // Test bowled - only needs bowler
            const bowledScorecard = new BattingScorecard(1, 10, 15, 1, 0, Dismissal.BOWLED, 2);
            expect(bowledScorecard.howOut).toBe(Dismissal.BOWLED);
            expect(bowledScorecard.bowler).toBe(2);
            expect(bowledScorecard.fielder).toBeNull();

            // Test run out - only needs fielder
            const runOutScorecard = new BattingScorecard(1, 20, 25, 2, 1, Dismissal.RUN_OUT, null, 3);
            expect(runOutScorecard.howOut).toBe(Dismissal.RUN_OUT);
            expect(runOutScorecard.bowler).toBeNull();
            expect(runOutScorecard.fielder).toBe(3);

            // Test stumped - needs both bowler and fielder
            const stumpedScorecard = new BattingScorecard(1, 30, 35, 3, 1, Dismissal.STUMPED, 2, 3);
            expect(stumpedScorecard.howOut).toBe(Dismissal.STUMPED);
            expect(stumpedScorecard.bowler).toBe(2);
            expect(stumpedScorecard.fielder).toBe(3);
        });
    });

    describe('toJSON', () => {
        it('should convert scorecard to JSON format', () => {
            const json = defaultScorecard.toJSON();
            expect(json).toEqual({
                playerId: 1,
                runs: 50,
                balls: 30,
                fours: 5,
                sixes: 2,
                howOut: Dismissal.CAUGHT,
                bowler: 2,
                fielder: 3
            });
        });

        it('should handle null values in JSON', () => {
            const scorecard = new BattingScorecard(1);
            const json = scorecard.toJSON();
            expect(json).toEqual({
                playerId: 1,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                howOut: null,
                bowler: null,
                fielder: null
            });
        });
    });

    describe('fromJSON', () => {
        it('should create instance from JSON with all fields', () => {
            const json = {
                playerId: 1,
                runs: 50,
                balls: 30,
                fours: 5,
                sixes: 2,
                howOut: Dismissal.CAUGHT,
                bowler: 2,
                fielder: 3
            };
            const scorecard = BattingScorecard.fromJSON(json);
            expect(scorecard).toEqual(defaultScorecard);
        });

        it('should create instance from JSON with minimal fields', () => {
            const json = {
                playerId: 1,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                howOut: null,
                bowler: null,
                fielder: null
            };
            const scorecard = BattingScorecard.fromJSON(json);
            expect(scorecard.playerId).toBe(1);
            expect(scorecard.runs).toBe(0);
            expect(scorecard.balls).toBe(0);
            expect(scorecard.fours).toBe(0);
            expect(scorecard.sixes).toBe(0);
            expect(scorecard.howOut).toBeNull();
            expect(scorecard.bowler).toBeNull();
            expect(scorecard.fielder).toBeNull();
        });
    });
}); 