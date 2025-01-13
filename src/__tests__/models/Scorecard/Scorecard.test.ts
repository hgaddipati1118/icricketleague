import { Scorecard } from '../../../models/Scorecard/Scorecard';
import { BattingScorecard } from '../../../models/Scorecard/BattingScorecard';
import { BowlingScorecard } from '../../../models/Scorecard/BowlingScorecard';
import { Dismissal } from '../../../models/Player/Dismissal';

describe('Scorecard', () => {
    let defaultScorecard: Scorecard;
    let homeBatting: BattingScorecard[];
    let homeBowling: BowlingScorecard[];
    let awayBatting: BattingScorecard[];
    let awayBowling: BowlingScorecard[];

    beforeEach(() => {
        // Create batting scorecards for home team
        homeBatting = [
            new BattingScorecard(1, 50, 40, 5, 2, Dismissal.CAUGHT, 7, 8),
            new BattingScorecard(2, 30, 25, 3, 1, Dismissal.BOWLED, 6),
            new BattingScorecard(3, 20, 15, 2, 1, Dismissal.CAUGHT, 6, 9)
        ];

        // Create bowling scorecards for home team
        homeBowling = [
            new BowlingScorecard(6, 4, 1, 25, 2, 1, 0),
            new BowlingScorecard(7, 4, 0, 30, 1, 2, 1)
        ];

        // Create batting scorecards for away team
        awayBatting = [
            new BattingScorecard(6, 40, 35, 4, 1, Dismissal.CAUGHT, 2, 3),
            new BattingScorecard(7, 25, 20, 2, 1, Dismissal.BOWLED, 1),
            new BattingScorecard(8, 15, 10, 1, 0, Dismissal.LBW, 1)
        ];

        // Create bowling scorecards for away team
        awayBowling = [
            new BowlingScorecard(1, 4, 0, 35, 2, 1, 1),
            new BowlingScorecard(2, 4, 1, 20, 1, 0, 0)
        ];

        defaultScorecard = new Scorecard(
            1,              // gameId
            homeBatting,    // homeTeamBatting
            homeBowling,    // homeTeamBowling
            awayBatting,    // awayTeamBatting
            awayBowling,    // awayTeamBowling
            1               // winner
        );
    });

    describe('constructor', () => {
        it('should create scorecard with default values', () => {
            const scorecard = new Scorecard(1);
            expect(scorecard.gameId).toBe(1);
            expect(scorecard.homeTeamBatting).toEqual([]);
            expect(scorecard.homeTeamBowling).toEqual([]);
            expect(scorecard.awayTeamBatting).toEqual([]);
            expect(scorecard.awayTeamBowling).toEqual([]);
            expect(scorecard.winner).toBeNull();
        });

        it('should create scorecard with provided values', () => {
            expect(defaultScorecard.gameId).toBe(1);
            expect(defaultScorecard.homeTeamBatting).toEqual(homeBatting);
            expect(defaultScorecard.homeTeamBowling).toEqual(homeBowling);
            expect(defaultScorecard.awayTeamBatting).toEqual(awayBatting);
            expect(defaultScorecard.awayTeamBowling).toEqual(awayBowling);
            expect(defaultScorecard.winner).toBe(1);
        });
    });

    describe('toJSON', () => {
        it('should convert scorecard to JSON format', () => {
            const json = defaultScorecard.toJSON();
            expect(json).toEqual({
                gameId: 1,
                homeTeamBatting: homeBatting.map(batting => batting.toJSON()),
                homeTeamBowling: homeBowling.map(bowling => bowling.toJSON()),
                awayTeamBatting: awayBatting.map(batting => batting.toJSON()),
                awayTeamBowling: awayBowling.map(bowling => bowling.toJSON()),
                winner: 1
            });
        });

        it('should handle empty arrays in JSON', () => {
            const emptyScorecard = new Scorecard(1);
            const json = emptyScorecard.toJSON();
            expect(json).toEqual({
                gameId: 1,
                homeTeamBatting: [],
                homeTeamBowling: [],
                awayTeamBatting: [],
                awayTeamBowling: [],
                winner: null
            });
        });
    });

    describe('fromJSON', () => {
        it('should create instance from JSON with all fields', () => {
            const json = defaultScorecard.toJSON();
            const recreatedScorecard = Scorecard.fromJSON(json);
            expect(recreatedScorecard).toEqual(defaultScorecard);
        });

        it('should create instance from JSON with minimal fields', () => {
            const json = {
                gameId: 1,
                homeTeamBatting: [],
                homeTeamBowling: [],
                awayTeamBatting: [],
                awayTeamBowling: [],
                winner: null
            };
            const scorecard = Scorecard.fromJSON(json);
            expect(scorecard.gameId).toBe(1);
            expect(scorecard.homeTeamBatting).toEqual([]);
            expect(scorecard.homeTeamBowling).toEqual([]);
            expect(scorecard.awayTeamBatting).toEqual([]);
            expect(scorecard.awayTeamBowling).toEqual([]);
            expect(scorecard.winner).toBeNull();
        });
    });
}); 