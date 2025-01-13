import { League } from '../models/League/League';
import { Team } from '../models/Team/Team';
import { Player } from '../models/Player/Player';
import { PlayerRatings } from '../models/Player/PlayerRatings';
import { FilterType } from '../models/Draft/FilterType';
import { BowlingStyle } from '../models/Player/BowlingStyle';
import { LineupGenerator } from '../models/Team/LineupGenerator';
import { generateRandomPlayer } from '../utils/PlayerGenerator';
import { LocalStorageManager } from '../utils/LocalStorageManager';

type RatingProperty = 'power' | 'technical' | 'defensive' | 'temperament' | 'economy' | 'control' | 'wicketTaking' | 'clutch' | 'fitness' | 'leadership' | 'consistency' | 'fielding';
type SortCategory = 'overall' | 'battingOverall' | 'bowlingOverall' | 'fieldingOverall' | RatingProperty;

interface DraftScreenJSON {
    league: ReturnType<typeof League.prototype.toJSON>;
    userTeamId: number;
    currentTeamIndex: number;
    currentRound: number;
    filters: FilterType;
}

export class DraftScreen {
    private league: League;
    private userTeamId: number;
    private isDraftCompleted: boolean = false;
    private currentTeamIndex: number;
    private currentRound: number;
    private draftOrder: number[];
    private availablePlayers: Player[];
    private draftHistory: { playerId: number; teamId: number }[] = [];
    private currentSortCategory: SortCategory = 'overall';
    private filters: FilterType = {};

    constructor(league: League, userTeamId: number) {
        this.league = league;
        this.userTeamId = userTeamId;
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        this.draftOrder = this.generateDraftOrder();
        
        // Make sure all players are in free agents team initially
        const freeAgents = league.teams.find(team => team.id === 0)!;
        if (!freeAgents.players.length) {
            freeAgents.players = league.players.map(p => p.id);
        }
        
        // Initialize available players
        this.availablePlayers = this.getAvailablePlayers();
        this.draftHistory = [];
    }

    getLeague(): League {
        return this.league;
    }

    private generateDraftOrder(): number[] {
        // Get all team IDs except free agents (ID 0)
        const teamIds = this.league.teams
            .filter(team => team.id !== 0)
            .map(team => team.id);
        
        // For first round, use original order
        const order = [...teamIds];
        
        // For subsequent rounds, alternate between forward and reverse
        if (this.currentRound % 2 === 0) {
            order.reverse();
        }
        
        return order;
    }

    private getAvailablePlayers(): Player[] {
        // Get players that are drafted to actual teams (not free agents)
        const draftedPlayerIds = new Set(
            this.league.teams
                .filter(t => t.id !== 0) // Exclude free agents team
                .flatMap(t => t.players)
        );
        let availablePlayers = this.league.players.filter(p => !draftedPlayerIds.has(p.id));

        // Apply filters
        if (this.filters.hand) {
            availablePlayers = availablePlayers.filter(p => p.hand === this.filters.hand);
        }
        if (this.filters.battingStyle) {
            availablePlayers = availablePlayers.filter(p => p.battingStyle === this.filters.battingStyle);
        }
        if (this.filters.bowlingStyle) {
            availablePlayers = availablePlayers.filter(p => p.bowlingStyle === this.filters.bowlingStyle);
        }

        // Sort players by current sort category
        this.sortPlayersByRating(availablePlayers, this.currentSortCategory);

        return availablePlayers;
    }

    getCurrentTeam(): Team {
        return this.league.teams.find(team => 
            team.id === this.draftOrder[this.currentTeamIndex]
        )!;
    }

    private validateTeamComposition(team: Team, newPlayerId: number): string | null {
        const teamPlayers = team.players.map(id => 
            this.league.players.find(p => p.id === id)!
        );
        const newPlayer = this.league.players.find(p => p.id === newPlayerId)!;
        
        const hasWicketKeeper = teamPlayers.some(p => p.wicketKeeper);
        const totalPlayers = teamPlayers.length;
        const maxPlayers = this.league.type.MAX_PLAYERS_PER_TEAM;
        
        // If this is the last pick and team has no wicketkeeper
        if (totalPlayers === maxPlayers - 1 && !hasWicketKeeper && !newPlayer.wicketKeeper) {
            return "You must draft a wicketkeeper for your last pick!";
        }
        
        return null;
    }

