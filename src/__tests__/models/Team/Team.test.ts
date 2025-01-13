import { Team } from '../../../models/Team/Team';
import { TeamLineup } from '../../../models/Team/TeamLineup';

describe('Team', () => {
    let defaultTeam: Team;

    beforeEach(() => {
        defaultTeam = new Team(
            1,                      // id
            'Test Team',           // name
            'TST',                 // shortName
            'test-logo.png',       // logo
            '#FF0000',             // primaryColor
            '#0000FF',             // secondaryColor
            [1, 2, 3, 4, 5],       // players
            1,                      // stadium
            [],                     // pastScorecards
            [],                     // schedule
            null                    // lineup
        );
    });

    describe('constructor', () => {
        it('should create a team with provided values', () => {
            expect(defaultTeam.id).toBe(1);
            expect(defaultTeam.name).toBe('Test Team');
            expect(defaultTeam.shortName).toBe('TST');
            expect(defaultTeam.logo).toBe('test-logo.png');
            expect(defaultTeam.primaryColor).toBe('#FF0000');
            expect(defaultTeam.secondaryColor).toBe('#0000FF');
            expect(defaultTeam.players).toEqual([1, 2, 3, 4, 5]);
            expect(defaultTeam.stadium).toBe(1);
            expect(defaultTeam.pastScorecards).toEqual([]);
            expect(defaultTeam.schedule).toEqual([]);
            expect(defaultTeam.lineup).toBeNull();
        });

        it('should create a team with lineup if provided', () => {
            const lineup = new TeamLineup(1, [1, 2, 3], [4, 5], 1);
            const teamWithLineup = new Team(
                1, 'Test Team', 'TST', 'logo.png', '#000', '#FFF',
                [1, 2, 3, 4, 5], 1, [], [], lineup
            );

            expect(teamWithLineup.lineup).toBeDefined();
            expect(teamWithLineup.lineup?.teamId).toBe(1);
            expect(teamWithLineup.lineup?.battingOrder).toEqual([1, 2, 3]);
            expect(teamWithLineup.lineup?.bowlingOrder).toEqual([4, 5]);
            expect(teamWithLineup.lineup?.wicketKeeper).toBe(1);
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should correctly serialize and deserialize a team without lineup', () => {
            const json = defaultTeam.toJSON();
            const recreatedTeam = Team.fromJSON(json);

            expect(recreatedTeam.id).toBe(defaultTeam.id);
            expect(recreatedTeam.name).toBe(defaultTeam.name);
            expect(recreatedTeam.shortName).toBe(defaultTeam.shortName);
            expect(recreatedTeam.logo).toBe(defaultTeam.logo);
            expect(recreatedTeam.primaryColor).toBe(defaultTeam.primaryColor);
            expect(recreatedTeam.secondaryColor).toBe(defaultTeam.secondaryColor);
            expect(recreatedTeam.players).toEqual(defaultTeam.players);
            expect(recreatedTeam.stadium).toBe(defaultTeam.stadium);
            expect(recreatedTeam.pastScorecards).toEqual(defaultTeam.pastScorecards);
            expect(recreatedTeam.schedule).toEqual(defaultTeam.schedule);
            expect(recreatedTeam.lineup).toBeNull();
        });

        it('should correctly serialize and deserialize a team with lineup', () => {
            const lineup = new TeamLineup(1, [1, 2, 3], [4, 5], 1);
            const teamWithLineup = new Team(
                1, 'Test Team', 'TST', 'logo.png', '#000', '#FFF',
                [1, 2, 3, 4, 5], 1, [], [], lineup
            );

            const json = teamWithLineup.toJSON();
            const recreatedTeam = Team.fromJSON(json);

            expect(recreatedTeam.lineup).toBeDefined();
            expect(recreatedTeam.lineup?.teamId).toBe(lineup.teamId);
            expect(recreatedTeam.lineup?.battingOrder).toEqual(lineup.battingOrder);
            expect(recreatedTeam.lineup?.bowlingOrder).toEqual(lineup.bowlingOrder);
            expect(recreatedTeam.lineup?.wicketKeeper).toBe(lineup.wicketKeeper);
        });
    });
}); 