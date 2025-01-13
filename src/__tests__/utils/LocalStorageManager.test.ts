import { LocalStorageManager } from '../../../src/utils/LocalStorageManager';
import { League } from '../../../src/models/League/League';
import { LeagueType } from '../../../src/models/League/LeagueType';
import { PlayoffType } from '../../../src/models/League/PlayoffType';
import { AuctionType } from '../../../src/models/League/AuctionType';

describe('LocalStorageManager', () => {
    let mockStorage: { [key: string]: string } = {};

    beforeEach(() => {
        mockStorage = {};
        
        // Mock localStorage methods
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn((key: string) => mockStorage[key] || null),
                setItem: jest.fn((key: string, value: string) => {
                    mockStorage[key] = value;
                }),
                removeItem: jest.fn((key: string) => {
                    delete mockStorage[key];
                }),
                clear: jest.fn(() => {
                    mockStorage = {};
                })
            },
            writable: true
        });
    });

    describe('League Setup', () => {
        test('should save and retrieve league setup', () => {
            const setup = {
                leagueName: 'Test League',
                teamCount: 8
            };

            LocalStorageManager.saveLeagueSetup(setup.leagueName, setup.teamCount);
            const retrieved = LocalStorageManager.getLeagueSetup();

            expect(retrieved).toEqual(setup);
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'league_setup',
                JSON.stringify(setup)
            );
        });
    });

    describe('Team Selection', () => {
        test('should save and retrieve team selection', () => {
            const teamId = 1;

            LocalStorageManager.saveTeamSelection(teamId);
            const retrieved = LocalStorageManager.getTeamSelection();

            expect(retrieved).toBe(teamId);
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'team_selection',
                teamId.toString()
            );
        });
    });

    describe('League', () => {
        test('should save and retrieve league', () => {
            const leagueType = new LeagueType(
                14, // matches per team
                20, // max players per team
                PlayoffType.TOP_4,
                AuctionType.DRAFT,
                8, // number of teams
                true // playoff homefield advantage
            );

            const mockLeague = new League(
                1, // id
                leagueType,
                'Test League',
                [], // teams
                [], // stadiums
                [], // players
                [], // seasons
                0 // userTeam
            );

            LocalStorageManager.saveLeague(mockLeague);
            const retrieved = LocalStorageManager.getLeague();

            expect(retrieved?.id).toBe(mockLeague.id);
            expect(retrieved?.name).toBe(mockLeague.name);
            expect(retrieved?.teams.length).toBe(mockLeague.teams.length);
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'league',
                JSON.stringify(mockLeague)
            );
        });

        test('should return null when no league exists', () => {
            const retrieved = LocalStorageManager.getLeague();
            expect(retrieved).toBeNull();
        });
    });

    describe('Clear and Delete Operations', () => {
        test('should clear all data', () => {
            // Set up some data first
            const setup = { leagueName: 'Test League', teamCount: 8 };
            LocalStorageManager.saveLeagueSetup(setup.leagueName, setup.teamCount);
            LocalStorageManager.saveTeamSelection(1);

            // Clear all data
            LocalStorageManager.clearAll();

            // Verify all data is cleared
            expect(LocalStorageManager.getLeagueSetup()).toBeNull();
            expect(LocalStorageManager.getTeamSelection()).toBeNull();
            expect(LocalStorageManager.getLeague()).toBeNull();

            expect(localStorage.removeItem).toHaveBeenCalledWith('league_setup');
            expect(localStorage.removeItem).toHaveBeenCalledWith('team_selection');
            expect(localStorage.removeItem).toHaveBeenCalledWith('league');
            expect(localStorage.removeItem).toHaveBeenCalledWith('draft_state');
        });
    });
}); 