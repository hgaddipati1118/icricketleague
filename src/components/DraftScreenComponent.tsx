'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DraftScreen } from '../screens/DraftScreen';
import { Player } from '../models/Player/Player';
import { Hand } from '../models/Player/Hand';
import { BattingStyle } from '../models/Player/BattingStyle';
import { BowlingStyle } from '../models/Player/BowlingStyle';
import { FilterType } from '../models/Draft/FilterType';

type RatingProperty = 'power' | 'technical' | 'defensive' | 'temperament' | 'economy' | 'control' | 'wicketTaking' | 'clutch' | 'fitness' | 'leadership' | 'consistency' | 'fielding';
type SortCategory = 'overall' | 'battingOverall' | 'bowlingOverall' | 'fieldingOverall' | RatingProperty;

interface DraftScreenComponentProps {
    draftScreen: DraftScreen;
}

export function DraftScreenComponent({ draftScreen }: DraftScreenComponentProps) {
    const router = useRouter();
    const [draftStatus, setDraftStatus] = useState(() => {
        draftScreen.sortByCategory('overall');
        return draftScreen.getDraftStatus();
    });
    const [sortCategory, setSortCategory] = useState<SortCategory>('overall');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [showRosters, setShowRosters] = useState(false);
    const [showDraftHistory, setShowDraftHistory] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [filters, setFilters] = useState<Partial<FilterType>>({
        hand: undefined,
        battingStyle: undefined,
        bowlingStyle: undefined
    });

    const isUserTeamTurn = draftStatus.currentTeam.id === draftScreen.getLeague().userTeam;

    useEffect(() => {
        setDraftStatus(draftScreen.getDraftStatus());
    }, [draftScreen]);

    useEffect(() => {
        // Initialize selected team to user's team
        if (!selectedTeamId) {
            setSelectedTeamId(draftScreen.getLeague().userTeam);
        }
    }, [selectedTeamId, draftScreen]);

    const handleSort = (category: SortCategory) => {
        draftScreen.sortByCategory(category);
        setDraftStatus(draftScreen.getDraftStatus());
        setSortCategory(category);
    };

    const handleDraftPlayer = (player: Player) => {
        draftScreen.draftPlayer(player.id);
        setDraftStatus(draftScreen.getDraftStatus());
    };

    const handleViewPlayer = (player: Player) => {
        setSelectedPlayer(player);
    };

    const handleCloseModal = () => {
        setSelectedPlayer(null);
    };

    const handleSimulateNext = useCallback(() => {
        if (!draftStatus.isDraftComplete) {
            draftScreen.simulateNextPick();
            setDraftStatus(draftScreen.getDraftStatus());
        }
    }, [draftScreen, draftStatus.isDraftComplete]);

    // Auto-simulate AI picks
    useEffect(() => {
        if (!isUserTeamTurn && !draftStatus.isDraftComplete) {
            const timeoutId = setTimeout(handleSimulateNext, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [draftStatus, isUserTeamTurn, handleSimulateNext]);

    const handleFilterChange = (filterType: keyof FilterType, value: string) => {
        const newFilters = {
            ...filters,
            [filterType]: value === 'all' ? undefined : value
        };
        setFilters(newFilters);
        
        // Apply filters
        Object.entries(newFilters).forEach(([key, value]) => {
            draftScreen.setFilter(key as keyof FilterType, value);
        });
        
        setDraftStatus(draftScreen.getDraftStatus());
    };

    const sortOptions: { label: string; value: SortCategory }[] = [
        { label: 'Overall', value: 'overall' },
        { label: 'Batting Overall', value: 'battingOverall' },
        { label: 'Bowling Overall', value: 'bowlingOverall' },
        { label: 'Fielding Overall', value: 'fieldingOverall' },
        { label: 'Batting Power', value: 'power' },
        { label: 'Technical', value: 'technical' },
        { label: 'Defense', value: 'defensive' },
        { label: 'Temperament', value: 'temperament' },
        { label: 'Economy', value: 'economy' },
        { label: 'Control', value: 'control' },
        { label: 'Wicket Taking', value: 'wicketTaking' },
        { label: 'Fielding', value: 'fielding' },
        { label: 'Fitness', value: 'fitness' },
        { label: 'Leadership', value: 'leadership' },
        { label: 'Consistency', value: 'consistency' }
    ];

    const getPlayerById = (id: number) => draftScreen.getLeague().players.find(p => p.id === id);

    useEffect(() => {
        if (draftStatus.isDraftComplete) {
            // Save final draft state
            draftScreen.saveToLocalStorage();
            // Redirect to seasons page
            router.push('/season');
        }
    }, [draftStatus.isDraftComplete, draftScreen, router]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className={`p-4 rounded flex-1 ${
                    isUserTeamTurn ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                    <h2 className="font-bold">Current Team: {draftStatus.currentTeam.name}</h2>
                    <p>Round: {draftStatus.currentRound}</p>
                    {isUserTeamTurn && (
                        <p className="text-blue-600 font-medium">Your Turn to Draft!</p>
                    )}
                    {(() => {
                        const team = draftStatus.currentTeam;
                        const stadium = draftScreen.getLeague().stadiums.find(s => s.id === team.stadium);
                        if (stadium) {
                            return (
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>Home: {stadium.name}</p>
                                    <p>
                                        Pitch: {stadium.pitchType} • Boundary: {stadium.boundarySize} • 
                                        {stadium.battingFriendly > 70 ? ' Batting Paradise' :
                                         stadium.battingFriendly > 55 ? ' Batting Friendly' :
                                         stadium.battingFriendly > 45 ? ' Balanced' :
                                         stadium.battingFriendly > 30 ? ' Bowling Friendly' :
                                         ' Bowler\'s Paradise'}
                                    </p>
                                    <p>Capacity: {stadium.capacity.toLocaleString()}</p>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setShowRosters(!showRosters)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        {showRosters ? 'Hide Rosters' : 'Show Rosters'}
                    </button>
                    <button
                        onClick={() => setShowDraftHistory(!showDraftHistory)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        {showDraftHistory ? 'Hide Draft History' : 'Show Draft History'}
                    </button>
                </div>
            </div>

            {showRosters && (
                <div className="space-y-4 mb-4">
                    <div className="flex gap-2 items-center">
                        <select
                            className="px-3 py-2 border rounded"
                            value={selectedTeamId || ''}
                            onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                        >
                            {draftScreen.getLeague().teams
                                .filter(team => team.id !== 0)
                                .map(team => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}{team.id === draftScreen.getLeague().userTeam ? ' (Your Team)' : ''}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {selectedTeamId && (() => {
                        const team = draftScreen.getLeague().teams.find(t => t.id === selectedTeamId);
                        const stadium = team && draftScreen.getLeague().stadiums.find(s => s.id === team.stadium);
                        if (!team) return null;

                        return (
                            <div className="border rounded p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold">
                                        {team.name}
                                        {team.id === draftScreen.getLeague().userTeam && ' (Your Team)'}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        Players: {team.players.length}/{draftScreen.getLeague().type.MAX_PLAYERS_PER_TEAM}
                                    </span>
                                </div>
                                {stadium && (
                                    <div className="mb-4 text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                        <p className="font-medium">{stadium.name}</p>
                                        <p>Pitch: {stadium.pitchType} • Boundary: {stadium.boundarySize}</p>
                                        <p>Capacity: {stadium.capacity.toLocaleString()}</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {team.players.map(playerId => {
                                        const player = getPlayerById(playerId);
                                        if (!player) return null;
                                        const rating = draftScreen.calculateOverallRating(player);
                                        const role = player.getPlayerRole();
                                        return (
                                            <div 
                                                key={playerId} 
                                                className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleViewPlayer(player)}
                                            >
                                                <div>
                                                    <span>{player.name}</span>
                                                    <div className="text-sm text-gray-500">
                                                        Age: {player.age} • {player.hand} • {player.battingStyle}
                                                        {player.bowlingStyle !== 'None' && ` • ${player.bowlingStyle}`}
                                                        {player.wicketKeeper && ' • WK'}
                                                    </div>
                                                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                                                        role === 'Batter' ? 'bg-blue-100 text-blue-800' :
                                                        role === 'Bowler' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {role}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">{rating}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {player.playerRatings[0]?.batting || 0}/{player.playerRatings[0]?.bowling || 0}/{player.playerRatings[0]?.fieldingOverall || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {showDraftHistory && (
                <div className="border rounded p-4 mb-4">
                    <h3 className="font-bold mb-2">Draft History</h3>
                    <div className="space-y-2">
                        {draftScreen.getDraftHistory().map((entry, index) => {
                            const player = getPlayerById(entry.playerId);
                            const team = draftScreen.getLeague().teams.find(t => t.id === entry.teamId);
                            if (!player || !team) return null;
                            
                            return (
                                <div 
                                    key={index}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleViewPlayer(player)}
                                >
                                    <div>
                                        <span className="text-gray-600 mr-2">#{index + 1}</span>
                                        <span>{player.name}</span>
                                        <div className="text-sm text-gray-500">
                                            Age: {player.age} • {player.hand} • {player.battingStyle}
                                            {player.bowlingStyle !== 'None' && ` • ${player.bowlingStyle}`}
                                            {player.wicketKeeper && ' • WK'}
                                        </div>
                                    </div>
                                    <span className="text-gray-600">{team.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex gap-4 flex-wrap items-center mb-4">
                <div className="flex gap-2">
                    <select 
                        className="px-3 py-2 border rounded bg-white hover:bg-gray-50"
                        value={sortCategory}
                        onChange={(e) => handleSort(e.target.value as SortCategory)}
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                Sort by {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-3 py-2 border rounded bg-white hover:bg-gray-50"
                        value={filters.hand || 'all'}
                        onChange={(e) => handleFilterChange('hand', e.target.value)}
                    >
                        <option value="all">All Hands</option>
                        {Object.values(Hand).map(hand => (
                            <option key={hand} value={hand}>{hand}</option>
                        ))}
                    </select>

                    <select
                        className="px-3 py-2 border rounded bg-white hover:bg-gray-50"
                        value={filters.battingStyle || 'all'}
                        onChange={(e) => handleFilterChange('battingStyle', e.target.value)}
                    >
                        <option value="all">All Batting Styles</option>
                        {Object.values(BattingStyle).map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>

                    <select
                        className="px-3 py-2 border rounded bg-white hover:bg-gray-50"
                        value={filters.bowlingStyle || 'all'}
                        onChange={(e) => handleFilterChange('bowlingStyle', e.target.value)}
                    >
                        <option value="all">All Bowling Styles</option>
                        {Object.values(BowlingStyle).map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setFilters({ hand: undefined, battingStyle: undefined, bowlingStyle: undefined });
                            draftScreen.clearFilters();
                            setDraftStatus(draftScreen.getDraftStatus());
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium"
                    >
                        Clear Filters
                    </button>

                    <button
                        onClick={() => {
                            if (isUserTeamTurn && !draftStatus.isDraftComplete) {
                                draftScreen.simulateNextPick(true);
                                setDraftStatus(draftScreen.getDraftStatus());
                            }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                        disabled={!isUserTeamTurn || draftStatus.isDraftComplete}
                    >
                        Auto Pick
                    </button>

                    <button
                        onClick={() => {
                            const simulate = () => {
                                if (!draftScreen.getDraftStatus().isDraftComplete) {
                                    const status = draftScreen.getDraftStatus();
                                    // Pass true for allowUserTeam when it's the user's turn
                                    const isUserTurn = status.currentTeam.id === draftScreen.getLeague().userTeam;
                                    draftScreen.simulateNextPick(isUserTurn);
                                    const newStatus = draftScreen.getDraftStatus();
                                    setDraftStatus(newStatus);
                                    setTimeout(simulate, 1000);
                                }
                            };
                            simulate();
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 font-medium"
                        disabled={draftStatus.isDraftComplete}
                    >
                        Simulate Rest of Draft
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {draftStatus.availablePlayers.map(player => {
                    const latestRatings = player.playerRatings[player.playerRatings.length - 1];
                    const rating = latestRatings ? draftScreen.calculateOverallRating(player) : 0;
                    const role = player.getPlayerRole();

                    return (
                        <div key={player.id} className="p-4 border rounded hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold">{player.name}</h3>
                                    <p className="text-sm text-gray-600">{player.country}</p>
                                    <div className="text-sm text-gray-500">
                                        Age: {player.age} • {player.hand} • {player.battingStyle}
                                        {player.bowlingStyle !== 'None' && ` • ${player.bowlingStyle}`}
                                        {player.wicketKeeper && ' • WK'}
                                    </div>
                                    <p className="text-sm">
                                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                                            role === 'Batter' ? 'bg-blue-100 text-blue-800' :
                                            role === 'Bowler' ? 'bg-green-100 text-green-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {role}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">{rating}</p>
                                    <p className="text-sm text-gray-600">Overall</p>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <div>BAT: {latestRatings?.batting || 0}</div>
                                        <div>BWL: {latestRatings?.bowling || 0}</div>
                                        <div>FLD: {latestRatings?.fieldingOverall || 0}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleViewPlayer(player)}
                                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                                >
                                    View Details
                                </button>
                                {isUserTeamTurn && (
                                    <button
                                        onClick={() => handleDraftPlayer(player)}
                                        className="flex-1 px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
                                    >
                                        Draft
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedPlayer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
                                <p className="text-gray-600">{selectedPlayer.country}</p>
                                <div className="text-sm text-gray-500">
                                    Age: {selectedPlayer.age} • {selectedPlayer.hand} • {selectedPlayer.battingStyle}
                                    {selectedPlayer.bowlingStyle !== 'None' && ` • ${selectedPlayer.bowlingStyle}`}
                                    {selectedPlayer.wicketKeeper && ' • WK'}
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {selectedPlayer.playerRatings.length > 0 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center p-3 bg-gray-50 rounded">
                                        <div className="text-3xl font-bold">{draftScreen.calculateOverallRating(selectedPlayer)}</div>
                                        <div className="text-sm text-gray-600">Overall</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 bg-blue-50 rounded">
                                            <div className="text-xl font-bold">{selectedPlayer.playerRatings[0].batting}</div>
                                            <div className="text-xs text-gray-600">Batting</div>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 rounded">
                                            <div className="text-xl font-bold">{selectedPlayer.playerRatings[0].bowling}</div>
                                            <div className="text-xs text-gray-600">Bowling</div>
                                        </div>
                                        <div className="text-center p-2 bg-yellow-50 rounded">
                                            <div className="text-xl font-bold">{selectedPlayer.playerRatings[0].fieldingOverall}</div>
                                            <div className="text-xs text-gray-600">Fielding</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold mb-2">Batting</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>Power: {selectedPlayer.playerRatings[0].power}</div>
                                        <div>Technical: {selectedPlayer.playerRatings[0].technical}</div>
                                        <div>Defense: {selectedPlayer.playerRatings[0].defensive}</div>
                                        <div>Temperament: {selectedPlayer.playerRatings[0].temperament}</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold mb-2">Bowling</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>Economy: {selectedPlayer.playerRatings[0].economy}</div>
                                        <div>Control: {selectedPlayer.playerRatings[0].control}</div>
                                        <div>Wicket Taking: {selectedPlayer.playerRatings[0].wicketTaking}</div>
                                        <div>Clutch: {selectedPlayer.playerRatings[0].clutch}</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold mb-2">Other</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>Fielding: {selectedPlayer.playerRatings[0].fielding}</div>
                                        <div>Fitness: {selectedPlayer.playerRatings[0].fitness}</div>
                                        <div>Leadership: {selectedPlayer.playerRatings[0].leadership}</div>
                                        <div>Consistency: {selectedPlayer.playerRatings[0].consistency}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 