import { Team } from "../Team/Team";
import { ScheduleGame } from "./ScheduleGame";
import { Scorecard } from "../Scorecard/Scorecard";

export class Season {
    id: number;
    teams: Team[];
    schedule: ScheduleGame[];
    currentGame: number;
    scorecards: Scorecard[];
    playoffTeams: number[];

    constructor(
        id: number,
        teams: Team[] = [],
        schedule: ScheduleGame[] = [],
        currentGame: number,
        scorecards: Scorecard[] = [],
        playoffTeams: number[] = []
    ) {
        this.id = id;
        this.teams = teams;
        this.schedule = schedule;
        this.currentGame = currentGame;
        this.scorecards = scorecards;
        this.playoffTeams = playoffTeams;
    }

    toJSON() {
        return {
            id: this.id,
            teams: this.teams.map(team => team.toJSON()),
            schedule: this.schedule.map(game => game.toJSON()),
            currentGame: this.currentGame,
            scorecards: this.scorecards.map(scorecard => scorecard.toJSON()),
            playoffTeams: this.playoffTeams
        };
    }

    static fromJSON(json: {
        id: number,
        teams: ReturnType<Team['toJSON']>[],
        schedule: ReturnType<ScheduleGame['toJSON']>[],
        currentGame: number,
        scorecards: ReturnType<Scorecard['toJSON']>[],
        playoffTeams: number[]
    }): Season {
        return new Season(
            json.id,
            json.teams.map(team => Team.fromJSON(team)),
            json.schedule.map(game => ScheduleGame.fromJSON(game)),
            json.currentGame,
            json.scorecards.map(scorecard => Scorecard.fromJSON(scorecard)),
            json.playoffTeams
        );
    }
}
