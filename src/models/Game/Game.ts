import { Player } from '../Player/Player';
import { BattingScorecard } from '../Scorecard/BattingScorecard';
import { BowlingScorecard } from '../Scorecard/BowlingScorecard';
import { Dismissal } from '../Player/Dismissal';
import { PlayerStats } from '../Player/PlayerStats';
import { BattingStats } from '../Player/BattingStats';
import { BowlingStats } from '../Player/BowlingStats';
import { FieldingStats } from '../Player/FieldingStats';
import { BattingStyle } from '../Player/BattingStyle';
import { BowlingStyle } from '../Player/BowlingStyle';
import { Hand } from '../Player/Hand';
import { PitchType } from '../Stadium/PitchType';
import { BoundarySize } from '../Stadium/BoundarySize';
import { Stadium } from '../Stadium/Stadium';

export interface TeamGameData {
    stadium: number;
    battingLineup: number[];
    bowlingOrder: number[];
    players: number[];
    teamName: string;
    homeAdvantage: number;
}

interface PlayerGameStats {
    playerID: number;
    innings: number;
    // Batting stats
    ballsFaced: number;
    runsScored: number;
    foursScored: number;
    sixesScored: number;
    // Bowling stats
    balls: 0;
    runs: 0;
    wickets: 0;
    maidens: 0;
    noBalls: 0;
    wides: 0;
    byes: 0;
    dotBalls: 0;
    // Fielding stats
    catches: number;
    runouts: number;
    stumpings: number;
    missedCatches: number;
    missedRunOuts: number;
    missedStumpings: number;
    // Dismissal info
    dismissalType: Dismissal | undefined;
    bowlerId: number | undefined;
    fielderId: number | undefined;
}

export class Game {
    private homeTeam: TeamGameData;
    private awayTeam: TeamGameData;
    private players: Player[];
    private playLog: string[] = [];
    private scorecard: { [key: number]: PlayerGameStats } = {};
    private innings: number = 1;
    private gameSimming: boolean = true;
    private overs: number = 0;
    private balls: number = 0;
    private score: number = 0;
    private wickets: number = 0;
    private innings1Score: number = 0;
    private innings1Wickets: number = 0;
    private innings1Balls: number = 0;
    private bowlingTeam: TeamGameData;
    private battingTeam: TeamGameData;
    private batters: number[] = [];
    private strikerIndex: number = 0;
    private nonStrikerIndex: number = 1;
    public winningTeamID: number = -1;
    private stadiums: Stadium[];
    private gameRatingAdjustments: Map<number, number> = new Map();
    private bowlerOvers: Map<number, number> = new Map();
    private batterBallsFaced: Map<number, number> = new Map();

    // Add getters for private properties
    public get currentOvers(): number {
        return this.overs;
    }

    public get currentBalls(): number {
        return this.balls;
    }

    public get currentScore(): number {
        return this.score;
    }

    public get currentInnings1Score(): number {
        return this.innings1Score;
    }

    public get currentInnings(): number {
        return this.innings;
    }

    public get currentInnings1Wickets(): number {
        return this.innings1Wickets;
    }

    public get currentInnings1Balls(): number {
        return this.innings1Balls;
    }

    public get currentBatters(): number[] {
        return [this.batters[this.strikerIndex], this.batters[this.nonStrikerIndex]];
    }

    public get currentPlayLog(): string[] {
        return [...this.playLog];
    }

    public get isComplete(): boolean {
        return this.winningTeamID !== -1;
    }

    public get currentBattingTeam(): TeamGameData {
        return this.battingTeam;
    }

    public get currentBowlingTeam(): TeamGameData {
        return this.bowlingTeam;
    }

    // Add method to simulate a single ball
    public simulateBall(): void {
        if (this.isComplete) return;

        // Validate batting lineup access
        if (this.batters[this.strikerIndex] === undefined) {
            console.error('Invalid batter index:', {
                strikerIndex: this.strikerIndex,
                nonStrikerIndex: this.nonStrikerIndex,
                batters: this.batters,
                battingLineup: this.battingTeam.battingLineup
            });
            this.winningTeamID = this.bowlingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium;
            return;
        }

        const batterID = this.battingTeam.battingLineup[this.batters[this.strikerIndex]];
        const bowlerID = this.bowlingTeam.bowlingOrder[this.overs];
        
        // Validate player IDs
        if (!batterID || !bowlerID) {
            console.error('Invalid player IDs in simulateBall:', { 
                batterID, 
                bowlerID,
                strikerIndex: this.strikerIndex,
                battingLineup: this.battingTeam.battingLineup,
                bowlingOrder: this.bowlingTeam.bowlingOrder,
                overs: this.overs
            });
            this.winningTeamID = this.bowlingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium;
            return;
        }

        const batter = this.getPlayer(batterID);
        const bowler = this.getPlayer(bowlerID);

        if (!batter || !bowler) {
            console.error('Players not found:', { batterID, bowlerID });
            this.winningTeamID = this.bowlingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium;
            return;
        }
        
        const wasLegalDelivery = this.runPlay(
            batter,
            bowler,
            1 + (this.homeTeam.homeAdvantage - 1) / 2
        );

        if (wasLegalDelivery) {
            this.balls++;
        }

        // Check if we need to end the over
        if (this.balls > 5) {
            this.handleEndOfOver();

            // Check if innings is complete
            if (this.overs >= 20 || this.batters.length <= 1) {
                if (this.innings === 1) {
                    // Switch innings
                    this.innings1Score = this.score;
                    this.innings1Wickets = this.wickets;
                    this.innings1Balls = this.overs * 6;
                    
                    // Switch teams
                    const tempVar = this.bowlingTeam;
                    this.bowlingTeam = this.battingTeam;
                    this.battingTeam = tempVar;
                    
                    // Reset for second innings
                    this.batters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                    this.strikerIndex = 0;
                    this.nonStrikerIndex = 1;
                    this.score = 0;
                    this.wickets = 0;
                    this.innings = 2;
                    this.overs = 0;
                    this.balls = 0;
                } else {
                    // Game complete
                    this.winningTeamID = this.innings1Score > this.score ? 
                        (this.bowlingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium) :
                        (this.battingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium);
                    this.savePlayerStats();
                }
            }
        }
    }

