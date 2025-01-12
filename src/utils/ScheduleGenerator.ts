import { Team } from '../models/Team/Team';
import { ScheduleGame } from '../models/Season/ScheduleGame';
import { GameType } from '../models/Season/GameType';

export function generateSchedule(teams: Team[], gamesPerTeam: number): ScheduleGame[] {
    const schedule: ScheduleGame[] = [];
    let gameId = 0;
    
    // Remove free agents team (id 0) if present
    const activeTeams = teams.filter(team => team.id !== 0);
    const numTeams = activeTeams.length;

    // Calculate how many rounds we need
    const roundsNeeded = Math.ceil(gamesPerTeam / (numTeams - 1));

    for (let round = 0; round < roundsNeeded; round++) {
        // Generate round-robin schedule for this round
        const roundGames = generateRoundRobinRound(activeTeams, round);
        
        // Add games to schedule with proper IDs and stadiums
        roundGames.forEach(({ homeTeam, awayTeam }) => {
            schedule.push(new ScheduleGame(
                gameId++,
                homeTeam.stadium,
                homeTeam.id,
                awayTeam.id,
                GameType.NORMAL
            ));
        });
    }

    // Trim excess games if we generated more than needed
    const maxGames = (numTeams * gamesPerTeam) / 2;
    return schedule.slice(0, maxGames);
}

interface RoundGame {
    homeTeam: Team;
    awayTeam: Team;
}

function generateRoundRobinRound(teams: Team[], round: number): RoundGame[] {
    const games: RoundGame[] = [];
    const n = teams.length;

    // For odd number of teams, add a dummy team
    const teamsToSchedule = n % 2 === 0 ? teams : [...teams, null];
    const numTeams = teamsToSchedule.length;

    // Create pairs for this round
    for (let i = 0; i < numTeams / 2; i++) {
        const team1Idx = (i + round) % (numTeams - 1);
        const team2Idx = (numTeams - 1 - i + round) % (numTeams - 1);

        // Skip games involving the dummy team
        if (teamsToSchedule[team1Idx] && teamsToSchedule[team2Idx]) {
            // Alternate home/away based on round number for fairness
            const game: RoundGame = round % 2 === 0 
                ? { homeTeam: teamsToSchedule[team1Idx], awayTeam: teamsToSchedule[team2Idx] }
                : { homeTeam: teamsToSchedule[team2Idx], awayTeam: teamsToSchedule[team1Idx] };
            
            games.push(game);
        }
    }

    // Handle the fixed team (last team in array) separately
    if (numTeams > 1) {
        const fixedTeam = teamsToSchedule[numTeams - 1];
        const rotatingTeam = teamsToSchedule[(round) % (numTeams - 1)];
        
        if (fixedTeam && rotatingTeam) {
            const game: RoundGame = round % 2 === 0
                ? { homeTeam: fixedTeam, awayTeam: rotatingTeam }
                : { homeTeam: rotatingTeam, awayTeam: fixedTeam };
            
            games.push(game);
        }
    }

    return games;
} 