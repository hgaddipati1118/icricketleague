import { Team } from "../Team/Team";

import { Season } from "../Season/Season";
import { Stadium } from "../Stadium/Stadium";
import { Player } from "../Player/Player";
import { LeagueType } from "./LeagueType";

export class League {
    id: number;
    type: LeagueType;
    name: string;
    teams: Team[];
    userTeam: number;   
    stadiums: Stadium[];
    players: Player[];                    
    seasons: Season[];

    constructor(id: number, type: LeagueType, name: string, teams: Team[], stadiums: Stadium[], players: Player[], seasons: Season[], userTeam: number) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.teams = teams;
        this.stadiums = stadiums;
        this.players = players;
        this.seasons = seasons;
        this.userTeam = userTeam;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type.toJSON(),
            name: this.name,
            teams: this.teams.map(team => team.toJSON()),
            stadiums: this.stadiums.map(stadium => stadium.toJSON()),
            players: this.players.map(player => player.toJSON()),
            seasons: this.seasons.map(season => season.toJSON()),
            userTeam: this.userTeam
        };
    }

    static fromJSON(json: {
        id: number,
        type: ReturnType<LeagueType['toJSON']>,
        name: string,
        teams: ReturnType<Team['toJSON']>[],
        stadiums: ReturnType<Stadium['toJSON']>[],
        players: ReturnType<Player['toJSON']>[],
        seasons: ReturnType<Season['toJSON']>[],
        userTeam: number
    }): League {
        return new League(
            json.id,
            LeagueType.fromJSON(json.type),
            json.name,
            json.teams.map(team => Team.fromJSON(team)),
            json.stadiums.map(stadium => Stadium.fromJSON(stadium)),
            json.players.map(player => Player.fromJSON(player)),
            json.seasons.map(season => Season.fromJSON(season)),
            json.userTeam
        );
    }
}