    constructor(homeTeam: TeamGameData, awayTeam: TeamGameData, players: Player[], stadiums: Stadium[]) {
        // Validate required data
        if (!homeTeam.battingLineup?.length || !homeTeam.bowlingOrder?.length ||
            !awayTeam.battingLineup?.length || !awayTeam.bowlingOrder?.length) {
            throw new Error('Invalid team lineups');
        }

        if (!players?.length) {
            throw new Error('No players provided');
        }

        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.players = players;
        this.stadiums = stadiums;

        // Apply consistency-based rating adjustments before the game
        this.applyConsistencyAdjustments();

        // Initialize scorecard
        this.initializeScorecard();

        // Determine who bats first
        const homeTeamWonToss = this.flipCoin();
        const tossWinner = homeTeamWonToss ? homeTeam.teamName : awayTeam.teamName;
        this.addToPlayLog(`${tossWinner} wins the toss!`);

        if (this.flipCoin()) {
            this.bowlingTeam = homeTeamWonToss ? homeTeam : awayTeam;
            this.battingTeam = homeTeamWonToss ? awayTeam : homeTeam;
            this.addToPlayLog(`${tossWinner} chooses to bowl first`);
        } else {
            this.battingTeam = homeTeamWonToss ? homeTeam : awayTeam;
            this.bowlingTeam = homeTeamWonToss ? awayTeam : homeTeam;
            this.addToPlayLog(`${tossWinner} chooses to bat first`);
        }

        // Initialize batters array with indices 0-10
        this.batters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.strikerIndex = 0;
        this.nonStrikerIndex = 1;

        // Initialize overs/balls tracking
        for (const player of players) {
            this.bowlerOvers.set(player.id, 0);
            this.batterBallsFaced.set(player.id, 0);
        }
    }

    private flipCoin(): boolean {
        return Math.random() > 0.5;
    }

    private getPlayer(id: number): Player {
        const player = this.players.find(p => p.id === id);
        if (!player) throw new Error(`Player ${id} not found`);
        return player;
    }

    private addToPlayLog(message: string): void {
        // Format the ball number at the start of the message if it exists
        const ballNumberRegex = /^(\d+)\.(\d+):/;
        const match = message.match(ballNumberRegex);
        if (match?.[0]) {
            // Replace the ball number with the correct format
            message = `${this.currentOvers}.${this.currentBalls}: ${message.substring(match[0].length).trim()}`;
        }
        this.playLog.push(message);
    }

    private addToScorecard(
        batterId: number,
        runs: number,
        isWide: boolean = false,
        isNoBall: boolean = false,
        isLegBye: boolean = false,
        isDot: boolean = false,
        isOut: boolean = false,
        dismissalType?: Dismissal,
        bowlerId?: number
    ) {
        // Create new stats object for second innings if needed
        if (this.innings === 2) {
            if (!this.scorecard[batterId] || this.scorecard[batterId].innings === 1) {
                this.scorecard[batterId] = {
                    ...this.scorecard[batterId],
                    innings: 2,
                    ballsFaced: 0,
                    runsScored: 0,
                    foursScored: 0,
                    sixesScored: 0,
                    balls: 0,
                    runs: 0,
                    wickets: 0,
                    maidens: 0,
                    noBalls: 0,
                    wides: 0,
                    byes: 0,
                    dotBalls: 0,
                    catches: 0,
                    runouts: 0,
                    stumpings: 0,
                    missedCatches: 0,
                    missedRunOuts: 0,
                    missedStumpings: 0,
                    dismissalType: undefined,
                    bowlerId: undefined,
                    fielderId: undefined
                };
            }
            if (bowlerId && (!this.scorecard[bowlerId] || this.scorecard[bowlerId].innings === 1)) {
                this.scorecard[bowlerId] = {
                    ...this.scorecard[bowlerId],
                    innings: 2,
                    ballsFaced: 0,
                    runsScored: 0,
                    foursScored: 0,
                    sixesScored: 0,
                    balls: 0,
                    runs: 0,
                    wickets: 0,
                    maidens: 0,
                    noBalls: 0,
                    wides: 0,
                    byes: 0,
                    dotBalls: 0,
                    catches: 0,
                    runouts: 0,
                    stumpings: 0,
                    missedCatches: 0,
                    missedRunOuts: 0,
                    missedStumpings: 0,
                    dismissalType: undefined,
                    bowlerId: undefined,
                    fielderId: undefined
                };
            }
        }

        const batterStats = this.scorecard[batterId];
        const bowlerStats = bowlerId ? this.scorecard[bowlerId] : undefined;

        // Update batter stats
        if (!isWide) {
            batterStats.ballsFaced++;
            if (!isLegBye) {
                batterStats.runsScored += runs;
                if (runs === 4) batterStats.foursScored++;
                if (runs === 6) batterStats.sixesScored++;
            }
        }

        // Update bowler stats
        if (bowlerStats) {
            if (!isWide && !isNoBall) bowlerStats.balls++;
            if (isWide) bowlerStats.wides++;
            if (isNoBall) bowlerStats.noBalls++;
            if (isLegBye) bowlerStats.byes++;
            if (isDot) bowlerStats.dotBalls++;
            bowlerStats.runs += runs;
            if (isOut) bowlerStats.wickets++;
        }

        // Update dismissal info
        if (isOut) {
            batterStats.dismissalType = dismissalType;
            batterStats.bowlerId = bowlerId;
        }
    }

    private getStadium(stadiumId: number): Stadium {
        const stadium = this.stadiums.find(s => s.id === stadiumId);
        if (!stadium) throw new Error(`Stadium ${stadiumId} not found`);
        return stadium;
    }

    private applyConsistencyAdjustments(): void {
        for (const player of this.players) {
            const latestRating = player.playerRatings[player.playerRatings.length - 1];
            const consistency = latestRating.consistency;
            
            // Higher consistency means less variance
            // Max variance at 0 consistency = ±30%, Min variance at 100 consistency = ±5%
            const maxVariance = 0.30 * (1 - consistency / 100) + 0.05;
            
            // Generate random adjustment, biased towards negative
            // 30% chance of positive adjustment, 70% chance of negative
            const isPositive = Math.random() < 0.3;
            const randomFactor = Math.random() * maxVariance;
            const adjustment = isPositive ? randomFactor : -randomFactor;
            
            // Store the adjustment percentage for this player
            this.gameRatingAdjustments.set(player.id, adjustment);
        }
    }

    private getAdjustedRating(playerId: number, rating: number): number {
        const adjustment = this.gameRatingAdjustments.get(playerId) || 0;
        return Math.max(0, Math.min(100, rating * (1 + adjustment)));
    }

