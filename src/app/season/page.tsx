'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocalStorageManager } from '../../utils/LocalStorageManager';
import { SeasonScreen } from '../../screens/SeasonScreen';
import { TeamLineup } from '../../models/Team/TeamLineup';
import { Team } from '../../models/Team/Team';
import { ScheduleGame } from '../../models/Season/ScheduleGame';
import { Game } from '../../models/Game/Game';
import { BattingScorecard } from '../../models/Scorecard/BattingScorecard';
import { BowlingScorecard } from '../../models/Scorecard/BowlingScorecard';
import { Scorecard } from '../../models/Scorecard/Scorecard';

type TabType = 'schedule' | 'lineups' | 'standings';

export default function SeasonPage() {
    const router = useRouter();
    const [seasonScreen, setSeasonScreen] = useState<SeasonScreen | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('schedule');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [editingLineup, setEditingLineup] = useState<TeamLineup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showScorecard, setShowScorecard] = useState(false);
    const [selectedScorecard, setSelectedScorecard] = useState<Scorecard | null>(null);

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

    const handleSimulateGame = (game: ScheduleGame) => {
        const homeTeam = league.teams.find(t => t.id === game.homeTeam)!;
        const awayTeam = league.teams.find(t => t.id === game.awayTeam)!;
        const homeLineup = seasonScreen.getTeamLineup(homeTeam.id);
        const awayLineup = seasonScreen.getTeamLineup(awayTeam.id);
        const players = league.players;

        // Create game instance
        const gameInstance = new Game(
            {
                teamName: homeTeam.name,
                battingLineup: homeLineup.battingOrder,
                bowlingOrder: homeLineup.bowlingOrder,
                homeAdvantage: 1.1, // Small home advantage
                stadium: game.stadium,
                players: homeTeam.players
            },
            {
                teamName: awayTeam.name,
                battingLineup: awayLineup.battingOrder,
                bowlingOrder: awayLineup.bowlingOrder,
                homeAdvantage: 1.0,
                stadium: game.stadium,
                players: awayTeam.players
            },
            players,
            league.stadiums
        );

        // Run the game
        gameInstance.runGame();

        // Get scorecard from game results
        const scorecard = gameInstance.getScorecard();
        scorecard.gameId = game.id;

        // Update game with scores
        game.homeScore = getTotalScore(scorecard.homeTeamBatting);
        game.awayScore = getTotalScore(scorecard.awayTeamBatting);
        game.homeWickets = getWicketsFallen(scorecard.homeTeamBatting);
        game.awayWickets = getWicketsFallen(scorecard.awayTeamBatting);

        // Update season with new scorecard
        const season = seasonScreen.getCurrentSeason();
        season.scorecards.push(scorecard);
        season.currentGame++;
        
        // Save updated season
        seasonScreen.saveToLocalStorage();
        
        // Refresh the screen
        setSeasonScreen(SeasonScreen.loadFromLocalStorage(league));
    };

    // Add new function for handling game viewing
    const handlePlayGame = (homeTeam: Team, awayTeam: Team) => {
        // Navigate to game page with teams as params
        window.location.href = `/game?homeTeam=${homeTeam.id}&awayTeam=${awayTeam.id}`;
    };

    // Helper function to format batting stats
    const formatBattingStats = (stats: BattingScorecard) => {
        if (!stats.howOut) return 'Did not bat';
        return `${stats.runs} (${stats.balls}) - ${stats.fours}x4s, ${stats.sixes}x6s`;
    };

    // Helper function to format bowling stats
    const formatBowlingStats = (stats: BowlingScorecard) => {
        return `${stats.overs}-${stats.maidens}-${stats.runs}-${stats.wickets}`;
    };

    const handleViewScorecard = (game: ScheduleGame) => {
        const scorecard = season.scorecards.find(s => s.gameId === game.id);
        if (scorecard) {
            setSelectedScorecard(scorecard);
            setShowScorecard(true);
        }
    };

    const renderScorecard = () => {
        if (!selectedScorecard || !showScorecard) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Match Scorecard</h2>
                            <button 
                                onClick={() => setShowScorecard(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* First Innings */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4">First Innings</h3>
                            <div className="space-y-6">
                                {/* Batting */}
                                <div>
                                    <h4 className="font-bold mb-2">Batting</h4>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="pb-2">Batter</th>
                                                <th className="pb-2">R</th>
                                                <th className="pb-2">B</th>
                                                <th className="pb-2">4s</th>
                                                <th className="pb-2">6s</th>
                                                <th className="pb-2">SR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedScorecard.homeTeamBatting.map((stats, i) => {
                                                const player = league.players.find(p => p.id === stats.playerId);
                                                if (!player) return null;
                                                return (
                                                    <tr key={i} className="border-b">
                                                        <td className="py-2">
                                                            <div>{player.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {stats.howOut || 'not out'}
                                                            </div>
                                                        </td>
                                                        <td className="py-2">{stats.runs}</td>
                                                        <td className="py-2">{stats.balls}</td>
                                                        <td className="py-2">{stats.fours}</td>
                                                        <td className="py-2">{stats.sixes}</td>
                                                        <td className="py-2">
                                                            {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Bowling */}
                                <div>
                                    <h4 className="font-bold mb-2">Bowling</h4>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="pb-2">Bowler</th>
                                                <th className="pb-2">O</th>
                                                <th className="pb-2">M</th>
                                                <th className="pb-2">R</th>
                                                <th className="pb-2">W</th>
                                                <th className="pb-2">Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedScorecard.awayTeamBowling.map((stats, i) => {
                                                const player = league.players.find(p => p.id === stats.playerId);
                                                if (!player) return null;
                                                return (
                                                    <tr key={i} className="border-b">
                                                        <td className="py-2">{player.name}</td>
                                                        <td className="py-2">{stats.overs}</td>
                                                        <td className="py-2">{stats.maidens}</td>
                                                        <td className="py-2">{stats.runs}</td>
                                                        <td className="py-2">{stats.wickets}</td>
                                                        <td className="py-2">
                                                            {stats.overs > 0 ? (stats.runs / stats.overs).toFixed(1) : 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Second Innings */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Second Innings</h3>
                            <div className="space-y-6">
                                {/* Batting */}
                                <div>
                                    <h4 className="font-bold mb-2">Batting</h4>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="pb-2">Batter</th>
                                                <th className="pb-2">R</th>
                                                <th className="pb-2">B</th>
                                                <th className="pb-2">4s</th>
                                                <th className="pb-2">6s</th>
                                                <th className="pb-2">SR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedScorecard.awayTeamBatting.map((stats, i) => {
                                                const player = league.players.find(p => p.id === stats.playerId);
                                                if (!player) return null;
                                                return (
                                                    <tr key={i} className="border-b">
                                                        <td className="py-2">
                                                            <div>{player.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {stats.howOut || 'not out'}
                                                            </div>
                                                        </td>
                                                        <td className="py-2">{stats.runs}</td>
                                                        <td className="py-2">{stats.balls}</td>
                                                        <td className="py-2">{stats.fours}</td>
                                                        <td className="py-2">{stats.sixes}</td>
                                                        <td className="py-2">
                                                            {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Bowling */}
                                <div>
                                    <h4 className="font-bold mb-2">Bowling</h4>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="pb-2">Bowler</th>
                                                <th className="pb-2">O</th>
                                                <th className="pb-2">M</th>
                                                <th className="pb-2">R</th>
                                                <th className="pb-2">W</th>
                                                <th className="pb-2">Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedScorecard.homeTeamBowling.map((stats, i) => {
                                                const player = league.players.find(p => p.id === stats.playerId);
                                                if (!player) return null;
                                                return (
                                                    <tr key={i} className="border-b">
                                                        <td className="py-2">{player.name}</td>
                                                        <td className="py-2">{stats.overs}</td>
                                                        <td className="py-2">{stats.maidens}</td>
                                                        <td className="py-2">{stats.runs}</td>
                                                        <td className="py-2">{stats.wickets}</td>
                                                        <td className="py-2">
                                                            {stats.overs > 0 ? (stats.runs / stats.overs).toFixed(1) : 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                {schedule.map((game, i) => {
                    const homeTeam = league.teams.find(t => t.id === game.homeTeam)!;
                    const awayTeam = league.teams.find(t => t.id === game.awayTeam)!;
                    const isCompleted = game.homeScore !== undefined && game.awayScore !== undefined;

                    return (
                        <div key={i} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">Match {i + 1}</div>
                                {isCompleted && (
                                    <div className="text-sm text-gray-600">Completed</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="font-bold">{homeTeam.name}</div>
                                    <div className="font-bold mt-2">{awayTeam.name}</div>
                                </div>
                                <div className="flex-1 text-center">
                                    {isCompleted ? (
                                        <div className="space-y-2">
                                            <div className="font-bold">{game.homeScore}/{game.homeWickets}</div>
                                            <div className="font-bold">{game.awayScore}/{game.awayWickets}</div>
                                            <button
                                                onClick={() => handleViewScorecard(game)}
                                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                            >
                                                View Scorecard
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handlePlayGame(homeTeam, awayTeam)}
                                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                            >
                                                Play Game
                                            </button>
                                            <button
                                                onClick={() => handleSimulateGame(game)}
                                                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                            >
                                                Quick Sim
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {isCompleted && (
                                    <div className="flex-1 text-right">
                                        <div className="font-medium text-sm">
                                            {game.homeScore! > game.awayScore! ? 'Winner' : ''}
                                        </div>
                                        <div className="font-medium text-sm mt-2">
                                            {game.awayScore! > game.homeScore! ? 'Winner' : ''}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Helper functions for scorecard display
    const getTotalScore = (battingScores: BattingScorecard[]): number => {
        return battingScores.reduce((total, score) => total + score.runs, 0);
    };

    const getWicketsFallen = (battingScores: BattingScorecard[]): number => {
        return battingScores.filter(score => score.howOut !== null).length;
    };

    // Add a helper function to format hand display
    const formatHand = (hand: string): string => {
        return hand === 'Right Handed' ? 'R' : 'L';
    };

    const renderLineups = () => {
        const teams = league.teams.filter(t => t.id !== 0);
        const players = selectedTeam ? league.players.filter(p => selectedTeam.players.includes(p.id)) : [];
        
        // Get player ratings
        const getPlayerRatings = (playerId: number) => {
            const player = league.players.find(p => p.id === playerId);
            if (!player || !player.playerRatings.length) return null;
            const rating = player.playerRatings[player.playerRatings.length - 1];
            return {
                batting: rating.calcBattingRating(),
                bowling: rating.calcBowlingRating(),
                fielding: rating.calcFieldingRating(),
                overall: rating.calcOverallRating()
            };
        };

        // Get player name and role info
        const getPlayerInfo = (playerId: number) => {
            const player = league.players.find(p => p.id === playerId);
            if (!player) return null;
            return {
                name: player.name,
                isWicketKeeper: player.wicketKeeper,
                bowlingStyle: player.bowlingStyle,
                battingStyle: player.battingStyle,
                hand: player.hand
            };
        };

        // Get bench players (players not in batting order)
        const getBenchPlayers = () => {
            if (!selectedTeam || !editingLineup) return [];
            return players.filter(p => !editingLineup.battingOrder.includes(p.id));
        };

        return (
            <div className="grid grid-cols-12 gap-4">
                {/* Teams Sidebar */}
                <div className="col-span-3 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Teams</h3>
                    <div className="space-y-2">
                        {teams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => {
                                    setSelectedTeam(team);
                                    setEditingLineup(seasonScreen.getTeamLineup(team.id));
                                    setError(null);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                                    selectedTeam?.id === team.id
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedTeam && editingLineup && (
                    <div className="col-span-9 space-y-6">
                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                {error}
                            </div>
                        )}

                        {/* Batting Order */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-gray-800">Batting Order</h3>
                                {selectedTeam.id === league.userTeam && (
                                    <button
                                        onClick={handleSaveLineup}
                                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                                    >
                                        Save Lineup
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {Array.from({ length: 11 }, (_, i) => {
                                    const playerId = editingLineup.battingOrder[i];
                                    const playerInfo = playerId ? getPlayerInfo(playerId) : null;
                                    const ratings = playerId ? getPlayerRatings(playerId) : null;
                                    
                                    return (
                                        <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                            <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
                                                {i + 1}
                                            </span>
                                            {selectedTeam.id === league.userTeam ? (
                                                <select
                                                    value={playerId || ''}
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
                                                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select Player</option>
                                                    {players.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} ({formatHand(p.hand)}) 
                                                            {p.wicketKeeper ? ' • 🧤 WK' : ''} 
                                                            {` • ${p.battingStyle}`}
                                                            {p.bowlingStyle !== 'None' ? ` • ${p.bowlingStyle}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {playerInfo?.name || 'Not Selected'}
                                                            {playerInfo && <span className="ml-2 text-gray-500">({formatHand(playerInfo.hand)})</span>}
                                                            {playerInfo?.isWicketKeeper && <span className="ml-2 text-blue-500">🧤 WK</span>}
                                                        </span>
                                                        {playerInfo && (
                                                            <span className="text-sm text-gray-600">
                                                                {playerInfo.battingStyle}
                                                                {playerInfo.bowlingStyle !== 'None' && 
                                                                    <span className="ml-2 text-green-500">• {playerInfo.bowlingStyle}</span>
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {ratings && (
                                                        <div className="flex gap-4 text-sm">
                                                            <span className="text-blue-600">BAT: {ratings.batting}</span>
                                                            <span className="text-green-600">BOWL: {ratings.bowling}</span>
                                                            <span className="text-purple-600">FIELD: {ratings.fielding}</span>
                                                            <span className="font-bold">OVR: {ratings.overall}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bowling Order */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold text-xl text-gray-800 mb-6">Bowling Order</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {Array.from({ length: 20 }, (_, i) => {
                                    const playerId = editingLineup.bowlingOrder[i];
                                    const playerInfo = playerId ? getPlayerInfo(playerId) : null;
                                    const ratings = playerId ? getPlayerRatings(playerId) : null;
                                    const overNumber = i + 1;
                                    const isPowerplay = overNumber <= 6;
                                    const isDeath = overNumber >= 17;
                                    const phaseClass = isPowerplay ? 'bg-yellow-50' : isDeath ? 'bg-red-50' : 'bg-blue-50';
                                    const phaseText = isPowerplay ? '(PP)' : isDeath ? '(Death)' : '(Middle)';
                                    
                                    return (
                                        <div key={i} className={`${phaseClass} rounded-lg mb-2 transition-all hover:shadow-md`}>
                                            <div className="flex items-start gap-3 p-3">
                                                <div className={`
                                                    w-8 h-8 flex items-center justify-center rounded-full font-bold text-white
                                                    ${isPowerplay ? 'bg-yellow-500' : isDeath ? 'bg-red-500' : 'bg-blue-500'}
                                                `}>
                                                    {overNumber}
                                                </div>
                                                {selectedTeam.id === league.userTeam ? (
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-xs font-medium
                                                                ${isPowerplay ? 'text-yellow-700' : isDeath ? 'text-red-700' : 'text-blue-700'}
                                                            `}>
                                                                Over {overNumber} {phaseText}
                                                            </span>
                                                        </div>
                                                        <select
                                                            value={playerId || ''}
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
                                                            className={`
                                                                w-full p-2 text-sm border rounded-lg transition-all
                                                                focus:ring-2 focus:outline-none
                                                                ${isPowerplay ? 'focus:ring-yellow-400 border-yellow-200' : 
                                                                  isDeath ? 'focus:ring-red-400 border-red-200' : 
                                                                  'focus:ring-blue-400 border-blue-200'}
                                                            `}
                                                        >
                                                            <option value="">Select Bowler</option>
                                                            {players
                                                                .filter(p => p.bowlingStyle !== 'None')
                                                                .map(p => {
                                                                    const pRatings = getPlayerRatings(p.id);
                                                                    return (
                                                                        <option key={p.id} value={p.id}>
                                                                            {p.name} ({formatHand(p.hand)}) • {p.bowlingStyle}
                                                                            {pRatings ? ` • Bowl: ${pRatings.bowling}` : ''}
                                                                        </option>
                                                                    );
                                                                })
                                                            }
                                                        </select>
                                                        {playerInfo && (
                                                            <div className="mt-2 flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-gray-600">{playerInfo.bowlingStyle}</span>
                                                                    {playerInfo.isWicketKeeper && 
                                                                        <span className="text-blue-500">🧤</span>
                                                                    }
                                                                </div>
                                                                {ratings && (
                                                                    <div className="flex gap-3">
                                                                        <span className="text-green-600 font-medium">Bowl: {ratings.bowling}</span>
                                                                        <span className="text-gray-600 font-medium">Ovr: {ratings.overall}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm flex items-center gap-2">
                                                            {playerInfo?.name || 'Not Selected'}
                                                            {playerInfo && <span className="text-gray-500">({formatHand(playerInfo.hand)})</span>}
                                                            {playerInfo?.isWicketKeeper && <span className="text-blue-500">🧤</span>}
                                                        </div>
                                                        {playerInfo && (
                                                            <div className="text-xs space-y-0.5">
                                                                <div className="text-green-600">
                                                                    {playerInfo.bowlingStyle}
                                                                </div>
                                                                <div className="text-gray-600">
                                                                    {playerInfo.battingStyle}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bench Players */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold text-xl text-gray-800 mb-6">Bench</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {getBenchPlayers().map(player => {
                                    const ratings = getPlayerRatings(player.id);
                                    return (
                                        <div key={player.id} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{player.name}</span>
                                                        <span className="text-gray-500">({formatHand(player.hand)})</span>
                                                        {player.wicketKeeper && 
                                                            <span className="text-blue-500">🧤 WK</span>
                                                        }
                                                    </div>
                                                    <div className="text-sm space-y-0.5">
                                                        <div className="text-gray-600">
                                                            {player.battingStyle}
                                                        </div>
                                                        {player.bowlingStyle !== 'None' && 
                                                            <div className="text-green-600">
                                                                {player.bowlingStyle}
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                {ratings && (
                                                    <div className="text-sm text-right">
                                                        <div className="text-blue-600">BAT: {ratings.batting}</div>
                                                        <div className="text-green-600">BOWL: {ratings.bowling}</div>
                                                        <div className="text-purple-600">FIELD: {ratings.fielding}</div>
                                                        <div className="font-bold">OVR: {ratings.overall}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
        <div className="container mx-auto p-4">
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`px-4 py-2 rounded ${
                            activeTab === 'schedule' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                        }`}
                    >
                        Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('lineups')}
                        className={`px-4 py-2 rounded ${
                            activeTab === 'lineups' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                        }`}
                    >
                        Lineups
                    </button>
                    <button
                        onClick={() => setActiveTab('standings')}
                        className={`px-4 py-2 rounded ${
                            activeTab === 'standings' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                        }`}
                    >
                        Standings
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'schedule' && renderSchedule()}
                {activeTab === 'lineups' && renderLineups()}
                {activeTab === 'standings' && renderStandings()}
            </div>

            {/* Scorecard Modal */}
            {renderScorecard()}

            {/* Error Message */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </div>
    );
} 