import { TeamLineup } from "./TeamLineup";

export class Team {
    id: number;
    name: string;
    shortName: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    players: number[]; //PlayerID
    stadium: number; //StadiumId
    pastScorecards: number[]; //ScorecardId
    schedule: number[]; //GameId Schedule
    lineup: TeamLineup | null;

    constructor(id: number, name: string, shortName: string, logo: string, primaryColor: string, secondaryColor: string, players: number[], stadium: number, pastScorecards: number[], schedule: number[], lineup: TeamLineup | null = null) {
        this.id = id;
        this.name = name;
        this.shortName = shortName;
        this.logo = logo;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.players = players;
        this.stadium = stadium;
        this.pastScorecards = pastScorecards;
        this.schedule = schedule;
        this.lineup = lineup;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            shortName: this.shortName,
            logo: this.logo,
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            players: this.players,
            stadium: this.stadium,
            pastScorecards: this.pastScorecards,
            schedule: this.schedule,
            lineup: this.lineup?.toJSON() || null
        };
    }

    static fromJSON(json: {
        id: number,
        name: string,
        shortName: string,
        logo: string,
        primaryColor: string,
        secondaryColor: string,
        players: number[],
        stadium: number,
        pastScorecards: number[],
        schedule: number[],
        lineup: ReturnType<TeamLineup['toJSON']> | null
    }): Team {
        return new Team(
            json.id,
            json.name,
            json.shortName,
            json.logo,
            json.primaryColor,
            json.secondaryColor,
            json.players,
            json.stadium,
            json.pastScorecards,
            json.schedule,
            json.lineup ? TeamLineup.fromJSON(json.lineup) : null
        );
    }
}