    private getFatigueFactor(player: Player, adjustedFitness: number): number {
        const ballsFaced = this.batterBallsFaced.get(player.id) || 0;
        const oversBowled = this.bowlerOvers.get(player.id) || 0;
        
        // Base fatigue increases with balls faced/overs bowled
        const baseFatigue = Math.min(0.3, (ballsFaced / 30) * 0.15 + (oversBowled / 4) * 0.15);
        
        // Higher fitness reduces fatigue impact
        const fitnessModifier = Math.pow((adjustedFitness + 50) / 150, 2);
        
        // Final fatigue factor (1 = no fatigue, lower = more fatigue)
        return Math.max(0.7, 1 - (baseFatigue * (1 - fitnessModifier)));
    }

    private getTeamFieldingRating(team: TeamGameData): number {
        // Get average fielding rating of all fielders, adjusted for fatigue and consistency
        const fieldingRatings = team.battingLineup.map(id => {
            const player = this.getPlayer(id);
            const latestRating = player.playerRatings[player.playerRatings.length - 1];
            const adjustedFielding = this.getAdjustedRating(player.id, latestRating.fielding);
            const fatigueFactor = this.getFatigueFactor(player, latestRating.fitness);
            return adjustedFielding * fatigueFactor;
        });

        return fieldingRatings.reduce((sum, rating) => sum + rating, 0) / fieldingRatings.length;
    }

    // Add helper method to select fielder based on event type
    private selectFielder(eventType: 'catch' | 'runout' | 'stumping' | 'misfield'): { fielder?: Player, position?: string } {
        if (eventType === 'stumping') {
            // For stumpings, only select the wicketkeeper
            const keeper = this.players.find(p => 
                this.bowlingTeam.battingLineup.includes(p.id) && 
                p.wicketKeeper
            );
            return { fielder: keeper, position: 'behind the stumps' };
        }

        // Get all players from bowling team except current bowler
        const availableFielders = this.players.filter(p => 
            this.bowlingTeam.battingLineup.includes(p.id) && 
            p.id !== this.bowlingTeam.bowlingOrder[this.overs]
        );

        if (!availableFielders.length) return { fielder: undefined };

        // For catches, assign specific fielding positions with different probabilities
        if (eventType === 'catch') {
            const positions = [
                { name: 'slip', probability: 0.2 },
                { name: 'gully', probability: 0.1 },
                { name: 'point', probability: 0.1 },
                { name: 'cover', probability: 0.1 },
                { name: 'mid-off', probability: 0.05 },
                { name: 'mid-on', probability: 0.05 },
                { name: 'midwicket', probability: 0.1 },
                { name: 'square leg', probability: 0.1 },
                { name: 'fine leg', probability: 0.05 },
                { name: 'long-off', probability: 0.05 },
                { name: 'long-on', probability: 0.05 },
                { name: 'deep midwicket', probability: 0.05 }
            ];

            // Select a random position based on probabilities
            const roll = Math.random();
            let cumulativeProbability = 0;
            const selectedPosition = positions.find(pos => {
                cumulativeProbability += pos.probability;
                return roll <= cumulativeProbability;
            });

            // Get current fielding ratings
            const fieldingRatings = availableFielders.map(p => 
                this.getAdjustedRating(p.id, p.playerRatings[p.playerRatings.length - 1].fielding)
            );

            // Sort fielders by their fielding rating while keeping original indices
            const sortedIndices = fieldingRatings
                .map((rating, index) => ({ rating, index }))
                .sort((a, b) => b.rating - a.rating)
                .map(item => item.index);

            // Select one of the top 3 fielders for the position
            const selectedFielderIndex = sortedIndices[Math.floor(Math.random() * Math.min(3, sortedIndices.length))];
            return { 
                fielder: availableFielders[selectedFielderIndex], 
                position: selectedPosition?.name 
            };
        }

        // For run outs and misfields, use the existing logic
        const fieldingRatings = availableFielders.map(p => 
            this.getAdjustedRating(p.id, p.playerRatings[p.playerRatings.length - 1].fielding)
        );

        // Sort fielders by their fielding rating while keeping original indices
        const sortedIndices = fieldingRatings
            .map((rating, index) => ({ rating, index }))
            .sort((a, b) => b.rating - a.rating)
            .map(item => item.index);

        const sortedFielders = sortedIndices.map(i => availableFielders[i]);
        const sortedRatings = sortedIndices.map(i => fieldingRatings[i]);

        // Different weights based on event type
        let weights: number[];
        switch (eventType) {
            case 'runout':
                // Better fielders slightly more likely for run outs
                weights = sortedRatings.map(rating => Math.pow(rating / 50, 1.2));
                break;
            case 'misfield':
                // Worse fielders more likely for misfields
                weights = sortedRatings.map(rating => Math.pow((100 - rating) / 50, 1.3));
                break;
            default:
                weights = sortedRatings.map(rating => rating / 50);
        }

        // Convert to cumulative probabilities
        for (let i = 1; i < weights.length; i++) {
            weights[i] += weights[i - 1];
        }

        // Normalize weights
        const totalWeight = weights[weights.length - 1];
        weights = weights.map(w => w / totalWeight);

        // Select fielder
        const roll = Math.random();
        const selectedIndex = weights.findIndex(w => w > roll);
        return { 
            fielder: sortedFielders[selectedIndex === -1 ? sortedFielders.length - 1 : selectedIndex]
        };
    }

    // Update simulateFieldingEvent to handle the new return type from selectFielder
    private simulateFieldingEvent(batter: Player, bowler: Player, eventType: 'catch' | 'runout' | 'stumping' | 'misfield'): { success: boolean, fielder?: Player, runs?: number, position?: string } {
        const { fielder, position } = this.selectFielder(eventType);
        if (!fielder) return { success: false };

        // Get adjusted fielding rating
        const fielderRating = this.getAdjustedRating(fielder.id, fielder.playerRatings[fielder.playerRatings.length - 1].fielding);
        let baseSuccessRate: number;
        
        switch (eventType) {
            case 'catch':
                baseSuccessRate = 0.85;
                break;
            case 'runout':
                baseSuccessRate = 0.4;
                break;
            case 'stumping':
                baseSuccessRate = fielder.wicketKeeper ? 0.7 : 0; // Only wicketkeepers can stump
                break;
            case 'misfield':
                baseSuccessRate = 0.92;
                break;
            default:
                return { success: false };
        }

        // Adjust success rate based on fielder rating - stronger influence for misfields
        const adjustedSuccessRate = eventType === 'misfield' ?
            baseSuccessRate * Math.pow(fielderRating / 50, 0.3) :
            baseSuccessRate * Math.pow(fielderRating / 50, 0.7);
        
        const success = Math.random() < adjustedSuccessRate;

        // For misfields and failed run outs, calculate extra runs
        let runs = 0;
        if (!success && (eventType === 'misfield' || eventType === 'runout')) {
            runs = Math.floor(Math.random() * 3) + 1;
        }

        // Update fielder's stats if they exist in the scorecard
        if (fielder && this.scorecard[fielder.id]) {
            const fielderStats = this.scorecard[fielder.id];
            if (success) {
                if (eventType === 'catch') fielderStats.catches++;
                if (eventType === 'runout') fielderStats.runouts++;
                if (eventType === 'stumping') fielderStats.stumpings++;
            } else {
                if (eventType === 'catch') fielderStats.missedCatches++;
                if (eventType === 'runout') fielderStats.missedRunOuts++;
                if (eventType === 'stumping') fielderStats.missedStumpings++;
            }
        }

        return { success, fielder, runs, position };
    }

