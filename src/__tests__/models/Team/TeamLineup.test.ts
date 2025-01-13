import { TeamLineup } from '../../../models/Team/TeamLineup';

describe('TeamLineup', () => {
    let defaultLineup: TeamLineup;

    beforeEach(() => {
        defaultLineup = new TeamLineup(
            1,                  // teamId
            [1, 2, 3, 4, 5],   // battingOrder
            [6, 7, 8],         // bowlingOrder
            1                  // wicketKeeper
        );
    });

    describe('constructor', () => {
        it('should create lineup with provided values', () => {
            expect(defaultLineup.teamId).toBe(1);
            expect(defaultLineup.battingOrder).toEqual([1, 2, 3, 4, 5]);
            expect(defaultLineup.bowlingOrder).toEqual([6, 7, 8]);
            expect(defaultLineup.wicketKeeper).toBe(1);
        });

        it('should handle empty orders', () => {
            const emptyLineup = new TeamLineup(1, [], [], 1);
            expect(emptyLineup.teamId).toBe(1);
            expect(emptyLineup.battingOrder).toEqual([]);
            expect(emptyLineup.bowlingOrder).toEqual([]);
            expect(emptyLineup.wicketKeeper).toBe(1);
        });

        it('should ensure wicketKeeper is in batting order', () => {
            const lineup = new TeamLineup(1, [2, 3, 4, 5], [6, 7, 8], 1);
            expect(lineup.battingOrder).toContain(lineup.wicketKeeper);
        });

        it('should handle overlapping batting and bowling orders', () => {
            const lineup = new TeamLineup(
                1,
                [1, 2, 3, 4, 5],   // Player 4 and 5 are both batters and bowlers
                [4, 5, 6],
                1
            );
            expect(lineup.battingOrder).toEqual([1, 2, 3, 4, 5]);
            expect(lineup.bowlingOrder).toEqual([4, 5, 6]);
        });
    });

    describe('toJSON', () => {
        it('should convert lineup to JSON format', () => {
            const json = defaultLineup.toJSON();
            expect(json).toEqual({
                teamId: 1,
                battingOrder: [1, 2, 3, 4, 5],
                bowlingOrder: [6, 7, 8],
                wicketKeeper: 1
            });
        });

        it('should handle empty orders in JSON', () => {
            const emptyLineup = new TeamLineup(1, [], [], 1);
            const json = emptyLineup.toJSON();
            expect(json).toEqual({
                teamId: 1,
                battingOrder: [],
                bowlingOrder: [],
                wicketKeeper: 1
            });
        });
    });

    describe('fromJSON', () => {
        it('should create instance from JSON with all fields', () => {
            const json = {
                teamId: 1,
                battingOrder: [1, 2, 3, 4, 5],
                bowlingOrder: [6, 7, 8],
                wicketKeeper: 1
            };
            const lineup = TeamLineup.fromJSON(json);
            expect(lineup).toEqual(defaultLineup);
        });

        it('should create instance from JSON with empty orders', () => {
            const json = {
                teamId: 1,
                battingOrder: [],
                bowlingOrder: [],
                wicketKeeper: 1
            };
            const lineup = TeamLineup.fromJSON(json);
            expect(lineup.teamId).toBe(1);
            expect(lineup.battingOrder).toEqual([]);
            expect(lineup.bowlingOrder).toEqual([]);
            expect(lineup.wicketKeeper).toBe(1);
        });

        it('should preserve order of players in arrays', () => {
            const json = {
                teamId: 1,
                battingOrder: [5, 4, 3, 2, 1],  // Reverse order
                bowlingOrder: [8, 7, 6],        // Reverse order
                wicketKeeper: 1
            };
            const lineup = TeamLineup.fromJSON(json);
            expect(lineup.battingOrder).toEqual([5, 4, 3, 2, 1]);
            expect(lineup.bowlingOrder).toEqual([8, 7, 6]);
        });
    });
}); 