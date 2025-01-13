import { League } from '../models/League/League';
import { Team } from '../models/Team/Team';
import { LeagueType } from '../models/League/LeagueType';
import { PlayoffType } from '../models/League/PlayoffType';
import { AuctionType } from '../models/League/AuctionType';
import { generateDraftPool } from '../utils/PlayerGenerator';
import { generateRandomStadium } from '../utils/StadiumGenerator';

// Define the team structure to match page.tsx
interface PredefinedTeam {
    id: number;
    name: string;
    shortName: string;
    colors: {
        primary: string;
        secondary: string;
    };
}

const PREDEFINED_TEAMS: PredefinedTeam[] = [
    { id: 1, name: 'Royal Challengers', shortName: 'RC', colors: { primary: '#4CAF50', secondary: '#8BC34A' } },
    { id: 2, name: 'Super Kings', shortName: 'SK', colors: { primary: '#3F51B5', secondary: '#2196F3' } },
    { id: 3, name: 'Knight Riders', shortName: 'KR', colors: { primary: '#673AB7', secondary: '#9C27B0' } },
    { id: 4, name: 'Hurricanes', shortName: 'HUR', colors: { primary: '#009688', secondary: '#E91E63' } },
    { id: 5, name: 'Titans', shortName: 'TIT', colors: { primary: '#00BCD4', secondary: '#4CAF50' } },
    { id: 6, name: 'Warriors', shortName: 'WAR', colors: { primary: '#673AB7', secondary: '#E91E63' } },
    { id: 7, name: 'Strikers', shortName: 'STR', colors: { primary: '#795548', secondary: '#4CAF50' } },
    { id: 8, name: 'Lions', shortName: 'LNS', colors: { primary: '#FFC107', secondary: '#3F51B5' } },
    { id: 9, name: 'Eagles', shortName: 'EAG', colors: { primary: '#FF5722', secondary: '#795548' } },
    { id: 10, name: 'Panthers', shortName: 'PAN', colors: { primary: '#607D8B', secondary: '#9C27B0' } }
];

export class LeagueCreationScreen {
    static createNewLeague(leagueName: string, userTeamId: number): League {
        // Create league type
        const leagueType = new LeagueType(
            14, // matches per team
            20, // max players per team
            PlayoffType.TOP_4,
            AuctionType.DRAFT,
            8, // number of teams
            true // has salary cap
        );

        // Create teams array starting with Free Agents
        const teams: Team[] = [
            new Team(
                0,
                'Free Agents',
                'FA',
                'default_logo.png',
                '#CCCCCC',
                '#999999',
                [], // Empty player list
                0, // Stadium ID
                [], // Empty pastScorecards array
                [], // Empty schedule array
                null // No lineup initially
            )
        ];

        // Add teams from predefined list up to the number specified in leagueType
        const selectedTeams = PREDEFINED_TEAMS.slice(0, leagueType.TEAM_NUMBER);
        selectedTeams.forEach((preTeam) => {
            teams.push(new Team(
                preTeam.id,
                preTeam.name,
                preTeam.shortName,
                'default_logo.png',
                preTeam.colors.primary,
                preTeam.colors.secondary,
                [], // Empty player list
                preTeam.id, // Stadium ID same as team ID
                [], // Empty pastScorecards array
                [], // Empty schedule array
                null // No lineup initially
            ));
        });

        // Generate stadiums for each team
        const stadiums = teams.map((team, index) => generateRandomStadium(index));

        // Create league with initial empty arrays
        const league = new League(
            Date.now(), // League ID
            leagueType,
            leagueName,
            teams,
            stadiums,
            [], // Empty players array - will be filled below
            [], // Empty seasons array
            userTeamId
        );

        // Generate players and add them to league
        const players = generateDraftPool(league);
        league.players = players;
        
        // Add all players to free agents team
        const freeAgentsTeam = teams.find(team => team.id === 0);
        if (freeAgentsTeam) {
            freeAgentsTeam.players = players.map(p => p.id);
        }

        return league;
    }
} 