    private runPlay(batter: Player, bowler: Player, homeAdvantage: number): boolean {
        const balls = `${this.overs}.${this.balls + 1}`;
        const playIntro = `(${bowler.name} to ${batter.name})`;

        // Get team fielding rating and calculate fielding factor
        const fieldingRating = this.getTeamFieldingRating(this.bowlingTeam);
        const fieldingFactor = Math.pow(fieldingRating / 50, 0.5);

        // Base play probabilities
        
        const playTypeOdds = [0.03182, 0.016400675, 0.003987089, 0.604390266, 0.039336044, 0.38569238];
        const overFactor = (((this.overs + 1 / 20) / 20) + 3) / 3;
        const ppFactor = this.overs < 6 ? 1.3 : 0.9;
        
        const latestBowlerRating = bowler.playerRatings[bowler.playerRatings.length - 1];
        const latestBatterRating = batter.playerRatings[batter.playerRatings.length - 1];

        // Apply consistency adjustments to ratings
        const adjustedBatterPower = this.getAdjustedRating(batter.id, latestBatterRating.power);
        const adjustedBatterTechnical = this.getAdjustedRating(batter.id, latestBatterRating.technical);
        const adjustedBatterTemperament = this.getAdjustedRating(batter.id, latestBatterRating.temperament);
        const adjustedBatterFitness = this.getAdjustedRating(batter.id, latestBatterRating.fitness);

        const adjustedBowlerEconomy = this.getAdjustedRating(bowler.id, latestBowlerRating.economy);
        const adjustedBowlerControl = this.getAdjustedRating(bowler.id, latestBowlerRating.control);
        const adjustedBowlerWicketTaking = this.getAdjustedRating(bowler.id, latestBowlerRating.wicketTaking);
        const adjustedBowlerClutch = this.getAdjustedRating(bowler.id, latestBowlerRating.clutch);
        const adjustedBowlerFitness = this.getAdjustedRating(bowler.id, latestBowlerRating.fitness);

        // Get fatigue factors
        const batterFatigueFactor = this.getFatigueFactor(batter, adjustedBatterFitness);
        const bowlerFatigueFactor = this.getFatigueFactor(bowler, adjustedBowlerFitness);

        // Apply fatigue to adjusted ratings
        const fatigueAdjustedBatterPower = adjustedBatterPower * batterFatigueFactor;
        const fatigueAdjustedBatterTechnical = adjustedBatterTechnical * batterFatigueFactor;
        const fatigueAdjustedBatterTemperament = adjustedBatterTemperament * batterFatigueFactor;

        const fatigueAdjustedBowlerEconomy = adjustedBowlerEconomy * bowlerFatigueFactor;
        const fatigueAdjustedBowlerControl = adjustedBowlerControl * bowlerFatigueFactor;
        const fatigueAdjustedBowlerWicketTaking = adjustedBowlerWicketTaking * bowlerFatigueFactor;

        // Stadium effects
        const stadium = this.getStadium(this.battingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium);
        const battingFriendlyFactor = stadium.battingFriendly / 50; // 1 is neutral, >1 favors batting, <1 favors bowling

        // Pitch type effects
        let pitchFactor = 1;
        switch (stadium.pitchType) {
            case PitchType.GREEN:
                pitchFactor = bowler.bowlingStyle === BowlingStyle.FAST || 
                             bowler.bowlingStyle === BowlingStyle.FAST_MEDIUM ||
                             bowler.bowlingStyle === BowlingStyle.SWING ||
                             bowler.bowlingStyle === BowlingStyle.SEAM ? 1.2 : 0.9;
                break;
            case PitchType.DUSTY:
                pitchFactor = bowler.bowlingStyle === BowlingStyle.OFF_SPIN || 
                             bowler.bowlingStyle === BowlingStyle.LEG_SPIN ? 1.2 : 0.9;
                break;
            case PitchType.FLAT:
                pitchFactor = 1.1; // Slightly favors batting
                break;
            case PitchType.DRY:
                pitchFactor = bowler.bowlingStyle === BowlingStyle.FINGER_SPIN || 
                             bowler.bowlingStyle === BowlingStyle.CHINAMAN ? 1.15 : 0.95;
                break;
        }

        // Boundary size effects on scoring
        const boundarySizeFactor = {
            [BoundarySize.SMALL]: 1.2,
            [BoundarySize.MEDIUM]: 1.0,
            [BoundarySize.LARGE]: 0.8,
            [BoundarySize.VERY_LARGE]: 0.7
        }[stadium.boundarySize];

        // Batting style effects
        let battingStyleFactor = 1;
        switch (batter.battingStyle) {
            case BattingStyle.AGGRESSIVE:
                battingStyleFactor = this.overs < 6 ? 1.2 : 1.1;
                playTypeOdds[3] *= 0.9; // Less likely to take singles
                playTypeOdds[4] *= 1.2; // More likely to get out
                playTypeOdds[5] *= 1.2; // More dot balls
                break;
            case BattingStyle.DEFENSIVE:
                battingStyleFactor = 0.8;
                playTypeOdds[3] *= 1.2; // More likely to take singles
                playTypeOdds[4] *= 0.6; // Less likely to get out
                playTypeOdds[5] *= 1.3; // More dot balls
                break;
            case BattingStyle.POWER_HITTER:
                battingStyleFactor = 1.3;
                playTypeOdds[3] *= 0.6; // Less likely to take singles
                playTypeOdds[4] *= 1.4; // More likely to get out
                playTypeOdds[5] *= 1.5; // More dot balls
                break;
            case BattingStyle.TECHNICAL:
                playTypeOdds[0] *= 1.5 // More likely to get wide
                playTypeOdds[4] *= 0.95; // Much less likely to get out
                playTypeOdds[5] *= 0.8 // Less likely to get dot balls
                playTypeOdds[3] *= 1.4; // More likely to take singles
                break;
            case BattingStyle.ANCHOR:
                battingStyleFactor = 0.9;
                playTypeOdds[4] *= 0.8; // Very unlikely to get out
                playTypeOdds[5] *= 1.2; // More dot balls
                playTypeOdds[3] *= 1.2; // More likely to take singles
                break;
            case BattingStyle.FINISHER:
                battingStyleFactor = this.overs > 15 ? 1.5 : 1;
                playTypeOdds[4] *= 1.3; // More likely to get out due to aggressive play
                playTypeOdds[5] *= 0.7; // Less dot balls as they look to score
                playTypeOdds[3] *= 0.8; // Less likely to take singles
                if (this.overs > 15) {
                    playTypeOdds[3] *= 0.6; // Even less singles in death overs
                }
                break;
            case BattingStyle.STRIKE_ROTATOR:
                playTypeOdds[3] *= 1.2; // Much more likely to take singles
                break;
        }

        // Bowling style effects
        let bowlingStyleFactor = 1;
        switch (bowler.bowlingStyle) {
            case BowlingStyle.FAST:
                bowlingStyleFactor = this.overs < 6 ? 1.2 : 1.1;
                playTypeOdds[4] *= 1.1; // More likely to get wickets
                break;
            case BowlingStyle.FAST_MEDIUM:
                bowlingStyleFactor = 1.1;
                break;
            case BowlingStyle.SWING:
                playTypeOdds[4] *= this.overs < 6 ? 1.2 : 1.0; // More wickets in powerplay
                break;
            case BowlingStyle.SEAM:
                bowlingStyleFactor = 1.05;
                playTypeOdds[5] *= 1.1; // More dot balls
                break;
            case BowlingStyle.OFF_SPIN:
            case BowlingStyle.LEG_SPIN:
                bowlingStyleFactor = this.overs > 6 ? 1.15 : 0.9;
                break;
            case BowlingStyle.CHINAMAN:
            case BowlingStyle.FINGER_SPIN:
                bowlingStyleFactor = this.overs > 6 ? 1.1 : 0.95;
                break;
        }

        // Handedness matchup effects
        const isHandednessAdvantage = (batter.hand === Hand.LEFT_HANDED && 
            (bowler.bowlingStyle === BowlingStyle.OFF_SPIN || bowler.bowlingStyle === BowlingStyle.FINGER_SPIN)) ||
            (batter.hand === Hand.RIGHT_HANDED && 
            (bowler.bowlingStyle === BowlingStyle.LEG_SPIN || bowler.bowlingStyle === BowlingStyle.CHINAMAN));
        
        const handednessMatchupFactor = isHandednessAdvantage ? 1.1 : 0.9;

        // Enhanced home advantage
        const homeTeamAdvantage = this.battingTeam === this.homeTeam ? homeAdvantage : 1;
        const ratingBoost = this.battingTeam === this.homeTeam ? 5 : 0;

        // Adjust probabilities based on all factors including fatigue
        const clutchFactor = Math.pow(((adjustedBowlerClutch + 1) / 110), Math.pow((this.overs / 20), 5));
        const fatigueFactor = Math.pow((adjustedBowlerFitness + ratingBoost) / 100, 0.5) * bowlerFatigueFactor;

        // Adjust play type odds using fatigue-adjusted ratings
        playTypeOdds[0] = clutchFactor * playTypeOdds[0] * 
            (Math.pow((fatigueAdjustedBatterTemperament / 100.0), 1) * 
            (50 / ((fatigueAdjustedBowlerControl + ratingBoost) + 1)));

        playTypeOdds[2] = (1 / homeTeamAdvantage) * playTypeOdds[2] * 
            (50 / ((fatigueAdjustedBowlerControl + ratingBoost) + 1));

        playTypeOdds[3] = (1 / homeTeamAdvantage) * 0.9 * (1 / clutchFactor) * overFactor * playTypeOdds[3] * 
            Math.pow((((fatigueAdjustedBatterTechnical + ratingBoost) * 0.7) + 
            (fatigueAdjustedBatterTemperament + ratingBoost) * 0.3) / 
            (fatigueAdjustedBowlerEconomy + 0.01), 0.8) * 
            battingStyleFactor * bowlingStyleFactor * handednessMatchupFactor * 
            battingFriendlyFactor * pitchFactor * batterFatigueFactor;
        
        playTypeOdds[4] = ppFactor * Math.pow(homeTeamAdvantage, 0.5) * clutchFactor * fatigueFactor * 
            overFactor * playTypeOdds[4] * 
            Math.pow(((50 + ((fatigueAdjustedBowlerWicketTaking + ratingBoost) - 50) / 2) / 
            (((fatigueAdjustedBatterTemperament + ratingBoost) * 0.5) + 
            ((fatigueAdjustedBatterTechnical + ratingBoost) * 0.4) + 
            ((fatigueAdjustedBatterPower + ratingBoost) * 0.1))), 0.7) * 
            (1 / battingStyleFactor) * bowlingStyleFactor * (1 / handednessMatchupFactor) * 
            (1 / battingFriendlyFactor) * pitchFactor;
        
        playTypeOdds[5] = clutchFactor * homeTeamAdvantage * (1 / overFactor) * playTypeOdds[5] * 
            Math.pow(((fatigueAdjustedBowlerEconomy + ratingBoost) + 1) / 
            (((fatigueAdjustedBatterTechnical + ratingBoost) * 0.7) + 
            ((fatigueAdjustedBatterTemperament + ratingBoost) * 0.3)), 0.5) * 
            (1 / battingStyleFactor) * bowlingStyleFactor;

        // Convert to cumulative probabilities
        for (let i = 1; i < playTypeOdds.length; i++) {
            playTypeOdds[i] += playTypeOdds[i - 1];
        }

        const playDeterminer = Math.random();
        let playResult = playTypeOdds.findIndex(p => p > playDeterminer);
        if (playResult === -1) playResult = playTypeOdds.length - 1;

        // Helper function to handle wicket
        const handleWicket = (dismissalType: Dismissal, bowlerId: number, batter: Player) => {
            this.wickets++;
            // Get the next batter's index
            const nextBatterIndex = this.wickets + 1;
            
            // Check if we have enough batters left
            if (nextBatterIndex >= 11) {
                // All out - remove the current batter
                this.batters = [this.batters[this.nonStrikerIndex]];
                this.strikerIndex = 0;
                this.nonStrikerIndex = -1; // No non-striker when all out
            } else {
                // Keep non-striker in place and add new batter as striker
                this.batters[this.strikerIndex] = nextBatterIndex;
            }
            
            // Update scorecard
            this.addToScorecard(batter.id, 0, false, false, false, false, true, dismissalType, bowlerId);
        };

        // Handle different play outcomes
        switch (playResult) {
            case 0: // Wide
                const wideOdds = [0.939525, 0.982078, 0.990774, 0, 1];
                const wideResult = wideOdds.findIndex(p => p > Math.random());
                // Chance for misfield on wide
                const { success: wideFielded, runs: extraWides } = this.simulateFieldingEvent(batter, bowler, 'misfield');
                const totalWides = wideResult + 1 + (wideFielded ? 0 : (extraWides || 0));
                this.score += totalWides;
                this.addToPlayLog(`${balls} ${playIntro} ${totalWides} wide runs${!wideFielded ? ' (misfield)' : ''}`);
                this.addToScorecard(batter.id, totalWides, true, false, false, false, false, undefined, bowler.id);
                return false;

            case 1: // Leg Bye
                const legByeOdds = [0.870957, 0.917944, 0.923732, 0.998638367, 1];
                const legByeResult = legByeOdds.findIndex(p => p > Math.random());
                // Chance for misfield on leg bye
                const { success: legByeFielded, runs: extraLegByes } = this.simulateFieldingEvent(batter, bowler, 'misfield');
                const totalLegByes = legByeResult + 1 + (legByeFielded ? 0 : (extraLegByes || 0));
                this.score += totalLegByes;
                this.addToPlayLog(`${balls} ${playIntro} ${totalLegByes} leg bye runs${!legByeFielded ? ' (misfield)' : ''}`);
                this.addToScorecard(batter.id, totalLegByes, false, false, true, false, false, undefined, bowler.id);
                return true;

            case 2: // No Ball
                this.score += 1;
                this.addToPlayLog(`${balls} ${playIntro} NO BALL`);
                this.addToScorecard(batter.id, 1, false, true, false, false, false, undefined, bowler.id);
                return false;

            case 3: // Batting Runs
                // Calculate boundary odds with fielding factor
                const boundaryOdds = ppFactor * Math.pow((1 / homeTeamAdvantage), 0.5) * 0.263894 * 
                    Math.pow(((((50 + ((fatigueAdjustedBatterPower + ratingBoost) - 50) / 2 + 1) / 50) + 
                    (50 / ((fatigueAdjustedBowlerEconomy + ratingBoost) + 1))) / 2), 0.1) * 
                    boundarySizeFactor * battingStyleFactor * batterFatigueFactor;

                // Modify boundary odds based on fielding
                const modifiedBoundaryOdds = boundaryOdds * (1 - (fieldingFactor - 1) * 0.15);

                if (Math.random() > modifiedBoundaryOdds) {
                    // Running runs with fielding influence
                    const runningRunsOdds = [0.84764, 0.144, 0.007369, 0, 0.000991].map(
                        p => p * (50 / ((adjustedBatterFitness * batterFatigueFactor + ratingBoost) + 1)) *
                            (1 - (fieldingFactor - 1) * 0.15)
                    );
                    for (let i = 1; i < runningRunsOdds.length; i++) {
                        runningRunsOdds[i] += runningRunsOdds[i - 1];
                    }
                    const runningRunsResult = runningRunsOdds.findIndex(p => p > Math.random());
                    if (runningRunsResult === -1) return false;
                    
                    const runOutChance = 0.02 * (runningRunsResult + 1) * (fieldingFactor || 1);
                    
                    if (Math.random() < runOutChance) {
                        const fieldingResult = this.simulateFieldingEvent(batter, bowler, 'runout');
                        const { success, fielder, runs: overthrows } = fieldingResult || { success: false, fielder: null, runs: 0 };
                        
                        if (success && fielder?.name) {
                            this.addToPlayLog(`${balls} ${playIntro} RUN OUT by ${fielder.name}!`);
                            handleWicket(Dismissal.RUN_OUT, bowler.id, batter);
                        } else {
                            const totalRuns = (runningRunsResult + 1) + (overthrows || 0);
                            this.score += totalRuns;
                            this.addToPlayLog(`${balls} ${playIntro} ${totalRuns} runs${overthrows ? ' (including overthrows)' : ''}`);
                            this.addToScorecard(batter.id, totalRuns, false, false, false, false, false, undefined, bowler.id);
                        }
                    } else {
                        const totalRuns = runningRunsResult + 1;
                        this.score += totalRuns;
                        this.addToPlayLog(`${balls} ${playIntro} ${totalRuns} runs`);
                        this.addToScorecard(batter.id, totalRuns, false, false, false, false, false, undefined, bowler.id);
                    }
                } else {
                    // Boundary attempt with reduced misfield influence
                    const shouldCheckMisfield = Math.random() < 0.1;
                    if (shouldCheckMisfield) {
                        const { success: boundaryFielded } = this.simulateFieldingEvent(batter, bowler, 'misfield');
                        if (boundaryFielded && Math.random() < fieldingFactor * 0.3) {
                            // Great fielding saves boundary
                            const savedRuns = Math.floor(Math.random() * 3) + 1;
                            this.score += savedRuns;
                            this.addToPlayLog(`${balls} ${playIntro} ${savedRuns} runs (boundary saved)`);
                            this.addToScorecard(batter.id, savedRuns, false, false, false, false, false, undefined, bowler.id);
                        } else {
                            // Normal boundary code
                            const battingRuns6Odds = Math.pow((1 / homeTeamAdvantage), 0.5) * 0.286044 * 
                                Math.pow((((fatigueAdjustedBatterPower + ratingBoost) / 50) + 
                                (50 / (fatigueAdjustedBowlerEconomy + ratingBoost))) / 2, 0.5) * 
                                boundarySizeFactor * battingStyleFactor * Math.pow(batterFatigueFactor, 0.5) *
                                (1 - ((fieldingFactor || 1) - 1) * 0.1);
                            
                            if (battingRuns6Odds !== undefined && Math.random() > battingRuns6Odds) {
                                this.score += 4;
                                this.addToScorecard(batter.id, 4, false, false, false, false, false, undefined, bowler.id);
                                this.addToPlayLog(`${balls} ${playIntro} FOUR!`);
                            } else {
                                this.score += 6;
                                this.addToPlayLog(`${balls} ${playIntro} SIX!`);
                                this.addToScorecard(batter.id, 6, false, false, false, false, false, undefined, bowler.id);
                            }
                        }
                    } else {
                        // Normal boundary code without misfield check
                        const battingRuns6Odds = Math.pow((1 / homeTeamAdvantage), 0.5) * 0.286044 * 
                            Math.pow((((fatigueAdjustedBatterPower + ratingBoost) / 50) + 
                            (50 / (fatigueAdjustedBowlerEconomy + ratingBoost))) / 2, 0.5) * 
                            boundarySizeFactor * battingStyleFactor * Math.pow(batterFatigueFactor, 0.5) *
                            (1 - ((fieldingFactor || 1) - 1) * 0.1);
                        
                        if (battingRuns6Odds !== undefined && Math.random() > battingRuns6Odds) {
                            this.score += 4;
                            this.addToScorecard(batter.id, 4, false, false, false, false, false, undefined, bowler.id);
                            this.addToPlayLog(`${balls} ${playIntro} FOUR!`);
                        } else {
                            this.score += 6;
                            this.addToPlayLog(`${balls} ${playIntro} SIX!`);
                            this.addToScorecard(batter.id, 6, false, false, false, false, false, undefined, bowler.id);
                        }
                    }
                }
                return true;

            case 4: // Wicket
                // Determine dismissal type
                const dismissalOdds = {
                    [Dismissal.BOWLED]: 0.3,
                    [Dismissal.CAUGHT]: 0.4,
                    [Dismissal.LBW]: 0.2,
                    [Dismissal.STUMPED]: 0.1
                };

                let dismissalType = Dismissal.BOWLED;
                const dismissalRoll = Math.random();
                let cumulative = 0;
                for (const [type, chance] of Object.entries(dismissalOdds)) {
                    cumulative += chance;
                    if (dismissalRoll < cumulative) {
                        dismissalType = type as Dismissal;
                        break;
                    }
                }

                // Handle different dismissal types
                switch (dismissalType) {
                    case Dismissal.CAUGHT: {
                        const { success, fielder, position } = this.simulateFieldingEvent(batter, bowler, 'catch');
                        if (success && fielder) {
                            this.addToPlayLog(`${balls} ${playIntro} CAUGHT by ${fielder.name} at ${position}!`);
                            handleWicket(Dismissal.CAUGHT, bowler.id, batter);
                        } else {
                            // Dropped catch - chance for runs
                            const dropRuns = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
                            if (dropRuns > 0) {
                                this.score += dropRuns;
                                this.addToPlayLog(`${balls} ${playIntro} DROPPED${fielder ? ` by ${fielder.name}` : ''}${position ? ` at ${position}` : ''}! ${dropRuns} runs`);
                                this.addToScorecard(batter.id, dropRuns, false, false, false, false, false, undefined, bowler.id);
                            } else {
                                this.addToPlayLog(`${balls} ${playIntro} DROPPED${fielder ? ` by ${fielder.name}` : ''}${position ? ` at ${position}` : ''}!`);
                                this.addToScorecard(batter.id, 0, false, false, false, false, false, undefined, bowler.id);
                            }
                        }
                        break;
                    }
                    case Dismissal.STUMPED: {
                        const { success, fielder } = this.simulateFieldingEvent(batter, bowler, 'stumping');
                        if (success && fielder) {
                            this.addToPlayLog(`${balls} ${playIntro} STUMPED by ${fielder.name}!`);
                            handleWicket(Dismissal.STUMPED, bowler.id, batter);
                        } else {
                            // Failed stumping - chance for byes
                            const byeRuns = Math.random() < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0;
                            if (byeRuns > 0) {
                                this.score += byeRuns;
                                this.addToPlayLog(`${balls} ${playIntro} Missed stumping${fielder ? ` by ${fielder.name}` : ''}! ${byeRuns} byes`);
                                this.addToScorecard(batter.id, byeRuns, false, false, false, false, false, undefined, bowler.id);
                            } else {
                                this.addToPlayLog(`${balls} ${playIntro} Missed stumping${fielder ? ` by ${fielder.name}` : ''}!`);
                                this.addToScorecard(batter.id, 0, false, false, false, false, false, undefined, bowler.id);
                            }
                        }
                        break;
                    }
                    default:
                        this.addToPlayLog(`${balls} ${playIntro} ${dismissalType}!`);
                        handleWicket(dismissalType, bowler.id, batter);
                        break;
                }
                return true;

            case 5: // Dot Ball
                this.addToPlayLog(`${balls} ${playIntro} dot ball`);
                this.addToScorecard(batter.id, 0, false, false, false, true, false, undefined, bowler.id);
                return true;
        }
        return true;
    }

