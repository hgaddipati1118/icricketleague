import { BattingStyle } from "./BattingStyle";
import { BowlingStyle } from "./BowlingStyle";
import { Hand } from "./Hand";
import { PlayerRatings } from "./PlayerRatings";
import { PlayerStats } from "./PlayerStats";

export class Player {
    id: number;
    name: string;
    age: number;
    country: string;
    team: string;
    hand: Hand; 
    battingStyle: BattingStyle;
    bowlingStyle: BowlingStyle;
    wicketKeeper: boolean;
    playerRatings: PlayerRatings[];
    playerStats: PlayerStats[];

    constructor(
        id: number = 0,
        name: string = '',
        age: number = 0,
        country: string = '',
        team: string = '',
        hand: Hand = Hand.RIGHT_HANDED,
        battingStyle: BattingStyle = BattingStyle.STRIKE_ROTATOR,
        bowlingStyle: BowlingStyle = BowlingStyle.NONE,
        wicketKeeper: boolean = false,
        playerRatings: PlayerRatings[] = [],
        playerStats: PlayerStats[] = []
    ) {
        age = Math.min(50, Math.max(14, age));
        this.id = id;
        this.name = name;
        this.age = age;
        this.country = country;
        this.team = team;
        this.hand = hand;
        this.battingStyle = battingStyle;
        this.bowlingStyle = bowlingStyle;
        this.wicketKeeper = wicketKeeper;
        this.playerRatings = playerRatings;
        this.playerStats = playerStats;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            age: this.age,
            country: this.country,
            team: this.team,
            hand: this.hand,
            battingStyle: this.battingStyle,
            bowlingStyle: this.bowlingStyle,
            wicketKeeper: this.wicketKeeper,
            playerRatings: this.playerRatings.map(rating => rating.toJSON()),
            playerStats: this.playerStats.map(stats => stats.toJSON())
        };
    }

    static fromJSON(json: {
        id: number;
        name: string;
        age: number;
        country: string;
        team: string;
        hand: Hand;
        battingStyle: BattingStyle;
        bowlingStyle: BowlingStyle;
        wicketKeeper: boolean;
        playerRatings: ReturnType<PlayerRatings['toJSON']>[];
        playerStats: ReturnType<PlayerStats['toJSON']>[];
    }): Player {
        return new Player(
            json.id,
            json.name,
            json.age,
            json.country,
            json.team,
            json.hand,
            json.battingStyle,
            json.bowlingStyle,
            json.wicketKeeper,
            json.playerRatings.map(rating => PlayerRatings.fromJSON(rating)),
            json.playerStats.map(stats => PlayerStats.fromJSON(stats))
        );
    }

    getPlayerRole(): 'Batter' | 'Bowler' | 'All-Rounder' {
        const latestRatings = this.playerRatings[this.playerRatings.length - 1];
        if (!latestRatings) return 'Batter'; // Default to batter if no ratings

        // Ensure we have a proper PlayerRatings instance
        const ratings = latestRatings instanceof PlayerRatings ? 
            latestRatings : PlayerRatings.fromJSON(latestRatings);

        const battingRating = ratings.calcBattingRating();
        const bowlingRating = ratings.calcBowlingRating();

        if (Math.abs(battingRating - bowlingRating) <= 10) {
            return 'All-Rounder';
        }

        return battingRating > bowlingRating ? 'Batter' : 'Bowler';
    }
}
