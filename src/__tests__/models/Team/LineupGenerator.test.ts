import { LineupGenerator } from '../../../models/Team/LineupGenerator';
import { Player } from '../../../models/Player/Player';
import { BowlingStyle } from '../../../models/Player/BowlingStyle';
import { BattingStyle } from '../../../models/Player/BattingStyle';
import { Hand } from '../../../models/Player/Hand';
import { PlayerRatings } from '../../../models/Player/PlayerRatings';

describe('LineupGenerator', () => {
    let players: Player[];

    beforeEach(() => {
        // Create test players
        const Bowler1 = new Player(1, 'Bowler1', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.FAST_MEDIUM, false, [new PlayerRatings(true)], []);
        const Bowler2 = new Player(2, 'Bowler2', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.OFF_SPIN, false, [new PlayerRatings(true)], []);
        const Bowler3 = new Player(3, 'Bowler3', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.SEAM, false, [new PlayerRatings(true)], []);
        const Bowler4 = new Player(4, 'Bowler4', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.LEG_SPIN, false, [new PlayerRatings(true)], []);
        const Bowler5 = new Player(5, 'Bowler5', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.FINGER_SPIN, false, [new PlayerRatings(true)], []);
        const Batter1 = new Player(6, 'Batter1', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.AGGRESSIVE, BowlingStyle.NONE, false, [new PlayerRatings(false)], []);
        const Batter2 = new Player(7, 'Batter2', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.TECHNICAL, BowlingStyle.NONE, false, [new PlayerRatings(false)], []);
        const Keeper1 = new Player(8, 'Keeper1', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.NONE, true, [new PlayerRatings(false)], []);
        const Keeper2 = new Player(9, 'Keeper2', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.NONE, true, [new PlayerRatings(false)], []);
        const HighRatedBatter = new Player(10, 'HighRatedBatter', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.AGGRESSIVE, BowlingStyle.NONE, false, [new PlayerRatings(false)], []);
        const HighRatedBowler = new Player(11, 'HighRatedBowler', 25, 'IND', '', Hand.RIGHT_HANDED, BattingStyle.DEFENSIVE, BowlingStyle.FAST, false, [new PlayerRatings(true)], []);

        // Set high ratings for specific players
        Object.assign(HighRatedBatter.playerRatings[0], {
            batting: 90,
            bowling: 20,
            calcBattingRating: () => 90,
            calcBowlingRating: () => 20
        });

        Object.assign(HighRatedBowler.playerRatings[0], {
            batting: 20,
            bowling: 90,
            calcBattingRating: () => 20,
            calcBowlingRating: () => 90
        });

        players = [
            Bowler1, Bowler2, Bowler3, Bowler4, Bowler5,
            Batter1, Batter2,
            Keeper1, Keeper2,
            HighRatedBatter, HighRatedBowler
        ];
    });

    describe('generateLineup', () => {
        it('should generate a valid lineup with a wicket keeper and bowlers', () => {
            const lineup = LineupGenerator.generateLineup(players);
            
            // Check batting order
            expect(lineup.battingOrder.length).toBeGreaterThan(0);
            expect(new Set(lineup.battingOrder).size).toBe(lineup.battingOrder.length); // No duplicates
            
            // Check bowling order
            expect(lineup.bowlingOrder.length).toBe(20); // Should be 20 overs
            // Allow duplicates in bowling order since bowlers can bowl multiple overs
        });

        it('should include the wicket keeper in the batting order', () => {
            const lineup = LineupGenerator.generateLineup(players);
            const keeper = players.find(p => p.id === lineup.wicketKeeper);
            expect(keeper?.wicketKeeper).toBe(true);
            expect(lineup.battingOrder).toContain(lineup.wicketKeeper);
        });

        it('should generate a valid bowling order', () => {
            const lineup = LineupGenerator.generateLineup(players);
            
            // Check that only players with bowling styles are in the bowling order
            const bowlerIds = players
                .filter(p => p.bowlingStyle !== BowlingStyle.NONE)
                .map(p => p.id);
            
            lineup.bowlingOrder.forEach(bowlerId => {
                expect(bowlerIds).toContain(bowlerId);
            });
            
            // Check that each bowler bowls at most 4 overs
            const bowlerOvers = new Map<number, number>();
            lineup.bowlingOrder.forEach(bowlerId => {
                bowlerOvers.set(bowlerId, (bowlerOvers.get(bowlerId) || 0) + 1);
            });
            
            Array.from(bowlerOvers.values()).forEach(overs => {
                expect(overs).toBeLessThanOrEqual(4);
            });
        });

        it('should throw an error if there are not enough bowlers', () => {
            const noBowlersPlayers = players.filter(p => p.bowlingStyle === BowlingStyle.NONE);
            expect(() => LineupGenerator.generateLineup(noBowlersPlayers))
                .toThrow('Not enough bowlers to create a valid lineup');
        });

        it('should generate a bowling order with exactly 20 overs', () => {
            const lineup = LineupGenerator.generateLineup(players);
            expect(lineup.bowlingOrder.length).toBe(20);
        });
    });
}); 