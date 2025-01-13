import { PlayerGameBattingStats } from '../../../models/Scorecard/PlayerGameBattingStats';
import { Dismissal } from '../../../models/Player/Dismissal';

describe('PlayerGameBattingStats', () => {
    let defaultStats: PlayerGameBattingStats;

    beforeEach(() => {
        defaultStats = new PlayerGameBattingStats(
            1,                  // id
            3,                  // position
            45,                 // runs
            30,                 // balls
            5,                  // fours
            2,                  // sixes
            true,               // out
            true,               // batted
            Dismissal.CAUGHT,   // dismissalType
            7,                  // dismissalPlayer1 (bowler)
            8,                  // dismissalPlayer2 (fielder)
            18                  // dissmalBall
        );
    });

    describe('constructor', () => {
        it('should create batting stats with provided values', () => {
            expect(defaultStats.id).toBe(1);
            expect(defaultStats.position).toBe(3);
            expect(defaultStats.runs).toBe(45);
            expect(defaultStats.balls).toBe(30);
            expect(defaultStats.fours).toBe(5);
            expect(defaultStats.sixes).toBe(2);
            expect(defaultStats.out).toBe(true);
            expect(defaultStats.batted).toBe(true);
            expect(defaultStats.dismissalType).toBe(Dismissal.CAUGHT);
            expect(defaultStats.dismissalPlayer1).toBe(7);
            expect(defaultStats.dismissalPlayer2).toBe(8);
            expect(defaultStats.dissmalBall).toBe(18);
        });

        it('should handle different dismissal scenarios', () => {
            // Bowled - only needs dismissalPlayer1 (bowler)
            const bowledStats = new PlayerGameBattingStats(
                2, 4, 20, 15, 2, 1, true, true,
                Dismissal.BOWLED, 7
            );
            expect(bowledStats.dismissalType).toBe(Dismissal.BOWLED);
            expect(bowledStats.dismissalPlayer1).toBe(7);
            expect(bowledStats.dismissalPlayer2).toBeUndefined();

            // Run out - only needs dismissalPlayer1 (fielder)
            const runOutStats = new PlayerGameBattingStats(
                3, 5, 30, 25, 3, 1, true, true,
                Dismissal.RUN_OUT, 8
            );
            expect(runOutStats.dismissalType).toBe(Dismissal.RUN_OUT);
            expect(runOutStats.dismissalPlayer1).toBe(8);
            expect(runOutStats.dismissalPlayer2).toBeUndefined();

            // LBW - only needs dismissalPlayer1 (bowler)
            const lbwStats = new PlayerGameBattingStats(
                4, 6, 15, 20, 1, 0, true, true,
                Dismissal.LBW, 7
            );
            expect(lbwStats.dismissalType).toBe(Dismissal.LBW);
            expect(lbwStats.dismissalPlayer1).toBe(7);
            expect(lbwStats.dismissalPlayer2).toBeUndefined();

            // Stumped - needs both dismissalPlayer1 (bowler) and dismissalPlayer2 (keeper)
            const stumpedStats = new PlayerGameBattingStats(
                5, 7, 25, 30, 2, 1, true, true,
                Dismissal.STUMPED, 7, 8
            );
            expect(stumpedStats.dismissalType).toBe(Dismissal.STUMPED);
            expect(stumpedStats.dismissalPlayer1).toBe(7);
            expect(stumpedStats.dismissalPlayer2).toBe(8);
        });

        it('should handle not out batsman', () => {
            const notOutStats = new PlayerGameBattingStats(
                6, 1, 50, 40, 6, 2, false, true,
                Dismissal.RETIRED_HURT
            );
            expect(notOutStats.out).toBe(false);
            expect(notOutStats.batted).toBe(true);
            expect(notOutStats.dismissalType).toBe(Dismissal.RETIRED_HURT);
            expect(notOutStats.dismissalPlayer1).toBeUndefined();
            expect(notOutStats.dismissalPlayer2).toBeUndefined();
            expect(notOutStats.dissmalBall).toBeUndefined();
        });

        it('should handle did not bat scenario', () => {
            const didNotBatStats = new PlayerGameBattingStats(
                7, 11, 0, 0, 0, 0, false, false,
                Dismissal.RETIRED_HURT
            );
            expect(didNotBatStats.batted).toBe(false);
            expect(didNotBatStats.runs).toBe(0);
            expect(didNotBatStats.balls).toBe(0);
            expect(didNotBatStats.fours).toBe(0);
            expect(didNotBatStats.sixes).toBe(0);
            expect(didNotBatStats.out).toBe(false);
        });
    });

    describe('toJSON', () => {
        it('should convert batting stats to JSON format', () => {
            const json = defaultStats.toJSON();
            expect(json).toEqual({
                id: 1,
                position: 3,
                runs: 45,
                balls: 30,
                fours: 5,
                sixes: 2,
                out: true,
                batted: true,
                dismissalType: Dismissal.CAUGHT,
                dismissalPlayer1: 7,
                dismissalPlayer2: 8,
                dissmalBall: 18
            });
        });

        it('should handle undefined optional fields in JSON', () => {
            const minimalStats = new PlayerGameBattingStats(
                8, 2, 0, 0, 0, 0, false, false,
                Dismissal.RETIRED_HURT
            );
            const json = minimalStats.toJSON();
            expect(json).toEqual({
                id: 8,
                position: 2,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                out: false,
                batted: false,
                dismissalType: Dismissal.RETIRED_HURT,
                dismissalPlayer1: undefined,
                dismissalPlayer2: undefined,
                dissmalBall: undefined
            });
        });
    });
}); 