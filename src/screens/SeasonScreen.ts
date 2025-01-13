import { League } from '../models/League/League';
import { Season } from '../models/Season/Season';
import { TeamLineup } from '../models/Team/TeamLineup';
import { ScheduleGame } from '../models/Season/ScheduleGame';
import { Stadium } from '../models/Stadium/Stadium';
import { GameType } from '../models/Season/GameType';
import { LineupGenerator } from '../models/Team/LineupGenerator';
import { BowlingStyle } from '../models/Player/BowlingStyle';

const SEASON_KEY = 'current_season';
const LINEUPS_KEY = 'team_lineups';

export class SeasonScreen {
    private league: League;
    private currentSeason: Season;
    private teamLineups: Map<number, TeamLineup>;

    constructor(league: League) {
        this.league = league;
        this.currentSeason = new Season(1, [], [], 0, [], []);
        this.teamLineups = new Map();
    }

    static loadFromLocalStorage(league: League): SeasonScreen {
        const screen = new SeasonScreen(league);
        
        const savedSeasonData = localStorage.getItem(SEASON_KEY);
        if (savedSeasonData) {
            const seasonJson = JSON.parse(savedSeasonData);
            screen.currentSeason = Season.fromJSON(seasonJson);
        }
        
        const savedLineupsData = localStorage.getItem(LINEUPS_KEY);
        if (savedLineupsData) {
            const lineupsJson = JSON.parse(savedLineupsData);
            screen.teamLineups = new Map(Object.entries(lineupsJson).map(([teamId, lineup]) => [
                Number(teamId),
                TeamLineup.fromJSON(lineup as ReturnType<TeamLineup['toJSON']>)
            ]));
        }

        // Generate schedule if it doesn't exist
        if (screen.currentSeason.schedule.length === 0) {
            screen.generateNewSchedule();
        }

        // Generate missing lineups for teams
        const teams = screen.league.teams.filter(t => t.id !== 0); // Exclude free agents
        for (const team of teams) {
            if (!screen.teamLineups.has(team.id)) {
                try {
                    const players = screen.league.players.filter(p => team.players.includes(p.id));
                    const lineup = LineupGenerator.generateLineup(players);
                    screen.teamLineups.set(team.id, lineup);
                } catch (error) {
                    console.error(`Failed to generate lineup for team ${team.name}:`, error);
                    const fallbackLineup = new TeamLineup(team.id, [], [], -1); // Use -1 as a sentinel value for no wicket keeper
                    screen.teamLineups.set(team.id, fallbackLineup);
                }
            }
        }
        
        return screen;
    }

    saveToLocalStorage(): void {
        localStorage.setItem(SEASON_KEY, JSON.stringify(this.currentSeason.toJSON()));
        
        const lineupData: { [key: string]: ReturnType<TeamLineup['toJSON']> } = {};
        this.teamLineups.forEach((lineup, teamId) => {
            lineupData[teamId] = lineup.toJSON();
        });
        localStorage.setItem(LINEUPS_KEY, JSON.stringify(lineupData));
    }

    getLeague(): League {
        return this.league;
    }

    getCurrentSeason(): Season {
        return this.currentSeason;
    }

    getTeamLineup(teamId: number): TeamLineup {
        let lineup = this.teamLineups.get(teamId);
        if (!lineup) {
            lineup = new TeamLineup(teamId, [], [], -1); // Use -1 as a sentinel value for no wicket keeper
            this.teamLineups.set(teamId, lineup);
        }
        return lineup;
    }

    setTeamLineup(teamId: number, lineup: TeamLineup): string | null {
        // First check if this is the user's team
        if (teamId !== this.league.userTeam) {
            return 'You can only edit your own team\'s lineup';
        }

        // Validate lineup
        const team = this.league.teams.find(t => t.id === teamId);
        if (!team) return 'Team not found';

        const players = this.league.players.filter(p => team.players.includes(p.id));
        
        // Check batting order
        const battingOrder = lineup.battingOrder.filter(id => id !== 0);
        if (battingOrder.length < 11) {
            return 'Must select 11 players for batting order';
        }
        if (new Set(battingOrder).size !== battingOrder.length) {
            return 'Cannot have duplicate players in batting order';
        }
        if (!battingOrder.every(id => players.some(p => p.id === id))) {
            return 'Invalid player in batting order';
        }

        // Check bowling order
        const bowlingOrder = lineup.bowlingOrder.filter(id => id !== 0);
        if (bowlingOrder.length !== 20) {
            return 'Must assign all 20 overs in bowling order';
        }
        
        // Check for consecutive overs by same bowler
        for (let i = 1; i < bowlingOrder.length; i++) {
            if (bowlingOrder[i] === bowlingOrder[i - 1]) {
                return `Bowler ${bowlingOrder[i]} cannot bowl consecutive overs ${i} and ${i + 1}`;
            }
        }

        // Check max overs per bowler
        const bowlerOvers = new Map<number, number>();
        bowlingOrder.forEach(id => {
            bowlerOvers.set(id, (bowlerOvers.get(id) || 0) + 1);
        });
        
        // Convert Map entries to array for iteration
        const overCounts = Array.from(bowlerOvers.entries());
        for (const [bowlerId, overs] of overCounts) {
            if (overs > 4) {
                return `Bowler ${bowlerId} cannot bowl more than 4 overs (assigned ${overs})`;
            }
        }

        // Validate bowlers can actually bowl
        if (!bowlingOrder.every(id => {
            const player = players.find(p => p.id === id);
            return player && player.bowlingStyle !== BowlingStyle.NONE;
        })) {
            return 'Invalid bowler in bowling order';
        }

        // Check wicket keeper
        if (!lineup.wicketKeeper) {
            return 'Must select a wicket keeper';
        }
        const keeper = players.find(p => p.id === lineup.wicketKeeper);
        if (!keeper || !keeper.wicketKeeper) {
            return 'Selected player cannot be wicket keeper';
        }

        team.lineup = lineup;
        return null;
    }

