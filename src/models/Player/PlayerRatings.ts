export class PlayerRatings {
    season_id: number;

    // Fielding
    fielding: number;
    
    // Batting
    power: number;
    technical: number;
    defensive: number;
    temperament: number;

    // Bowling
    economy: number;
    control: number;
    wicketTaking: number;
    clutch: number;

    // General
    fitness: number;
    leadership: number;
    consistency: number;

    // Overalls
    overall: number = 0;
    batting: number = 0;
    bowling: number = 0;
    fieldingOverall: number = 0;

    constructor(
        isBowler: boolean,
        season_id: number = 0,
        fielding: number = 0,
        power: number = 0,
        technical: number = 0,
        defensive: number = 0,
        temperament: number = 0,
        economy: number = 0,
        control: number = 0,
        wicketTaking: number = 0,
        clutch: number = 0,
        fitness: number = 0,
        leadership: number = 0,
        consistency: number = 0
    ) {
        fielding = Math.min(100, Math.max(0, fielding));
        power = Math.min(100, Math.max(0, power));
        technical = Math.min(100, Math.max(0, technical));
        defensive = Math.min(100, Math.max(0, defensive));
        temperament = Math.min(100, Math.max(0, temperament));
        economy = Math.min(100, Math.max(0, economy));
        control = Math.min(100, Math.max(0, control));
        clutch = Math.min(100, Math.max(0, clutch));
        wicketTaking = Math.min(100, Math.max(0, wicketTaking));
        fitness = Math.min(100, Math.max(0, fitness));
        leadership = Math.min(100, Math.max(0, leadership));
        consistency = Math.min(100, Math.max(0, consistency));

        this.season_id = season_id;
        this.fielding = fielding;
        this.power = power;
        this.technical = technical;
        this.defensive = defensive;
        this.temperament = temperament;
        this.clutch = clutch;
        this.fitness = fitness;
        this.leadership = leadership;
        this.consistency = consistency;

        // Set bowling stats to 0 if player is not a bowler
        if (!isBowler) {
            this.economy = 0;
            this.control = 0;
            this.wicketTaking = 0;
        } else {
            this.economy = economy;
            this.control = control;
            this.wicketTaking = wicketTaking;
        }
        
        // Calculate all ratings when instance is created
        this.calcBattingRating();
        this.calcBowlingRating();
        this.calcFieldingRating();
        this.calcOverallRating();
    }

    calcBattingRating(): number {
        this.batting = Math.round(0.35 * this.power + 0.25 * this.technical + 0.1 * this.defensive + 0.1 * this.temperament + 0.05 * this.fitness);
        return this.batting;
    }

    calcBowlingRating(): number {
        this.bowling = Math.round(0.35 * this.economy + 0.2 * this.control + 0.3 * this.wicketTaking + 0.1 * this.clutch + 0.05 * this.fitness);
        return this.bowling;
    }

    calcFieldingRating(): number {
        this.fieldingOverall = Math.round(0.4 * this.fielding + 0.2 * this.fitness + 0.2 * this.clutch + 0.2 * this.consistency);
        return this.fieldingOverall;
    }

    calcOverallRating(): number {
        const battingRating = this.calcBattingRating();
        const bowlingRating = this.calcBowlingRating();
        const fieldingRating = this.calcFieldingRating();

        // Calculate overall rating based on the highest of batting/bowling
        // with a contribution from the other skill and fielding
        let expectedOverall;
        if (battingRating > bowlingRating) {
            const otherSkillContribution = Math.pow((bowlingRating / 100), 4);
            expectedOverall = battingRating + (100 - battingRating) * otherSkillContribution;
        } else {
            const otherSkillContribution = Math.pow((battingRating / 100), 4);
            expectedOverall = bowlingRating + (100 - bowlingRating) * otherSkillContribution;
        }

        // Add fielding contribution
        const fieldingContribution = Math.pow((fieldingRating / 100), 4);
        expectedOverall = expectedOverall + 0.2 * (100 - expectedOverall) * fieldingContribution;

        this.overall = Math.round(expectedOverall);
        return this.overall;
    }

    toJSON() {
        return {
            season_id: this.season_id,
            fielding: this.fielding,
            power: this.power,
            technical: this.technical,
            defensive: this.defensive,
            temperament: this.temperament,
            economy: this.economy,
            control: this.control,
            wicketTaking: this.wicketTaking,
            clutch: this.clutch,
            fitness: this.fitness,
            leadership: this.leadership,
            consistency: this.consistency
        };
    }

    static fromJSON(json: ReturnType<PlayerRatings['toJSON']>, isBowler: boolean): PlayerRatings {
        return new PlayerRatings(
            isBowler,
            json.season_id,
            json.fielding,
            json.power,
            json.technical,
            json.defensive,
            json.temperament,
            json.economy,
            json.control,
            json.wicketTaking,
            json.clutch,
            json.fitness,
            json.leadership,
            json.consistency
        );
    }
}