    public runGame(): void {
        // First innings
        this.batters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.strikerIndex = 0;
        this.nonStrikerIndex = 1;
        this.score = 0;
        this.wickets = 0;

        while (this.overs < 20 && this.batters.length > 1) {
            const batterID = this.battingTeam.battingLineup[this.batters[this.strikerIndex]];
            const bowlerID = this.bowlingTeam.bowlingOrder[this.overs];
            this.runPlay(
                this.getPlayer(batterID),
                this.getPlayer(bowlerID),
                1 + (this.homeTeam.homeAdvantage - 1) / 2
            );

            this.balls++;
            if (this.balls > 5) {
                this.handleEndOfOver();
            }
        }

        // Store first innings score
        this.innings1Score = this.score;
        this.innings1Wickets = this.wickets;
        this.innings1Balls = this.overs * 6 + this.balls;

        // Switch teams for second innings
        const tempVar = this.bowlingTeam;
        this.bowlingTeam = this.battingTeam;
        this.battingTeam = tempVar;

        // Reset for second innings
        this.batters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.strikerIndex = 0;
        this.nonStrikerIndex = 1;
        this.score = 0;
        this.wickets = 0;
        this.innings = 2;
        this.overs = 0;
        this.balls = 0;

        // Second innings
        while (this.overs < 20 && this.batters.length > 1 && this.innings1Score >= this.score) {
            const batterID = this.battingTeam.battingLineup[this.batters[this.strikerIndex]];
            const bowlerID = this.bowlingTeam.bowlingOrder[this.overs];
            this.runPlay(
                this.getPlayer(batterID),
                this.getPlayer(bowlerID),
                1 + (this.homeTeam.homeAdvantage - 1) / 2
            );

            this.balls++;
            if (this.balls > 5) {
                this.handleEndOfOver();
            }
        }

        // Determine winner
        if (this.innings1Score > this.score) {
            this.winningTeamID = this.bowlingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium;
        } else {
            this.winningTeamID = this.battingTeam === this.homeTeam ? this.homeTeam.stadium : this.awayTeam.stadium;
        }

        // Update player stats
        this.savePlayerStats();
    }