    generateNewSchedule(): void {
        const teams = this.league.teams.filter(t => t.id !== 0);
        const schedule: ScheduleGame[] = [];
        let gameId = 1;

        // Generate round-robin schedule
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const homeTeam = teams[i];
                const awayTeam = teams[j];
                
                // Home game
                schedule.push(new ScheduleGame(
                    gameId++,
                    homeTeam.stadium,
                    homeTeam.id,
                    awayTeam.id,
                    GameType.NORMAL
                ));

                // Away game (reverse fixture)
                schedule.push(new ScheduleGame(
                    gameId++,
                    awayTeam.stadium,
                    awayTeam.id,
                    homeTeam.id,
                    GameType.NORMAL
                ));
            }
        }

        // Shuffle the schedule to make it more random
        for (let i = schedule.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [schedule[i], schedule[j]] = [schedule[j], schedule[i]];
        }

        this.currentSeason = new Season(
            this.currentSeason.id,
            teams,
            schedule,
            0,
            [],
            []
        );

        // Generate lineups for AI teams
        this.generateAITeamLineups();
        
        // Save to local storage
        this.saveToLocalStorage();
    }

    private generateAITeamLineups(): void {
        const teams = this.league.teams.filter(t => t.id !== 0);
        
        for (const team of teams) {
            // Get all players for this team
            const players = this.league.players.filter(p => team.players.includes(p.id));
            
            // Sort players by overall rating
            const sortedPlayers = [...players].sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                return bRating.calcOverallRating() - aRating.calcOverallRating();
            });

            // Find wicket keeper
            const wicketKeeper = sortedPlayers.find(p => p.wicketKeeper);
            if (!wicketKeeper) {
                console.error(`No wicket keeper found for team ${team.name}`);
                continue;
            }

            // Sort batters by batting rating
            const batters = [...sortedPlayers].sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                return bRating.calcBattingRating() - aRating.calcBattingRating();
            });

            // Sort bowlers by bowling rating
            const bowlers = [...sortedPlayers].sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                return bRating.calcBowlingRating() - aRating.calcBowlingRating();
            });

            // Create batting order:
            // 1. Top 6 batters
            // 2. Wicket keeper (if not already in top 6)
            // 3. All rounders and bowlers who can bat
            const battingOrder: number[] = [];
            const usedPlayers = new Set<number>();

            // Add top 6 batters
            for (const batter of batters) {
                if (battingOrder.length >= 6) break;
                battingOrder.push(batter.id);
                usedPlayers.add(batter.id);
            }

            // Add wicket keeper if not already in
            if (!usedPlayers.has(wicketKeeper.id)) {
                battingOrder.push(wicketKeeper.id);
                usedPlayers.add(wicketKeeper.id);
            }

            // Fill remaining spots with best available players
            for (const player of sortedPlayers) {
                if (battingOrder.length >= 11) break;
                if (!usedPlayers.has(player.id)) {
                    battingOrder.push(player.id);
                    usedPlayers.add(player.id);
                }
            }

            // Create bowling order:
            // Take top 6 bowlers
            const bowlingOrder = bowlers
                .slice(0, 6)
                .map(p => p.id);

            // Create lineup
            const lineup = new TeamLineup(
                team.id,
                battingOrder,
                bowlingOrder,
                wicketKeeper.id
            );

            // Save lineup
            team.lineup = lineup;
        }
    }

    private getHomeStadium(teamId: number, stadiums: Stadium[]): Stadium {
        // Find stadium where this team is listed as home team
        const homeStadium = stadiums.find(s => s.id === teamId);
        return homeStadium || stadiums[0];
    }
} 