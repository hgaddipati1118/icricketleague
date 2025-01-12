import { League } from '../models/League/League';

export class LocalStorageManager {
    private static readonly LEAGUE_SETUP_KEY = 'league_setup';
    private static readonly TEAM_SELECTION_KEY = 'team_selection';
    private static readonly LEAGUE_KEY = 'league';
    private static readonly DRAFT_STATE_KEY = 'draft_state';

    static saveLeagueSetup(leagueName: string, teamCount: number): void {
        localStorage.setItem(this.LEAGUE_SETUP_KEY, JSON.stringify({ leagueName, teamCount }));
    }

    static getLeagueSetup(): { leagueName: string; teamCount: number } | null {
        const data = localStorage.getItem(this.LEAGUE_SETUP_KEY);
        return data ? JSON.parse(data) : null;
    }

    static saveTeamSelection(teamId: number): void {
        localStorage.setItem(this.TEAM_SELECTION_KEY, teamId.toString());
    }

    static getTeamSelection(): number | null {
        const teamId = localStorage.getItem(this.TEAM_SELECTION_KEY);
        return teamId ? parseInt(teamId) : null;
    }

    static saveLeague(league: League): void {
        localStorage.setItem(this.LEAGUE_KEY, JSON.stringify(league));
    }

    static getLeague(): League | null {
        const data = localStorage.getItem(this.LEAGUE_KEY);
        if (!data) return null;

        const jsonData = JSON.parse(data);
        return League.fromJSON(jsonData);
    }

    static clearAll(): void {
        localStorage.removeItem(this.LEAGUE_SETUP_KEY);
        localStorage.removeItem(this.TEAM_SELECTION_KEY);
        localStorage.removeItem(this.LEAGUE_KEY);
        localStorage.removeItem(this.DRAFT_STATE_KEY);
    }

    static deleteLeagueByName(leagueName: string): void {
        const existingLeague = this.getLeague();
        if (existingLeague && existingLeague.name === leagueName) {
            this.clearAll();
        }
    }
} 