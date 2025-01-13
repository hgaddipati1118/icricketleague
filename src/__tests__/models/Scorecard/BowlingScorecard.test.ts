import { BowlingScorecard } from '../../../models/Scorecard/BowlingScorecard';

describe('BowlingScorecard', () => {
    let defaultScorecard: BowlingScorecard;

    beforeEach(() => {
        defaultScorecard = new BowlingScorecard(
            1,              // playerId
            24,             // overs
            1,              // maidens
            30,             // runs
            2,              // wickets
            3,              // wides
            2               // noBalls
        );
    });

    describe('constructor', () => {
        it('should create bowling scorecard with provided values', () => {
            expect(defaultScorecard.playerId).toBe(1);
            expect(defaultScorecard.overs).toBe(24);
            expect(defaultScorecard.maidens).toBe(1);
            expect(defaultScorecard.runs).toBe(30);
            expect(defaultScorecard.wickets).toBe(2);
            expect(defaultScorecard.wides).toBe(3);
            expect(defaultScorecard.noBalls).toBe(2);
        });

        it('should create bowling scorecard with default values', () => {
            const scorecard = new BowlingScorecard(1);
            expect(scorecard.playerId).toBe(1);
            expect(scorecard.overs).toBe(0);
            expect(scorecard.maidens).toBe(0);
            expect(scorecard.runs).toBe(0);
            expect(scorecard.wickets).toBe(0);
            expect(scorecard.wides).toBe(0);
            expect(scorecard.noBalls).toBe(0);
        });

        it('should handle partial overs correctly', () => {
            const scorecard = new BowlingScorecard(1, 4.3); // 4 overs and 3 balls
            expect(scorecard.overs).toBe(4.3);
        });
    });

    describe('toJSON', () => {
        it('should convert scorecard to JSON format', () => {
            const json = defaultScorecard.toJSON();
            expect(json).toEqual({
                playerId: 1,
                overs: 24,
                maidens: 1,
                runs: 30,
                wickets: 2,
                wides: 3,
                noBalls: 2
            });
        });

        it('should handle partial overs in JSON', () => {
            const scorecard = new BowlingScorecard(1, 4.3);
            const json = scorecard.toJSON();
            expect(json).toEqual({
                playerId: 1,
                overs: 4.3,
                maidens: 0,
                runs: 0,
                wickets: 0,
                wides: 0,
                noBalls: 0
            });
        });
    });

    describe('fromJSON', () => {
        it('should create instance from JSON with all fields', () => {
            const json = {
                playerId: 1,
                overs: 24,
                maidens: 1,
                runs: 30,
                wickets: 2,
                wides: 3,
                noBalls: 2
            };
            const scorecard = BowlingScorecard.fromJSON(json);
            expect(scorecard).toEqual(defaultScorecard);
        });

        it('should create instance from JSON with minimal fields', () => {
            const json = {
                playerId: 1,
                overs: 0,
                maidens: 0,
                runs: 0,
                wickets: 0,
                wides: 0,
                noBalls: 0
            };
            const scorecard = BowlingScorecard.fromJSON(json);
            expect(scorecard.playerId).toBe(1);
            expect(scorecard.overs).toBe(0);
            expect(scorecard.maidens).toBe(0);
            expect(scorecard.runs).toBe(0);
            expect(scorecard.wickets).toBe(0);
            expect(scorecard.wides).toBe(0);
            expect(scorecard.noBalls).toBe(0);
        });

        it('should handle partial overs when creating from JSON', () => {
            const json = {
                playerId: 1,
                overs: 4.3,
                maidens: 0,
                runs: 20,
                wickets: 1,
                wides: 2,
                noBalls: 1
            };
            const scorecard = BowlingScorecard.fromJSON(json);
            expect(scorecard.overs).toBe(4.3);
            expect(scorecard.runs).toBe(20);
            expect(scorecard.wickets).toBe(1);
        });
    });
}); 