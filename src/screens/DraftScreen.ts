import { League } from '../models/League/League';
import { Team } from '../models/Team/Team';
import { Player } from '../models/Player/Player';
import { PlayerRatings } from '../models/Player/PlayerRatings';
import { FilterType } from '../models/Draft/FilterType';

type RatingProperty = 'power' | 'technical' | 'defensive' | 'temperament' | 'economy' | 'control' | 'wicketTaking' | 'clutch' | 'fitness' | 'leadership' | 'consistency' | 'fielding';
type SortCategory = 'overall' | 'battingOverall' | 'bowlingOverall' | 'fieldingOverall' | RatingProperty;

export class DraftScreen {
    private league: League;
    private currentTeamIndex: number;
    private currentRound: number;
    private draftOrder: number[];
    private availablePlayers: Player[];
    private draftHistory: { playerId: number; teamId: number }[] = [];
    private currentSortCategory: SortCategory = 'overall';
    private filters: FilterType = {};

    constructor(league: League) {
        this.league = league;
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        this.draftOrder = this.generateDraftOrder();
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
        const freeAgentsTeam = this.league.teams.find(team => team.id === 0);
        if (!freeAgentsTeam || !Array.isArray(freeAgentsTeam.players)) {
            console.error('No free agents team found or players is not an array');
            return [];
        }

        let players = freeAgentsTeam.players
            .map(playerId => this.league.players.find(p => p.id === playerId))
            .filter((p): p is Player => p !== undefined);

        // Apply filters
        if (this.filters.hand) {
            players = players.filter(p => p.hand === this.filters.hand);
        }
        if (this.filters.battingStyle) {
            players = players.filter(p => p.battingStyle === this.filters.battingStyle);
        }
        if (this.filters.bowlingStyle) {
            players = players.filter(p => p.bowlingStyle === this.filters.bowlingStyle);
        }
        if (this.filters.wicketkeeper !== undefined) {
            players = players.filter(p => p.wicketKeeper === this.filters.wicketkeeper);
        }
        if (this.filters.minAge !== undefined) {
            players = players.filter(p => p.age >= this.filters.minAge!);
        }
        if (this.filters.maxAge !== undefined) {
            players = players.filter(p => p.age <= this.filters.maxAge!);
        }

        // Sort by current sort category
        const sortedPlayers = [...players];
        this.sortPlayersByRating(sortedPlayers, this.currentSortCategory);
        return sortedPlayers;
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

        // Validate team composition
        const error = this.validateTeamComposition(currentTeam, playerId);
        if (error) {
            throw new Error(error);
        }

        // Move player from free agents to current team
        freeAgentsTeam.players = freeAgentsTeam.players.filter(id => id !== playerId);
        currentTeam.players.push(playerId);

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

        // Save to local storage
        this.saveToLocalStorage();
    }

    isDraftComplete(): boolean {
        // Draft is complete when all teams have max players
        return this.league.teams.every(team => 
            team.id === 0 || team.players.length >= this.league.type.MAX_PLAYERS_PER_TEAM
        );
    }

    calculateOverallRating(player: Player): number {
        const latestRatings = player.playerRatings[player.playerRatings.length - 1];
        if (!latestRatings) return 0;
        
        // Ensure we have a proper PlayerRatings instance
        if (!(latestRatings instanceof PlayerRatings)) {
            return PlayerRatings.fromJSON(latestRatings).calcOverallRating();
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
            const aRatingObj = aRatings instanceof PlayerRatings ? aRatings : PlayerRatings.fromJSON(aRatings);
            const bRatingObj = bRatings instanceof PlayerRatings ? bRatings : PlayerRatings.fromJSON(bRatings);

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

    simulateNextPick(): void {
        if (this.isDraftComplete()) return;

        const currentTeam = this.getCurrentTeam();
        if (currentTeam.id === this.league.userTeam) return;

        const teamNeeds = this.getTeamNeeds(currentTeam);
        const picksRemaining = this.league.type.MAX_PLAYERS_PER_TEAM - currentTeam.players.length;

        // Sort available players by overall rating with some randomness
        const sortedPlayers = [...this.availablePlayers].sort((a, b) => {
            const ratingA = this.calculateOverallRating(a);
            const ratingB = this.calculateOverallRating(b);
            // Add some randomness (±5 points) to prevent always picking the absolute best
            const randomFactorA = Math.random() * 10 - 5;
            const randomFactorB = Math.random() * 10 - 5;
            return (ratingB + randomFactorB) - (ratingA + randomFactorA);
        });

        // Prioritize wicketkeeper if needed
        // Try to get one in first half of draft if possible
        if (teamNeeds.needsWicketKeeper && (picksRemaining >= this.league.type.MAX_PLAYERS_PER_TEAM / 2 || picksRemaining <= 3)) {
            const wicketKeepers = sortedPlayers.filter(p => p.wicketKeeper);
            if (wicketKeepers.length > 0) {
                // Find the best wicket keeper with some randomness
                const bestWicketKeepers = wicketKeepers
                    .sort((a, b) => this.calculateOverallRating(b) - this.calculateOverallRating(a))
                    .slice(0, 3); // Look at top 3 available wicket keepers
                const selectedKeeper = bestWicketKeepers[Math.floor(Math.random() * bestWicketKeepers.length)];
                this.draftPlayer(selectedKeeper.id);
                return;
            }
        }

        // Look for best player that fits team needs
        for (const player of sortedPlayers.slice(0, 5)) { // Look at top 5 available players
            const role = player.getPlayerRole();
            
            // Always take a high-rated all-rounder
            if (role === 'All-Rounder' && this.calculateOverallRating(player) >= 75) {
                this.draftPlayer(player.id);
                return;
            }
            
            // Take players that fill team needs
            if ((role === 'Batter' && teamNeeds.needsBatters) ||
                (role === 'Bowler' && teamNeeds.needsBowlers)) {
                this.draftPlayer(player.id);
                return;
            }
        }

        // If no specific needs, take the best available player
        this.draftPlayer(sortedPlayers[0].id);
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
            currentRound: this.currentRound,
            availablePlayers: this.availablePlayers,
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
        // Re-apply filters to available players
        this.availablePlayers = this.getAvailablePlayers();
    }

    clearFilters(): void {
        this.filters = {};
        this.availablePlayers = this.getAvailablePlayers();
    }

    getActiveFilters(): FilterType {
        return { ...this.filters };
    }

    sortByCategory(category: SortCategory): void {
        this.currentSortCategory = category;
        this.availablePlayers = this.getAvailablePlayers();
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
        const draftScreen = new DraftScreen(league);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            draftScreen.currentTeamIndex = data.currentTeamIndex;
            draftScreen.currentRound = data.currentRound;
            draftScreen.draftOrder = data.draftOrder;
            draftScreen.draftHistory = data.draftHistory;
            draftScreen.currentSortCategory = data.currentSortCategory || 'overall';
            draftScreen.filters = data.filters || {};
            
            // Reconstruct teams based on draft history
            league.teams.forEach(team => team.players = []);
            const freeAgents = league.teams.find(team => team.id === 0)!;
            freeAgents.players = league.players.map(p => p.id);
            
            data.draftHistory.forEach(({ playerId, teamId }: { playerId: number; teamId: number }) => {
                const team = league.teams.find(t => t.id === teamId)!;
                freeAgents.players = freeAgents.players.filter(id => id !== playerId);
                team.players.push(playerId);
            });
            
            draftScreen.availablePlayers = draftScreen.getAvailablePlayers();
        }
        
        return draftScreen;
    }
} 