    private savePlayerStats(): void {
        // Convert game stats to player stats
        for (const playerId in this.scorecard) {
            const stats = this.scorecard[playerId];
            const player = this.getPlayer(stats.playerID);

            // Determine which team the player belongs to by checking batting lineup
            const isHomeTeamPlayer = this.homeTeam.battingLineup.includes(player.id);
            const currentTeamId = isHomeTeamPlayer ? this.homeTeam.stadium : this.awayTeam.stadium;
            const opposingTeamId = isHomeTeamPlayer ? this.awayTeam.stadium : this.homeTeam.stadium;

            // Add game stats to player history
            player.playerStats.push(new PlayerStats(
                this.innings1Score,  // Using innings1Score as gameId for now
                0,  // season_id
                currentTeamId,  // Current team ID (using stadium ID)
                opposingTeamId,  // Opposing team ID (using stadium ID)
                new BattingStats(
                    stats.runsScored,
                    stats.ballsFaced,
                    stats.foursScored,
                    stats.sixesScored
                ),
                new BowlingStats(
                    stats.runs,
                    stats.balls,
                    stats.maidens,
                    stats.wickets,
                    stats.noBalls,
                    stats.wides,
                    stats.byes,
                    stats.dotBalls
                ),
                new FieldingStats(
                    stats.catches,
                    stats.runouts,
                    stats.stumpings,
                    stats.missedCatches,
                    stats.missedStumpings,
                    stats.missedRunOuts
                )
            ));
        }
    }