    draftPlayer(playerId: number): void {
        const currentTeam = this.getCurrentTeam();
        const freeAgentsTeam = this.league.teams.find(team => team.id === 0)!;

        console.log('\n=== Draft Player Debug Info ===');
        console.log('Current Team:', {
            id: currentTeam.id,
            name: currentTeam.name,
            currentPlayers: currentTeam.players
        });
        console.log('Player being drafted:', {
            id: playerId,
            player: this.league.players.find(p => p.id === playerId)
        });

        // Validate team composition
        const error = this.validateTeamComposition(currentTeam, playerId);
        if (error) {
            throw new Error(error);
        }

        // Move player from free agents to current team
        freeAgentsTeam.players = freeAgentsTeam.players.filter(id => id !== playerId);
        currentTeam.players.push(playerId);

        console.log('Team after draft:', {
            id: currentTeam.id,
            name: currentTeam.name,
            updatedPlayers: currentTeam.players
        });

        // Add to draft history
        this.draftHistory.push({ playerId, teamId: currentTeam.id });

        // Update draft position
        this.currentTeamIndex++;
        if (this.currentTeamIndex >= this.draftOrder.length) {
            this.currentTeamIndex = 0;
            this.currentRound++;
            // Update draft order for next round
            this.draftOrder = this.generateDraftOrder();
        }

        // Update available players
        this.availablePlayers = this.getAvailablePlayers();

        // If draft is complete, generate lineups for all teams
        if (this.isDraftComplete()) {
            console.log('\n=== Draft Complete - Generating Lineups ===');
            const teams = this.league.teams.filter(t => t.id !== 0);
            for (const team of teams) {
                // Get all players for this team
                const players = this.league.players.filter(p => team.players.includes(p.id));
                console.log(`\nGenerating lineup for team ${team.name}:`, {
                    teamId: team.id,
                    playerCount: players.length,
                    players: players.map(p => ({
                        id: p.id,
                        name: p.name,
                        isWicketKeeper: p.wicketKeeper,
                        bowlingStyle: p.bowlingStyle
                    }))
                });
                try {
                    team.lineup = LineupGenerator.generateLineup(players);
                } catch (error) {
                    console.error(`Failed to generate lineup for team ${team.name}:`, error);
                }
            }
            console.log('=== End Lineup Generation ===\n');

            // Save the final league state with all drafted players and lineups
            LocalStorageManager.saveLeague(this.league);
        }

        // Save draft state
        this.saveToLocalStorage();
    }

    isDraftComplete(): boolean {
        // Check that all teams (except free agents) have exactly the max number of players
        return this.league.teams.every(team => 
            team.id === 0 || team.players.length === this.league.type.MAX_PLAYERS_PER_TEAM
        );
    }

    calculateOverallRating(player: Player): number {
        const latestRatings = player.playerRatings[player.playerRatings.length - 1];
        if (!latestRatings) return 0;
        
        // Ensure we have a proper PlayerRatings instance
        if (!(latestRatings instanceof PlayerRatings)) {
            return PlayerRatings.fromJSON(latestRatings, player.bowlingStyle !== BowlingStyle.NONE).calcOverallRating();
        }
        
        return latestRatings.calcOverallRating();
    }

    private getRatingValue(ratings: PlayerRatings, category: SortCategory): number {
        if (!ratings) return 0;
        
        switch (category) {
            case 'overall':
                return ratings.calcOverallRating();
            case 'battingOverall':
                return ratings.calcBattingRating();
            case 'bowlingOverall':
                return ratings.calcBowlingRating();
            case 'fieldingOverall':
                return ratings.calcFieldingRating();
            default:
                return ratings[category] || 0;
        }
    }

    private sortPlayersByRating(players: Player[], category: SortCategory = 'overall'): void {
        if (!Array.isArray(players)) {
            console.error('Expected players to be an array but got:', players);
            return;
        }

        players.sort((a, b) => {
            if (!a || !b) return 0;

            // Get the latest ratings for each player
            const aRatings = a.playerRatings[a.playerRatings.length - 1];
            const bRatings = b.playerRatings[b.playerRatings.length - 1];

            // If no ratings exist, treat as 0
            if (!aRatings || !bRatings) return 0;

            // Ensure we have proper PlayerRatings instances
            const aRatingObj = aRatings instanceof PlayerRatings ? aRatings : PlayerRatings.fromJSON(aRatings, a.bowlingStyle !== BowlingStyle.NONE);
            const bRatingObj = bRatings instanceof PlayerRatings ? bRatings : PlayerRatings.fromJSON(bRatings, b.bowlingStyle !== BowlingStyle.NONE);

            // Get the rating values using our helper method
            const aValue = this.getRatingValue(aRatingObj, category);
            const bValue = this.getRatingValue(bRatingObj, category);

            return bValue - aValue;
        });
    }

