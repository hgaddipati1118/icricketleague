import { Player } from '../Player/Player';
import { TeamLineup } from './TeamLineup';
import { BowlingStyle } from '../Player/BowlingStyle';

export class LineupGenerator {
    static generateLineup(players: Player[]): TeamLineup {
        console.log('\n=== Lineup Generation Debug Info ===');

        // 1. Select best wicket keeper
        const wicketKeeper = this.selectBestWicketKeeper(players);
        if (!wicketKeeper) {
            throw new Error("No wicket keeper available");
        }
        console.log('\nSelected Wicket Keeper:', {
            id: wicketKeeper.id,
            name: wicketKeeper.name
        });

        // 2. Select all available bowlers from the team and sort by rating
        const allBowlers = players.filter(p => p.bowlingStyle !== BowlingStyle.NONE)
            .sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                return bRating.calcBowlingRating() - aRating.calcBowlingRating();
            });

        if (allBowlers.length < 5) {
            throw new Error("Not enough bowlers to create a valid lineup");
        }

        // Get the 5 best bowlers first
        const bestBowlers = allBowlers.slice(0, 5);
        
        // Separate pace and spin bowlers from the best 5
        const paceBowlers = bestBowlers.filter(b => 
            b.bowlingStyle === BowlingStyle.FAST || 
            b.bowlingStyle === BowlingStyle.FAST_MEDIUM || 
            b.bowlingStyle === BowlingStyle.SWING ||
            b.bowlingStyle === BowlingStyle.SEAM
        );
        const spinBowlers = bestBowlers.filter(b => 
            b.bowlingStyle === BowlingStyle.OFF_SPIN || 
            b.bowlingStyle === BowlingStyle.LEG_SPIN || 
            b.bowlingStyle === BowlingStyle.FINGER_SPIN ||
            b.bowlingStyle === BowlingStyle.CHINAMAN
        );

        // Check if we need additional bowlers for balance
        const remainingBowlers = allBowlers.slice(5);
        if (paceBowlers.length < 2) {
            // Add best remaining pace bowlers
            const additionalPace = remainingBowlers.filter(b => 
                b.bowlingStyle === BowlingStyle.FAST || 
                b.bowlingStyle === BowlingStyle.FAST_MEDIUM || 
                b.bowlingStyle === BowlingStyle.SWING ||
                b.bowlingStyle === BowlingStyle.SEAM
            ).slice(0, 2 - paceBowlers.length);
            bestBowlers.push(...additionalPace);
        }
        if (spinBowlers.length < 2) {
            // Add best remaining spin bowlers
            const additionalSpin = remainingBowlers.filter(b => 
                b.bowlingStyle === BowlingStyle.OFF_SPIN || 
                b.bowlingStyle === BowlingStyle.LEG_SPIN || 
                b.bowlingStyle === BowlingStyle.FINGER_SPIN ||
                b.bowlingStyle === BowlingStyle.CHINAMAN
            ).slice(0, 2 - spinBowlers.length);
            bestBowlers.push(...additionalSpin);
        }

        console.log('\nSelected Bowlers:', bestBowlers.map(b => ({
            id: b.id,
            name: b.name,
            style: b.bowlingStyle,
            rating: b.playerRatings[b.playerRatings.length - 1]?.calcBowlingRating()
        })));

        // 3. Create initial team with keeper and selected bowlers
        const teamPlayers = new Set<Player>();
        teamPlayers.add(wicketKeeper);
        bestBowlers.forEach(b => teamPlayers.add(b));

        // 4. Add best batters until we have 11 players
        const remainingSpots = 11 - teamPlayers.size;
        if (remainingSpots > 0) {
            const batters = this.selectBestBatters(
                players.filter(p => !teamPlayers.has(p)),
                remainingSpots
            );
            batters.forEach(b => teamPlayers.add(b));
        }

        // Convert to array and sort by batting rating for batting order
        const finalTeam = Array.from(teamPlayers);
        const battingOrder = finalTeam
            .sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                // Add small random variation to batting ratings
                const aRandomized = this.addRandomness(aRating.calcBattingRating());
                const bRandomized = this.addRandomness(bRating.calcBattingRating());
                return bRandomized - aRandomized;
            })
            .map(p => p.id);

        // Get all bowlers from the final team (including any who can bowl but weren't in best bowlers)
        const teamBowlers = finalTeam.filter(p => p.bowlingStyle !== BowlingStyle.NONE);
        const bowlingOrder = this.generateBowlingOrder(
            teamBowlers.filter(b => 
                b.bowlingStyle === BowlingStyle.FAST || 
                b.bowlingStyle === BowlingStyle.FAST_MEDIUM || 
                b.bowlingStyle === BowlingStyle.SWING ||
                b.bowlingStyle === BowlingStyle.SEAM
            ).map(b => b.id),
            teamBowlers.filter(b => 
                b.bowlingStyle === BowlingStyle.OFF_SPIN || 
                b.bowlingStyle === BowlingStyle.LEG_SPIN || 
                b.bowlingStyle === BowlingStyle.FINGER_SPIN ||
                b.bowlingStyle === BowlingStyle.CHINAMAN
            ).map(b => b.id),
            players
        );

        console.log('\nFinal Team Composition:', finalTeam.map(p => ({
            id: p.id,
            name: p.name,
            isWicketKeeper: p.wicketKeeper,
            bowlingStyle: p.bowlingStyle,
            rating: p.playerRatings[p.playerRatings.length - 1]
        })));

        console.log('\nBatting Order:', battingOrder.map((id, index) => ({
            position: index + 1,
            playerId: id,
            player: finalTeam.find(p => p.id === id)?.name,
            bowlingStyle: finalTeam.find(p => p.id === id)?.bowlingStyle
        })));

        console.log('\nBowling Order:', bowlingOrder.map((id, index) => ({
            over: index + 1,
            playerId: id,
            player: finalTeam.find(p => p.id === id)?.name,
            bowlingStyle: finalTeam.find(p => p.id === id)?.bowlingStyle
        })));

        return new TeamLineup(wicketKeeper.id, battingOrder, bowlingOrder, wicketKeeper.id);
    }

    private static selectBestWicketKeeper(players: Player[]): Player | undefined {
        return players
            .filter(p => p.wicketKeeper)
            .sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                // Use fielding rating as primary factor for wicket keeper selection
                const aScore = aRating.calcFieldingRating() * 0.7 + aRating.calcBattingRating() * 0.3;
                const bScore = bRating.calcFieldingRating() * 0.7 + bRating.calcBattingRating() * 0.3;
                return bScore - aScore;
            })[0];
    }

    private static selectBestBatters(players: Player[], count: number): Player[] {
        return players
            .sort((a, b) => {
                const aRating = a.playerRatings[a.playerRatings.length - 1];
                const bRating = b.playerRatings[b.playerRatings.length - 1];
                if (!aRating || !bRating) return 0;
                return bRating.calcBattingRating() - aRating.calcBattingRating();
            })
            .slice(0, count);
    }

    private static generateBowlingOrder(
        paceBowlerIds: number[], 
        spinBowlerIds: number[],
        players: Player[]
    ): number[] {
        const bowlingOrder: number[] = new Array(20);
        const bowlerOvers = new Map<number, number>();
        
        // Initialize bowler overs
        const allBowlerIds = [...paceBowlerIds, ...spinBowlerIds];
        allBowlerIds.forEach(id => bowlerOvers.set(id, 0));

        console.log('\nBowling Resources:', {
            paceBowlers: paceBowlerIds.length,
            spinBowlers: spinBowlerIds.length,
            totalBowlers: allBowlerIds.length
        });

        const getAvailableBowler = (
            preferredIds: number[], 
            backupIds: number[], 
            lastBowlerId?: number,
            preferredTypeWeight: number = 1.2 // How much to boost preferred type bowlers
        ): number | undefined => {
            // Get all available bowlers (not maxed out and not consecutive)
            const availableBowlers = [...preferredIds, ...backupIds].filter(id => {
                const overs = bowlerOvers.get(id) || 0;
                return overs < 4 && id !== lastBowlerId;
            });

            if (availableBowlers.length === 0) return undefined;

            // Sort by weighted bowling rating
            return availableBowlers.sort((a, b) => {
                const aRating = this.getBowlerRating(a, players);
                const bRating = this.getBowlerRating(b, players);
                // Apply weight to preferred bowlers
                const aWeighted = preferredIds.includes(a) ? aRating * preferredTypeWeight : aRating;
                const bWeighted = preferredIds.includes(b) ? bRating * preferredTypeWeight : bRating;
                // If ratings are close (within 15 now for more variety), prefer bowler with fewer overs
                // or randomly choose between them
                if (Math.abs(aWeighted - bWeighted) < 15) {
                    const aOvers = bowlerOvers.get(a) || 0;
                    const bOvers = bowlerOvers.get(b) || 0;
                    // If overs are the same, add randomness
                    if (aOvers === bOvers) {
                        return Math.random() - 0.5; // Random ordering when overs and ratings are close
                    }
                    return aOvers - bOvers;
                }
                return bWeighted - aWeighted;
            })[0];
        };

        // Helper to assign an over
        const assignOver = (overNum: number, bowlerId: number) => {
            bowlingOrder[overNum] = bowlerId;
            bowlerOvers.set(bowlerId, (bowlerOvers.get(bowlerId) || 0) + 1);
        };

        // Calculate total available overs from bowlers
        const maxPossibleOvers = allBowlerIds.length * 4;
        if (maxPossibleOvers < 20) {
            throw new Error(`Not enough bowlers to complete 20 overs. Have ${allBowlerIds.length} bowlers with max ${maxPossibleOvers} overs`);
        }

        // Sort bowlers by rating for initial assignment
        const bowlersByRating = allBowlerIds.sort((a, b) => this.getBowlerRating(b, players) - this.getBowlerRating(a, players));
        const topBowlers = bowlersByRating.slice(0, 3); // Get top 3 bowlers

        // Powerplay (overs 1-6): Prefer best bowlers with slight pace preference
        for (let over = 0; over < 6; over++) {
            const bowler = getAvailableBowler(
                topBowlers.filter(id => paceBowlerIds.includes(id)),
                topBowlers.filter(id => !paceBowlerIds.includes(id)),
                bowlingOrder[over - 1],
                1.1 // Small weight for pace preference
            ) || getAvailableBowler(
                paceBowlerIds,
                spinBowlerIds,
                bowlingOrder[over - 1],
                1.1
            );
            if (!bowler) throw new Error(`Could not find valid bowler for powerplay over ${over + 1}`);
            assignOver(over, bowler);
        }

        // Middle overs (7-15): Prefer spin but prioritize rating
        for (let over = 6; over < 15; over++) {
            const bowler = getAvailableBowler(
                spinBowlerIds,
                paceBowlerIds,
                bowlingOrder[over - 1],
                1.1 // Small weight for spin preference
            );
            if (!bowler) throw new Error(`Could not find valid bowler for middle over ${over + 1}`);
            assignOver(over, bowler);
        }

        // Death overs (16-20): Use best available bowlers with slight pace preference
        for (let over = 15; over < 20; over++) {
            const bowler = getAvailableBowler(
                topBowlers.filter(id => paceBowlerIds.includes(id)),
                topBowlers.filter(id => !paceBowlerIds.includes(id)),
                bowlingOrder[over - 1],
                1.1 // Small weight for pace preference
            ) || getAvailableBowler(
                paceBowlerIds,
                spinBowlerIds,
                bowlingOrder[over - 1],
                1.1
            );
            if (!bowler) throw new Error(`Could not find valid bowler for death over ${over + 1}`);
            assignOver(over, bowler);
        }

        // Validate all overs are assigned
        const unassignedOvers = bowlingOrder.map((bowler, index) => bowler === undefined ? index + 1 : null).filter(over => over !== null);
        if (unassignedOvers.length > 0) {
            throw new Error(`Unassigned overs found: ${unassignedOvers.join(', ')}`);
        }

        // Log over distribution
        console.log('\nOver Distribution:', Object.fromEntries(
            Array.from(bowlerOvers.entries()).map(([bowlerId, overs]) => [bowlerId, overs])
        ));

        return bowlingOrder;
    }

    private static getBowlerRating(bowlerId: number, players: Player[]): number {
        const player = players.find(p => p.id === bowlerId);
        if (!player || !player.playerRatings.length) return 0;
        const baseRating = player.playerRatings[player.playerRatings.length - 1].calcBowlingRating();
        return this.addRandomness(baseRating, 3); // Smaller range (±3) for bowling to maintain quality control
    }

    private static addRandomness(rating: number, range: number = 5): number {
        // Add random variation within ±range
        return rating + (Math.random() * 2 - 1) * range;
    }
} 