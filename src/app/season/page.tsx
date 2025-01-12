'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocalStorageManager } from '../../utils/LocalStorageManager';
import { SeasonScreen } from '../../screens/SeasonScreen';
import { TeamLineup } from '../../models/Team/TeamLineup';
import { Team } from '../../models/Team/Team';
import { ScheduleGame } from '../../models/Season/ScheduleGame';

type TabType = 'schedule' | 'lineups' | 'standings';

export default function SeasonPage() {
    const router = useRouter();
    const [seasonScreen, setSeasonScreen] = useState<SeasonScreen | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('schedule');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [editingLineup, setEditingLineup] = useState<TeamLineup | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const league = LocalStorageManager.getLeague();
        if (!league) {
            router.push('/');
            return;
        }
        
        const screen = SeasonScreen.loadFromLocalStorage(league);
        setSeasonScreen(screen);
        
        // Set user's team as initially selected team
        const userTeam = league.teams.find(t => t.id === league.userTeam);
        if (userTeam) {
            setSelectedTeam(userTeam);
            setEditingLineup(screen.getTeamLineup(userTeam.id));
        }
    }, [router]);

    if (!seasonScreen) return null;

    const league = seasonScreen.getLeague();
    const season = seasonScreen.getCurrentSeason();

    const handleGenerateSchedule = () => {
        seasonScreen.generateNewSchedule();
        setSeasonScreen(SeasonScreen.loadFromLocalStorage(league));
    };

    const handleSaveLineup = () => {
        if (!selectedTeam || !editingLineup) return;

        const error = seasonScreen.setTeamLineup(selectedTeam.id, editingLineup);
        if (error) {
            setError(error);
            return;
        }

        seasonScreen.saveToLocalStorage();
        setError(null);
    };

    const renderSchedule = () => {
        const schedule = season.schedule;
        if (schedule.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No schedule generated yet</p>
                    <button
                        onClick={handleGenerateSchedule}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Generate Schedule
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {schedule.map((game: ScheduleGame) => {
                    const homeTeam = league.teams.find(t => t.id === game.homeTeam)!;
                    const awayTeam = league.teams.find(t => t.id === game.awayTeam)!;
                    const stadium = league.stadiums.find(s => s.id === game.stadium)!;

                    return (
                        <div key={game.id} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <span className="font-bold">{homeTeam.name}</span>
                                </div>
                                <div className="flex-none px-4">vs</div>
                                <div className="flex-1 text-right">
                                    <span className="font-bold">{awayTeam.name}</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                {stadium.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderLineups = () => {
        const teams = league.teams.filter(t => t.id !== 0);
        const players = selectedTeam ? league.players.filter(p => selectedTeam.players.includes(p.id)) : [];

        return (
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold mb-4">Teams</h3>
                    <div className="space-y-2">
                        {teams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => {
                                    setSelectedTeam(team);
                                    setEditingLineup(seasonScreen.getTeamLineup(team.id));
                                    setError(null);
                                }}
                                className={`w-full text-left px-3 py-2 rounded ${
                                    selectedTeam?.id === team.id
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedTeam && editingLineup && (
                    <div className="col-span-9 space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-bold mb-4">Batting Order</h3>
                            <div className="space-y-2">
                                {Array.from({ length: 11 }, (_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="w-8 text-center">{i + 1}</span>
                                        <select
                                            value={editingLineup.battingOrder[i] || ''}
                                            onChange={(e) => {
                                                const newOrder = [...editingLineup.battingOrder];
                                                newOrder[i] = Number(e.target.value);
                                                setEditingLineup(new TeamLineup(
                                                    selectedTeam.id,
                                                    newOrder,
                                                    editingLineup.bowlingOrder,
                                                    editingLineup.wicketKeeper
                                                ));
                                            }}
                                            className="flex-1 p-2 border rounded"
                                        >
                                            <option value="">Select Player</option>
                                            {players.map(player => (
                                                <option key={player.id} value={player.id}>
                                                    {player.name} ({player.getPlayerRole()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-bold mb-4">Bowling Order</h3>
                            <div className="space-y-2">
                                {Array.from({ length: 6 }, (_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="w-8 text-center">{i + 1}</span>
                                        <select
                                            value={editingLineup.bowlingOrder[i] || ''}
                                            onChange={(e) => {
                                                const newOrder = [...editingLineup.bowlingOrder];
                                                newOrder[i] = Number(e.target.value);
                                                setEditingLineup(new TeamLineup(
                                                    selectedTeam.id,
                                                    editingLineup.battingOrder,
                                                    newOrder,
                                                    editingLineup.wicketKeeper
                                                ));
                                            }}
                                            className="flex-1 p-2 border rounded"
                                        >
                                            <option value="">Select Bowler</option>
                                            {players
                                                .filter(p => p.bowlingStyle !== 'None')
                                                .map(player => (
                                                    <option key={player.id} value={player.id}>
                                                        {player.name} ({player.bowlingStyle})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-bold mb-4">Wicket Keeper</h3>
                            <select
                                value={editingLineup.wicketKeeper || ''}
                                onChange={(e) => {
                                    setEditingLineup(new TeamLineup(
                                        selectedTeam.id,
                                        editingLineup.battingOrder,
                                        editingLineup.bowlingOrder,
                                        Number(e.target.value)
                                    ));
                                }}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Wicket Keeper</option>
                                {players
                                    .filter(p => p.wicketKeeper)
                                    .map(player => (
                                        <option key={player.id} value={player.id}>
                                            {player.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveLineup}
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                            >
                                Save Lineup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderStandings = () => {
        // TODO: Implement standings view
        return (
            <div className="text-center py-8 text-gray-600">
                Standings will be available once the season starts
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">{league.name} - Season</h1>

                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {(['schedule', 'lineups', 'standings'] as TabType[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        py-4 px-1 border-b-2 font-medium text-sm
                                        ${activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    {activeTab === 'schedule' && renderSchedule()}
                    {activeTab === 'lineups' && renderLineups()}
                    {activeTab === 'standings' && renderStandings()}
                </div>
            </div>
        </div>
    );
} 