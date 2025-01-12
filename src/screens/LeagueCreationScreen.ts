import { League } from '../models/League/League';
import { LeagueType } from '../models/League/LeagueType';
import { PlayoffType } from '../models/League/PlayoffType';
import { AuctionType } from '../models/League/AuctionType';
import { Team } from '../models/Team/Team';
import { Stadium } from '../models/Stadium/Stadium';
import { Player } from '../models/Player/Player';
import { Season } from '../models/Season/Season';
import { generateRandomStadium } from '../utils/StadiumGenerator';
import generateRandomPlayer from '../utils/PlayerGenerator';
import generateTeamName from '../utils/TeamGenerator';

export class LeagueCreationScreen {
    static createNewLeague(leagueName: string, userTeamId: number): League {
        const leagueType = new LeagueType(
            14,
            20,
            PlayoffType.TOP_4,
            AuctionType.DRAFT,
            8,
            true
        );

        const stadiums: Stadium[] = Array.from({ length: leagueType.TEAM_NUMBER * 2 }, (_, index) => 
            generateRandomStadium(index)
        );

        // Generate all players
        const players: Player[] = Array.from({ length: (leagueType.TEAM_NUMBER * leagueType.MAX_PLAYERS_PER_TEAM * 2) }, (_, index) => 
            generateRandomPlayer(index)
        );

        // Create free agents team with all players (team 0)
        const freeAgentsTeam = new Team(
            0,
            'Free Agents',
            'FA',
            'free_agents_logo.png',
            '#808080',
            '#404040',
            players.map(p => p.id), // All players start in free agents
            stadiums[0].id,
            [],
            []
        );

        // Generate regular teams starting from index 1, but with no players
        const regularTeams: Team[] = Array.from({ length: leagueType.TEAM_NUMBER }, (_, index) => {
            const teamName = generateTeamName();
            return new Team(
                index + 1,
                teamName.name,
                teamName.shortName,
                `default_logo_${index + 1}.png`,
                `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                [], // Empty player list
                stadiums[index + 1].id,
                [],
                []
            );
        });

        const allTeams = [freeAgentsTeam, ...regularTeams];

        const initialSeason = new Season(
            0,
            regularTeams,
            [],
            0,
            [],
            []
        );

        return new League(
            Date.now(),
            leagueType,
            leagueName,
            allTeams,
            stadiums,
            players,
            [initialSeason],
            userTeamId
        );
    }
} 