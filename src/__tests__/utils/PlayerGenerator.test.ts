import { generateRandomPlayer, generateDraftPool } from '../../../src/utils/PlayerGenerator';
import { League } from '../../../src/models/League/League';
import { BowlingStyle } from '../../../src/models/Player/BowlingStyle';
import { Hand } from '../../../src/models/Player/Hand';
import { Player } from '../../../src/models/Player/Player';

describe('PlayerGenerator', () => {
    describe('generateRandomPlayer', () => {
        it('should generate a player with valid properties', () => {
            const player = generateRandomPlayer(1);
            
            expect(player.id).toBe(1);
            expect(player.name).toBeTruthy();
            expect(player.age).toBeGreaterThanOrEqual(20);
            expect(player.age).toBeLessThanOrEqual(40);
            expect(player.country).toBeTruthy();
            expect(player.hand).toBeDefined();
            expect(player.battingStyle).toBeDefined();
            expect(player.bowlingStyle).toBeDefined();
            expect(player.wicketKeeper).toBeDefined();
            expect(player.playerRatings.length).toBe(1);
            expect(player.playerStats).toEqual([]);
        });

        it('should generate a wicket keeper when forced', () => {
            const player = generateRandomPlayer(1, true);
            
            expect(player.wicketKeeper).toBe(true);
            expect(player.bowlingStyle).toBe(BowlingStyle.NONE);
        });

        it('should generate players with valid country names', () => {
            const validCountries = [
                'India', 'Australia', 'England', 'New Zealand',
                'Pakistan', 'South Africa', 'West Indies'
            ];

            const player = generateRandomPlayer(1);
            expect(validCountries).toContain(player.country);
        });

        it('should generate players with valid handedness', () => {
            const player = generateRandomPlayer(1);
            expect([Hand.LEFT_HANDED, Hand.RIGHT_HANDED]).toContain(player.hand);
        });

        it('should generate non-bowling wicket keepers when forced', () => {
            // Generate multiple players to ensure consistency
            for (let i = 0; i < 10; i++) {
                const player = generateRandomPlayer(i, true);
                expect(player.wicketKeeper).toBe(true);
                expect(player.bowlingStyle).toBe(BowlingStyle.NONE);
            }
        });
    });

    describe('generateDraftPool', () => {
        let mockLeague: League;

        beforeEach(() => {
            mockLeague = {
                teams: [
                    { id: 0 }, // Free agents team
                    { id: 1 },
                    { id: 2 },
                    { id: 3 }
                ],
                type: {
                    MAX_PLAYERS_PER_TEAM: 15
                }
            } as League;
        });

        it('should generate correct number of players', () => {
            const players = generateDraftPool(mockLeague);
            const teamsCount = mockLeague.teams.length - 1; // Exclude free agents
            const expectedMinPlayers = teamsCount * mockLeague.type.MAX_PLAYERS_PER_TEAM * 5;
            
            expect(players.length).toBe(expectedMinPlayers);
        });

        it('should generate enough wicket keepers', () => {
            const players = generateDraftPool(mockLeague);
            const wicketKeepers = players.filter((p: Player) => p.wicketKeeper);
            const teamsCount = mockLeague.teams.length - 1;
            
            // Should have at least 2 keepers per team
            expect(wicketKeepers.length).toBeGreaterThanOrEqual(teamsCount * 2);
        });

        it('should generate players with unique IDs', () => {
            const players = generateDraftPool(mockLeague);
            const ids = new Set(players.map((p: Player) => p.id));
            
            expect(ids.size).toBe(players.length);
        });

        it('should generate non-bowling wicket keepers', () => {
            const players = generateDraftPool(mockLeague);
            const wicketKeepers = players.filter((p: Player) => p.wicketKeeper);
            
            wicketKeepers.forEach((keeper: Player) => {
                expect(keeper.bowlingStyle).toBe(BowlingStyle.NONE);
            });
        });
    });
}); 