    public getScorecard(): { 
        firstInningsBatting: BattingScorecard[],
        firstInningsBowling: BowlingScorecard[],
        secondInningsBatting: BattingScorecard[],
        secondInningsBowling: BowlingScorecard[]
    } {
        const firstInningsBatting: BattingScorecard[] = [];
        const firstInningsBowling: BowlingScorecard[] = [];
        const secondInningsBatting: BattingScorecard[] = [];
        const secondInningsBowling: BowlingScorecard[] = [];

        // Determine which team batted first based on the current state
        const firstBattingTeam = this.innings === 1 ? this.battingTeam : this.bowlingTeam;
        const secondBattingTeam = this.innings === 1 ? this.bowlingTeam : this.battingTeam;

        // Process first innings batting
        firstBattingTeam.battingLineup.forEach(playerId => {
            const stats = Object.values(this.scorecard)
                .find(s => s.playerID === playerId && s.innings === 1);
            if (stats) {
                firstInningsBatting.push(new BattingScorecard(
                    playerId,
                    stats.runsScored || 0,
                    stats.ballsFaced,
                    stats.foursScored || 0,
                    stats.sixesScored || 0,
                    stats.dismissalType || null,
                    stats.bowlerId || null
                ));
            }
        });

        // Process second innings batting
        secondBattingTeam.battingLineup.forEach(playerId => {
            const stats = Object.values(this.scorecard)
                .find(s => s.playerID === playerId && s.innings === 2);
            if (stats) {
                secondInningsBatting.push(new BattingScorecard(
                    playerId,
                    stats.runsScored || 0,
                    stats.ballsFaced,
                    stats.foursScored || 0,
                    stats.sixesScored || 0,
                    stats.dismissalType || null,
                    stats.bowlerId || null
                ));
            }
        });

        // Process first innings bowling (second batting team bowled first)
        secondBattingTeam.bowlingOrder.forEach(playerId => {
            const stats = Object.values(this.scorecard)
                .find(s => s.playerID === playerId && s.innings === 1);
            if (stats && stats.balls > 0) {
                firstInningsBowling.push(new BowlingScorecard(
                    playerId,
                    stats.balls,
                    stats.runs || 0,
                    stats.wickets || 0,
                    stats.maidens || 0,
                    stats.wides || 0,
                    stats.noBalls || 0,
                    stats.byes || 0,
                    stats.dotBalls || 0
                ));
            }
        });

        // Process second innings bowling (first batting team bowled second)
        firstBattingTeam.bowlingOrder.forEach(playerId => {
            const stats = Object.values(this.scorecard)
                .find(s => s.playerID === playerId && s.innings === 2);
            if (stats && stats.balls > 0) {
                secondInningsBowling.push(new BowlingScorecard(
                    playerId,
                    stats.balls,
                    stats.runs || 0,
                    stats.wickets || 0,
                    stats.maidens || 0,
                    stats.wides || 0,
                    stats.noBalls || 0,
                    stats.byes || 0,
                    stats.dotBalls || 0
                ));
            }
        });

        return {
            firstInningsBatting,
            firstInningsBowling,
            secondInningsBatting,
            secondInningsBowling
        };
    }