    private getTeamNeeds(team: Team): { needsWicketKeeper: boolean; needsBatters: boolean; needsBowlers: boolean } {
        const teamPlayers = team.players.map(id => 
            this.league.players.find(p => p.id === id)!
        );
        
        const hasWicketKeeper = teamPlayers.some(p => p.wicketKeeper);
        const battersCount = teamPlayers.filter(p => p.getPlayerRole() === 'Batter').length;
        const bowlersCount = teamPlayers.filter(p => p.getPlayerRole() === 'Bowler').length;
        const totalPlayers = teamPlayers.length;
        
        // Calculate current and target ratios
        const currentBatterRatio = totalPlayers === 0 ? 0 : battersCount / totalPlayers;
        const currentBowlerRatio = totalPlayers === 0 ? 0 : bowlersCount / totalPlayers;
        const targetBatterRatio = 0.6;
        const targetBowlerRatio = 0.4;
        
        return {
            needsWicketKeeper: !hasWicketKeeper,
            needsBatters: currentBatterRatio < targetBatterRatio,
            needsBowlers: currentBowlerRatio < targetBowlerRatio
        };
    }

    simulateNextPick(allowUserTeam: boolean = false): void {
        if (this.isDraftComplete()) return;

        const currentTeam = this.getCurrentTeam();
        // Only skip user team if not explicitly allowed
        if (!allowUserTeam && currentTeam.id === this.userTeamId) return;

        // Ensure enough valid players before simulating
        this.ensureEnoughValidPlayers();

        // Get available players sorted by rating
        const sortedPlayers = this.getAvailablePlayers()
            .sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                return bRating.calcOverallRating() - aRating.calcOverallRating();
            });

        if (sortedPlayers.length === 0) {
            this.markDraftAsComplete();
            return;
        }

        // Check team needs
        const hasWicketKeeper = currentTeam.players.some(playerId => {
            const player = this.league.getPlayer(playerId);
            return player?.wicketKeeper;
        });

        const needsBowlers = currentTeam.players.filter(playerId => {
            const player = this.league.getPlayer(playerId);
            return player?.bowlingStyle !== BowlingStyle.NONE;
        }).length < 6;

        // Calculate remaining picks for this team
        const remainingPicks = this.league.type.MAX_PLAYERS_PER_TEAM - currentTeam.players.length;

        // FORCE wicket keeper selection if team doesn't have one and is running out of picks
        if (!hasWicketKeeper && remainingPicks <= 2) {
            const wicketKeeper = sortedPlayers.find(p => p.wicketKeeper);
            if (wicketKeeper) {
                this.draftPlayer(wicketKeeper.id);
                return;
            } else {
                // If no wicket keeper available, generate one
                const newKeeper = generateRandomPlayer(Math.max(...this.league.players.map(p => p.id)) + 1, true);
                this.league.players.push(newKeeper);
                const freeAgents = this.league.teams.find(t => t.id === 0)!;
                freeAgents.players.push(newKeeper.id);
                this.draftPlayer(newKeeper.id);
                return;
            }
        }

        // Try to get a wicket keeper early if team doesn't have one
        if (!hasWicketKeeper && Math.random() < 0.3) {  // 30% chance to pick wicket keeper if needed
            const wicketKeeper = sortedPlayers.find(p => p.wicketKeeper);
            if (wicketKeeper) {
                this.draftPlayer(wicketKeeper.id);
                return;
            }
        }

        // Try to fill other team needs
        if (needsBowlers) {
            const bowler = sortedPlayers.find(p => p.bowlingStyle !== BowlingStyle.NONE);
            if (bowler) {
                this.draftPlayer(bowler.id);
                return;
            }
        }

        // If no specific needs, take the best available player
        if (sortedPlayers.length > 0) {
            this.draftPlayer(sortedPlayers[0].id);
        }
    }

    simulateToNextUserPick(): void {
        while (!this.isDraftComplete()) {
            const currentTeam = this.getCurrentTeam();
            if (currentTeam.id === this.league.userTeam) break;
            this.simulateNextPick();
        }
    }

    simulateToEnd(): void {
        while (!this.isDraftComplete()) {
            this.simulateNextPick();
        }
    }

    getDraftStatus() {
        return {
            currentTeam: this.getCurrentTeam(),
            availablePlayers: this.getAvailablePlayers(),
            currentRound: this.currentRound,
            currentTeamIndex: this.currentTeamIndex,
            isDraftComplete: this.isDraftComplete()
        };
    }

    getDraftHistory(): { playerId: number; teamId: number }[] {
        return this.draftHistory;
    }

    setFilter<K extends keyof FilterType>(
        type: K,
        value: FilterType[K] | undefined
    ): void {
        if (value !== undefined) {
            this.filters[type] = value;
        } else {
            delete this.filters[type];
        }
        // No need to update availablePlayers here as it will be updated when getDraftStatus is called
    }

    clearFilters(): void {
        this.filters = {};
        // No need to update availablePlayers here as it will be updated when getDraftStatus is called
    }

    getActiveFilters(): FilterType {
        return { ...this.filters };
    }

    sortByCategory(category: SortCategory): void {
        this.currentSortCategory = category;
        // No need to call getAvailablePlayers here as it will be called when getDraftStatus is called
        // and it will apply both filters and sorting
    }

    saveToLocalStorage(): void {
        const data = {
            currentTeamIndex: this.currentTeamIndex,
            currentRound: this.currentRound,
            draftOrder: this.draftOrder,
            draftHistory: this.draftHistory,
            currentSortCategory: this.currentSortCategory,
            filters: this.filters
        };
        localStorage.setItem('draft_state', JSON.stringify(data));
    }

    static loadFromLocalStorage(league: League): DraftScreen {
        const savedData = localStorage.getItem('draft_state');
        const draftScreen = new DraftScreen(league, league.userTeam);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            draftScreen.currentTeamIndex = data.currentTeamIndex;
            draftScreen.currentRound = data.currentRound;
            draftScreen.draftOrder = data.draftOrder;
            draftScreen.draftHistory = data.draftHistory;
            draftScreen.currentSortCategory = data.currentSortCategory || 'overall';
            draftScreen.filters = data.filters || {};
            
            // Reset all team players
            league.teams.forEach(team => team.players = []);
            
            // First, add all players to free agents
            const freeAgents = league.teams.find(team => team.id === 0)!;
            freeAgents.players = league.players.map(p => p.id);
            
            // Then move drafted players to their teams
            data.draftHistory.forEach(({ playerId, teamId }: { playerId: number; teamId: number }) => {
                const team = league.teams.find(t => t.id === teamId)!;
                freeAgents.players = freeAgents.players.filter(id => id !== playerId);
                team.players.push(playerId);
            });
        }
        
        // Make sure to update available players
        draftScreen.availablePlayers = draftScreen.getAvailablePlayers();
        
        return draftScreen;
    }

    private markDraftAsComplete(): void {
        this.isDraftCompleted = true;
    }

    static create(league: League, userTeamId: number): DraftScreen {
        const draftScreen = new DraftScreen(league, userTeamId);
        return draftScreen;
    }

    static fromJSON(json: DraftScreenJSON): DraftScreen {
        const league = League.fromJSON(json.league);
        const draftScreen = DraftScreen.create(league, json.userTeamId);
        draftScreen.currentTeamIndex = json.currentTeamIndex;
        draftScreen.currentRound = json.currentRound;
        draftScreen.filters = json.filters || {};
        return draftScreen;
    }

    toJSON() {
        return {
            league: this.league.toJSON(),
            userTeamId: this.userTeamId,
            currentTeamIndex: this.currentTeamIndex,
            currentRound: this.currentRound,
            filters: this.filters
        };
    }

    private ensureEnoughValidPlayers(): void {
        const status = this.getDraftStatus();
        const availablePlayers = status.availablePlayers;
        
        // Count available wicket keepers and bowlers
        const wicketKeepers = availablePlayers.filter(p => p.wicketKeeper);
        const bowlers = availablePlayers.filter(p => p.bowlingStyle !== BowlingStyle.NONE);
        
        // Calculate how many more players we need
        const teamsCount = this.league.teams.length - 1; // Exclude free agents
        const minWicketKeepersNeeded = teamsCount; // 1 per team
        const minBowlersNeeded = teamsCount * 6; // 6 per team
        
        // Generate more players if needed
        let nextId = Math.max(...availablePlayers.map(p => p.id)) + 1;
        
        // Add wicket keepers if needed
        while (wicketKeepers.length < minWicketKeepersNeeded) {
            const newKeeper = generateRandomPlayer(nextId++, true);
            this.league.players.push(newKeeper);
        }
        
        // Add bowlers if needed
        while (bowlers.length < minBowlersNeeded) {
            const newBowler = generateRandomPlayer(nextId++);
            if (newBowler.bowlingStyle !== BowlingStyle.NONE) {
                this.league.players.push(newBowler);
            }
        }
    }
} 