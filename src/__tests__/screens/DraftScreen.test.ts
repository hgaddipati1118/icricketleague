import { DraftScreen } from '../../screens/DraftScreen';
import { League } from '../../models/League/League';
import { Team } from '../../models/Team/Team';
import { Player } from '../../models/Player/Player';
import { Hand } from '../../models/Player/Hand';
import { BowlingStyle } from '../../models/Player/BowlingStyle';
import { PlayoffType } from '../../models/League/PlayoffType';
import { AuctionType } from '../../models/League/AuctionType';
import { LeagueType } from '../../models/League/LeagueType';

describe('DraftScreen', () => {
    let league: League;
    let draftScreen: DraftScreen;
    const userTeamId = 1;  // Team 1 will be the user's team

    beforeEach(() => {
        // Create league with minimal required setup
        const leagueType = new LeagueType(
            14,  // GAMES_PER_TEAM
            20,  // MAX_PLAYERS_PER_TEAM
            PlayoffType.TOP_4,
            AuctionType.DRAFT,
            8,  // TEAM_NUMBER
            true  // PLAYOFF_HOMEFIELD_ADVANTAGE
        );

        // Create teams array starting with Free Agents
        const teams: Team[] = [
            new Team(
                0,  // id
                'Free Agents',  // name
                'FA',  // shortName
                'default_logo.png',  // logo
                '#000000',  // primary color
                '#FFFFFF',  // secondary color
                [],  // players
                0,  // stadium
                [],  // pastScorecards
                [],  // schedule
                null  // lineup
            ),
            new Team(
                1,  // id
                'User Team',  // name
                'UT',  // shortName
                'default_logo.png',  // logo
                '#FF0000',  // primary color
                '#FFFFFF',  // secondary color
                [],  // players
                1,  // stadium
                [],  // pastScorecards
                [],  // schedule
                null  // lineup
            ),
            new Team(
                2,  // id
                'AI Team',  // name
                'AI',  // shortName
                'default_logo.png',  // logo
                '#0000FF',  // primary color
                '#FFFFFF',  // secondary color
                [],  // players
                2,  // stadium
                [],  // pastScorecards
                [],  // schedule
                null  // lineup
            )
        ];

        // Add players to free agents
        const players: Player[] = [];
        for (let i = 0; i < 40; i++) {
            const player = new Player(i, `Player ${i}`, 25, Hand.RIGHT_HANDED);
            if (i < 5) player.wicketKeeper = true;
            if (i < 20) player.bowlingStyle = BowlingStyle.FAST;
            players.push(player);
            teams[0].players.push(player.id);
        }

        league = new League(
            Date.now(),  // id
            leagueType,  // type
            'Test League',  // name
            teams,  // teams
            [],  // stadiums
            players,  // players
            [],  // seasons
            userTeamId  // userTeam
        );

        draftScreen = new DraftScreen(league, userTeamId);
    });

    describe('simulateNextPick', () => {
        it('should simulate a pick for AI team', () => {
            const initialFreeAgentsCount = league.teams[0].players.length;
            const initialTeamCount = league.teams[2].players.length;

            draftScreen.simulateNextPick();

            expect(league.teams[0].players.length).toBe(initialFreeAgentsCount - 1);
            expect(league.teams[2].players.length).toBe(initialTeamCount + 1);
        });

        it('should not simulate pick for user team', () => {
            // Make it user team's turn
            while (draftScreen.getCurrentTeam().id !== userTeamId) {
                draftScreen.simulateNextPick();
            }

            const initialFreeAgentsCount = league.teams[0].players.length;
            const initialUserTeamCount = league.teams[1].players.length;

            draftScreen.simulateNextPick();

            expect(league.teams[0].players.length).toBe(initialFreeAgentsCount);
            expect(league.teams[1].players.length).toBe(initialUserTeamCount);
        });

        it('should maintain valid team composition', () => {
            // Simulate until near end of draft
            while (!draftScreen.isDraftComplete()) {
                if (draftScreen.getCurrentTeam().id !== userTeamId) {
                    draftScreen.simulateNextPick();
                } else {
                    // For user team, pick first available player
                    const availablePlayers = league.players.filter(p => league.teams[0].players.includes(p.id));
                    if (availablePlayers.length > 0) {
                        draftScreen.draftPlayer(availablePlayers[0].id);
                    }
                }
            }

            // Check each team has correct number of players
            league.teams.slice(1).forEach(team => {
                expect(team.players.length).toBe(league.type.MAX_PLAYERS_PER_TEAM);
            });

            // Check each team has at least one wicketkeeper
            league.teams.slice(1).forEach(team => {
                const hasWicketkeeper = team.players.some(playerId => 
                    league.players.find(p => p.id === playerId)?.wicketKeeper
                );
                expect(hasWicketkeeper).toBe(true);
            });
        });
    });

    describe('simulateToEnd', () => {
        it('should complete the draft with valid teams', () => {
            // Mock user team picks by overriding simulateNextPick
            const originalSimulateNextPick = draftScreen.simulateNextPick;
            draftScreen.simulateNextPick = function() {
                const status = this.getDraftStatus();
                if (status.currentTeam.id === userTeamId) {
                    // For user team, pick first available player that maintains valid team composition
                    const teamPlayers = status.currentTeam.players.map((id: number) => 
                        status.availablePlayers.find(p => p.id === id)
                    ).filter((p): p is Player => p !== undefined);

                    // First try to get a wicket keeper if needed
                    const hasWicketKeeper = teamPlayers.some((p: Player) => p.wicketKeeper);
                    if (!hasWicketKeeper) {
                        const wicketKeeper = status.availablePlayers.find((p: Player) => p.wicketKeeper);
                        if (wicketKeeper) {
                            this.draftPlayer(wicketKeeper.id);
                            return;
                        }
                    }

                    // Then try to get a bowler if needed
                    const bowlerCount = teamPlayers.filter((p: Player) => p.bowlingStyle !== BowlingStyle.NONE).length;
                    if (bowlerCount < 6) {
                        const bowler = status.availablePlayers.find((p: Player) => p.bowlingStyle !== BowlingStyle.NONE);
                        if (bowler) {
                            this.draftPlayer(bowler.id);
                            return;
                        }
                    }

                    // If we still haven't found a player, take the best available player
                    if (status.availablePlayers.length > 0) {
                        this.draftPlayer(status.availablePlayers[0].id);
                    }
                } else {
                    originalSimulateNextPick.call(this);
                }
            };

            // Simulate until draft is complete or no more valid picks can be made
            let lastFreeAgentsCount = draftScreen.getDraftStatus().availablePlayers.length;
            let unchangedCount = 0;
            const maxIterations = 1000; // Add a maximum number of iterations to prevent infinite loops
            let iterations = 0;
            
            while (!draftScreen.isDraftComplete() && unchangedCount < 3 && iterations < maxIterations) {
                draftScreen.simulateNextPick();
                iterations++;
                
                const status = draftScreen.getDraftStatus();
                const currentFreeAgentsCount = status.availablePlayers.length;
                if (currentFreeAgentsCount === lastFreeAgentsCount) {
                    unchangedCount++;
                } else {
                    unchangedCount = 0;
                }
                lastFreeAgentsCount = currentFreeAgentsCount;
            }

            // If we hit max iterations, fail the test
            expect(iterations).toBeLessThan(maxIterations);

            // Verify each team has at least one wicketkeeper and enough players
            league.teams.slice(1).forEach((team: Team) => {
                const teamPlayers = team.players.map((id: number) => 
                    league.players.find(p => p.id === id)
                ).filter((p): p is Player => p !== undefined);

                // Check for wicketkeeper
                const hasWicketkeeper = teamPlayers.some((p: Player) => p.wicketKeeper);
                expect(hasWicketkeeper).toBe(true);

                // Check minimum players
                expect(team.players.length).toBeGreaterThanOrEqual(11);
            });
        });
    });
}); 