    private initializeScorecard() {
        // Initialize scorecard for all players
        const allPlayers = [...this.homeTeam.battingLineup, ...this.awayTeam.battingLineup];
        for (const playerId of allPlayers) {
            this.scorecard[playerId] = {
                playerID: playerId,
                innings: 1,  // Start with first innings
                // Batting stats
                ballsFaced: 0,
                runsScored: 0,
                foursScored: 0,
                sixesScored: 0,
                // Bowling stats
                balls: 0,
                runs: 0,
                wickets: 0,
                maidens: 0,
                noBalls: 0,
                wides: 0,
                byes: 0,
                dotBalls: 0,
                // Fielding stats
                catches: 0,
                runouts: 0,
                stumpings: 0,
                missedCatches: 0,
                missedRunOuts: 0,
                missedStumpings: 0,
                // Dismissal info
                dismissalType: undefined,
                bowlerId: undefined,
                fielderId: undefined
            };
        }
    }

    // Helper function to handle wicket
    private handleWicket = (dismissalType: Dismissal, bowlerId: number, batter: Player) => {
        this.wickets++;
        // Get the next batter's index
        const nextBatterIndex = this.wickets + 1;
        
        // Check if we have enough batters left
        if (nextBatterIndex >= 11) {
            // All out - remove the current batter
            this.batters = [this.batters[this.nonStrikerIndex]];
            this.strikerIndex = 0;
            this.nonStrikerIndex = -1; // No non-striker when all out
        } else {
            // Keep non-striker in place and add new batter as striker
            this.batters[this.strikerIndex] = nextBatterIndex;
        }
        
        // Update scorecard
        this.addToScorecard(batter.id, 0, false, false, false, false, true, dismissalType, bowlerId);
    };

    // Helper function to handle end of over
    private handleEndOfOver() {
        this.overs++;
        this.addToPlayLog(`End of over ${this.overs} (${this.score}/${this.wickets})`);
        this.balls = 0;

        // Update bowler overs
        const currentBowlerId = this.bowlingTeam.bowlingOrder[this.overs - 1];
        const currentOvers = this.bowlerOvers.get(currentBowlerId) || 0;
        this.bowlerOvers.set(currentBowlerId, currentOvers + 1);

        // Swap striker and non-striker
        [this.strikerIndex, this.nonStrikerIndex] = [this.nonStrikerIndex, this.strikerIndex];
    }
} 