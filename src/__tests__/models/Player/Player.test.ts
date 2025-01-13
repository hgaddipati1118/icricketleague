import { Player } from '../../../models/Player/Player';
import { Hand } from '../../../models/Player/Hand';
import { BattingStyle } from '../../../models/Player/BattingStyle';
import { BowlingStyle } from '../../../models/Player/BowlingStyle';
import { PlayerRatings } from '../../../models/Player/PlayerRatings';

describe('Player', () => {
    let defaultPlayer: Player;

    beforeEach(() => {
        defaultPlayer = new Player(
            1,
            'Test Player',
            25,
            'India',
            'Test Team',
            Hand.RIGHT_HANDED,
            BattingStyle.AGGRESSIVE,
            BowlingStyle.FAST,
            false,
            [new PlayerRatings(true, 0)],
            []
        );
    });

    describe('constructor', () => {
        it('should create a player with default values', () => {
            const player = new Player();
            expect(player.id).toBe(0);
            expect(player.name).toBe('');
            expect(player.age).toBe(14);
            expect(player.country).toBe('');
            expect(player.team).toBe('');
            expect(player.hand).toBe(Hand.RIGHT_HANDED);
            expect(player.battingStyle).toBe(BattingStyle.STRIKE_ROTATOR);
            expect(player.bowlingStyle).toBe(BowlingStyle.NONE);
            expect(player.wicketKeeper).toBe(false);
            expect(player.playerRatings).toEqual([]);
            expect(player.playerStats).toEqual([]);
        });

        it('should create a player with provided values', () => {
            expect(defaultPlayer.id).toBe(1);
            expect(defaultPlayer.name).toBe('Test Player');
            expect(defaultPlayer.age).toBe(25);
            expect(defaultPlayer.country).toBe('India');
            expect(defaultPlayer.team).toBe('Test Team');
            expect(defaultPlayer.hand).toBe(Hand.RIGHT_HANDED);
            expect(defaultPlayer.battingStyle).toBe(BattingStyle.AGGRESSIVE);
            expect(defaultPlayer.bowlingStyle).toBe(BowlingStyle.FAST);
            expect(defaultPlayer.wicketKeeper).toBe(false);
            expect(defaultPlayer.playerRatings.length).toBe(1);
            expect(defaultPlayer.playerStats).toEqual([]);
        });

        it('should cap age between 14 and 50', () => {
            const youngPlayer = new Player(1, '', 10, '', '');
            expect(youngPlayer.age).toBe(14);

            const oldPlayer = new Player(1, '', 55, '', '');
            expect(oldPlayer.age).toBe(50);

            const normalPlayer = new Player(1, '', 25, '', '');
            expect(normalPlayer.age).toBe(25);
        });
    });

    describe('getPlayerRole', () => {
        it('should return Batter when no ratings exist', () => {
            const player = new Player(1, '', 25, '', '');
            expect(player.getPlayerRole()).toBe('Batter');
        });

        it('should return All-Rounder when batting and bowling ratings are similar', () => {
            const ratings = new PlayerRatings(true, 0);
            // Set similar batting and bowling ratings
            Object.assign(ratings, {
                batting: 80,
                bowling: 75,
                calcBattingRating: () => 80,
                calcBowlingRating: () => 75
            });
            
            const player = new Player(
                1, '', 25, '', '', Hand.RIGHT_HANDED,
                BattingStyle.AGGRESSIVE, BowlingStyle.FAST,
                false, [ratings], []
            );
            
            expect(player.getPlayerRole()).toBe('All-Rounder');
        });

        it('should return Batter when batting rating is significantly higher', () => {
            const ratings = new PlayerRatings(true, 0);
            Object.assign(ratings, {
                batting: 90,
                bowling: 60,
                calcBattingRating: () => 90,
                calcBowlingRating: () => 60
            });
            
            const player = new Player(
                1, '', 25, '', '', Hand.RIGHT_HANDED,
                BattingStyle.AGGRESSIVE, BowlingStyle.FAST,
                false, [ratings], []
            );
            
            expect(player.getPlayerRole()).toBe('Batter');
        });

        it('should return Bowler when bowling rating is significantly higher', () => {
            const ratings = new PlayerRatings(true, 0);
            Object.assign(ratings, {
                batting: 60,
                bowling: 90,
                calcBattingRating: () => 60,
                calcBowlingRating: () => 90
            });
            
            const player = new Player(
                1, '', 25, '', '', Hand.RIGHT_HANDED,
                BattingStyle.AGGRESSIVE, BowlingStyle.FAST,
                false, [ratings], []
            );
            
            expect(player.getPlayerRole()).toBe('Bowler');
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should correctly serialize and deserialize a player', () => {
            const json = defaultPlayer.toJSON();
            const recreatedPlayer = Player.fromJSON(json);

            expect(recreatedPlayer.id).toBe(defaultPlayer.id);
            expect(recreatedPlayer.name).toBe(defaultPlayer.name);
            expect(recreatedPlayer.age).toBe(defaultPlayer.age);
            expect(recreatedPlayer.country).toBe(defaultPlayer.country);
            expect(recreatedPlayer.team).toBe(defaultPlayer.team);
            expect(recreatedPlayer.hand).toBe(defaultPlayer.hand);
            expect(recreatedPlayer.battingStyle).toBe(defaultPlayer.battingStyle);
            expect(recreatedPlayer.bowlingStyle).toBe(defaultPlayer.bowlingStyle);
            expect(recreatedPlayer.wicketKeeper).toBe(defaultPlayer.wicketKeeper);
            expect(recreatedPlayer.playerRatings.length).toBe(defaultPlayer.playerRatings.length);
            expect(recreatedPlayer.playerStats).toEqual(defaultPlayer.playerStats);
        });
    });
}); 