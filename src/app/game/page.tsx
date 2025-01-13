'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Team } from '@/models/Team/Team';
import { LocalStorageManager } from '@/utils/LocalStorageManager';
import { League } from '@/models/League/League';
import { SeasonScreen } from '@/screens/SeasonScreen';
import { Game } from '@/models/Game/Game';
import { Player } from '@/models/Player/Player';

export default function GamePage() {
    const searchParams = useSearchParams();
    const [league, setLeague] = useState<League | null>(null);
    const [homeTeam, setHomeTeam] = useState<Team | null>(null);
    const [awayTeam, setAwayTeam] = useState<Team | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [simSpeed, setSimSpeed] = useState(1000);
    const [selectedPlayer, setSelectedPlayer] = useState<{
        player: ReturnType<typeof getPlayerInfo>;
        ratings: {
            power: number;
            technical: number;
            temperament: number;
            economy: number;
            control: number;
            wicketTaking: number;
            clutch: number;
            fitness: number;
            fielding: number;
            consistency: number;
            leadership: number;
            defensive: number;
        };
        fullPlayer: Player;
    } | null>(null);

    // Helper function to get player info
    const getPlayerInfo = (playerId: number) => {
        if (!league) return null;
        const player = league.players.find(p => p.id === playerId);
        if (!player) return null;
        return {
            name: player.name,
            battingStyle: player.battingStyle,
            bowlingStyle: player.bowlingStyle,
            hand: player.hand,
            isWicketKeeper: player.wicketKeeper
        };
    };

    useEffect(() => {
        // Load league and teams
        const homeTeamId = Number(searchParams.get('homeTeam'));
        const awayTeamId = Number(searchParams.get('awayTeam'));
        
        const loadedLeague = LocalStorageManager.getLeague();
        
        if (loadedLeague) {
            setLeague(loadedLeague);
            const homeTeam = loadedLeague.teams.find(t => t.id === homeTeamId) || null;
            const awayTeam = loadedLeague.teams.find(t => t.id === awayTeamId) || null;
            setHomeTeam(homeTeam);
            setAwayTeam(awayTeam);

            // Initialize game if teams are found
            if (homeTeam && awayTeam) {
                const seasonScreen = SeasonScreen.loadFromLocalStorage(loadedLeague);
                const homeLineup = seasonScreen.getTeamLineup(homeTeam.id);
                const awayLineup = seasonScreen.getTeamLineup(awayTeam.id);

                // Validate lineups
                if (!homeLineup?.battingOrder?.length || !awayLineup?.battingOrder?.length) {
                    console.error('Invalid lineups:', { 
                        homeLineup: homeLineup?.battingOrder, 
                        awayLineup: awayLineup?.battingOrder 
                    });
                    return;
                }

                // Create game instance
                const gameInstance = new Game(
                    {
                        stadium: homeTeam.stadium,
                        battingLineup: homeLineup.battingOrder,
                        bowlingOrder: homeLineup.bowlingOrder,
                        players: homeTeam.players,
                        teamName: homeTeam.name,
                        homeAdvantage: 1.1
                    },
                    {
                        stadium: awayTeam.stadium,
                        battingLineup: awayLineup.battingOrder,
                        bowlingOrder: awayLineup.bowlingOrder,
                        players: awayTeam.players,
                        teamName: awayTeam.name,
                        homeAdvantage: 1.0
                    },
                    loadedLeague.players,
                    loadedLeague.stadiums
                );

                setGame(gameInstance);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (!game || game.isComplete || isPaused) return;

        const timer = setTimeout(() => {
            // Validate player IDs before simulation
            const currentBatterIndex = game.currentBatters[0];
            const currentBatterID = game.currentBattingTeam.battingLineup[currentBatterIndex];
            const currentBowlerID = game.currentBowlingTeam.bowlingOrder[Math.floor(game.currentBalls / 6)];
            
            if (!currentBatterID || !currentBowlerID) {
                console.error('Invalid player IDs:', { 
                    currentBatterIndex,
                    currentBatterID, 
                    currentBowlerID,
                    battingLineup: game.currentBattingTeam.battingLineup,
                    bowlingOrder: game.currentBowlingTeam.bowlingOrder
                });
                setIsPaused(true);
                return;
            }

            // Simulate a single ball
            game.simulateBall();
            // Force a re-render by creating a new Game instance with the same state
            setGame(prevGame => {
                if (!prevGame) return null;
                return Object.assign(Object.create(Object.getPrototypeOf(prevGame)), prevGame);
            });
        }, simSpeed);

        return () => clearTimeout(timer);
    }, [game, isPaused, simSpeed]);

    if (!league || !homeTeam || !awayTeam || !game) {
        return <div>Loading...</div>;
    }

    // Get stadium from league
    const stadium = league.stadiums.find(s => s.id === homeTeam.stadium);
    const scorecard = game.getScorecard();
    const battingTeamIsHome = game.currentBattingTeam.teamName === homeTeam.name;
    const currentBatterStats = battingTeamIsHome ? 
        (game.currentInnings === 1 ? scorecard.firstInningsBatting : scorecard.secondInningsBatting) :
        (game.currentInnings === 1 ? scorecard.firstInningsBatting : scorecard.secondInningsBatting);
    const currentBowlerStats = battingTeamIsHome ? 
        (game.currentInnings === 1 ? scorecard.firstInningsBowling : scorecard.secondInningsBowling) :
        (game.currentInnings === 1 ? scorecard.firstInningsBowling : scorecard.secondInningsBowling);

    // Debug logging
    console.log('Current Innings:', game.currentInnings);
    console.log('Batting Team Is Home:', battingTeamIsHome);
    console.log('Current Batter Stats:', currentBatterStats);
    console.log('Current Bowler Stats:', currentBowlerStats);
    console.log('Full Scorecard:', scorecard);

    return (
        <div className="container mx-auto p-4">
            {/* Player Info Modal */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {selectedPlayer.player?.name}
                                    </h2>
                                    <div className="text-gray-600 mt-1">
                                        {selectedPlayer.player?.battingStyle} • {selectedPlayer.player?.bowlingStyle} • {selectedPlayer.player?.hand}
                                        {selectedPlayer.player?.isWicketKeeper && ' • Wicket Keeper'}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <div>Age: {selectedPlayer.fullPlayer.age}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedPlayer(null)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Batting Ratings */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg text-blue-800 mb-3">Batting Ratings</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700">Power</span>
                                            <div className="w-32 bg-blue-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 rounded-full h-2" 
                                                    style={{width: `${selectedPlayer.ratings.power}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-blue-700 w-8 text-right">{selectedPlayer.ratings.power}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700">Technical</span>
                                            <div className="w-32 bg-blue-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 rounded-full h-2" 
                                                    style={{width: `${selectedPlayer.ratings.technical}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-blue-700 w-8 text-right">{selectedPlayer.ratings.technical}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700">Defensive</span>
                                            <div className="w-32 bg-blue-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 rounded-full h-2" 
                                                    style={{width: `${selectedPlayer.ratings.defensive}%`}}
                                                ></div>
                                            </div>
                                                    <span className="text-blue-700 w-8 text-right">{selectedPlayer.ratings.defensive}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700">Temperament</span>
                                            <div className="w-32 bg-blue-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 rounded-full h-2" 
                                                    style={{width: `${selectedPlayer.ratings.temperament}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-blue-700 w-8 text-right">{selectedPlayer.ratings.temperament}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bowling Ratings */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg text-green-800 mb-3">Bowling Ratings</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-700">Economy</span>
                                            <div className="w-32 bg-green-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-600 rounded-full h-2" 
                                                    style={{width: `${selectedPlayer.ratings.economy}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-green-700 w-8 text-right">{selectedPlayer.ratings.economy}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-700">Control</span>
                                            <div className="w-32 bg-green-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-600 rounded-full h-2" 
                                                    style={{width: `${selectedPlayer.ratings.control}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-green-700 w-8 text-right">{selectedPlayer.ratings.control}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-700">Wicket Taking</span>
                                            <div className="w-32 bg-green-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-600 rounded-full h-2" 
                                                    style={{width: `${selectedPlayer.ratings.wicketTaking}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-green-700 w-8 text-right">{selectedPlayer.ratings.wicketTaking}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fielding & General Ratings */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 col-span-2">
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Fielding Section */}
                                        <div>
                                            <h3 className="font-semibold text-lg text-purple-800 mb-3">Fielding</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-purple-700">Fielding</span>
                                                    <div className="w-32 bg-purple-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-purple-600 rounded-full h-2" 
                                                            style={{width: `${selectedPlayer.ratings.fielding}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-purple-700 w-8 text-right">{selectedPlayer.ratings.fielding}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* General Ratings Section */}
                                        <div>
                                            <h3 className="font-semibold text-lg text-purple-800 mb-3">General</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-purple-700">Fitness</span>
                                                    <div className="w-32 bg-purple-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-purple-600 rounded-full h-2" 
                                                            style={{width: `${selectedPlayer.ratings.fitness}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-purple-700 w-8 text-right">{selectedPlayer.ratings.fitness}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-purple-700">Leadership</span>
                                                    <div className="w-32 bg-purple-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-purple-600 rounded-full h-2" 
                                                            style={{width: `${selectedPlayer.ratings.leadership}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-purple-700 w-8 text-right">{selectedPlayer.ratings.leadership}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-purple-700">Consistency</span>
                                                    <div className="w-32 bg-purple-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-purple-600 rounded-full h-2" 
                                                            style={{width: `${selectedPlayer.ratings.consistency}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-purple-700 w-8 text-right">{selectedPlayer.ratings.consistency}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-purple-700">Clutch</span>
                                                    <div className="w-32 bg-purple-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-purple-600 rounded-full h-2" 
                                                            style={{width: `${selectedPlayer.ratings.clutch}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-purple-700 w-8 text-right">{selectedPlayer.ratings.clutch}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Ratings */}
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 col-span-2">
                                    <h3 className="font-semibold text-lg text-amber-800 mb-3">Overall Ratings</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-700">Overall</span>
                                                <div className="w-32 bg-amber-200 rounded-full h-3">
                                                    <div 
                                                        className="bg-amber-600 rounded-full h-3" 
                                                        style={{width: `${selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].overall}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-amber-700 w-8 text-right">{selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].overall}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-700">Batting</span>
                                                <div className="w-32 bg-amber-200 rounded-full h-3">
                                                    <div 
                                                        className="bg-amber-600 rounded-full h-3" 
                                                        style={{width: `${selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].batting}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-amber-700 w-8 text-right">{selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].batting}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-700">Bowling</span>
                                                <div className="w-32 bg-amber-200 rounded-full h-3">
                                                    <div 
                                                        className="bg-amber-600 rounded-full h-3" 
                                                        style={{width: `${selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].bowling}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-amber-700 w-8 text-right">{selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].bowling}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-700">Fielding</span>
                                                <div className="w-32 bg-amber-200 rounded-full h-3">
                                                    <div 
                                                        className="bg-amber-600 rounded-full h-3" 
                                                        style={{width: `${selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].fieldingOverall}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-amber-700 w-8 text-right">{selectedPlayer.fullPlayer.playerRatings[selectedPlayer.fullPlayer.playerRatings.length - 1].fieldingOverall}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-amber-800">
                                                    {selectedPlayer.fullPlayer.getPlayerRole()}
                                                </div>
                                                <div className="text-sm text-amber-600">Player Role</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-4">
                {/* Match Header */}
                <div className="col-span-12 bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-xl font-bold">{homeTeam.name}</div>
                            <div className="text-sm text-gray-600">Home Team</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold">{stadium?.name}</div>
                            <div className="text-sm text-gray-600">
                                <div>Capacity: {stadium?.capacity.toLocaleString()}</div>
                                <div>Location: {stadium?.location}</div>
                                <div>Pitch Type: {stadium?.pitchType}</div>
                                <div>Boundary Size: {stadium?.boundarySize}</div>
                                <div>Batting Friendliness: {stadium && (
                                    stadium.battingFriendly > 70 ? 'Batting Paradise' :
                                    stadium.battingFriendly > 55 ? 'Batting Friendly' :
                                    stadium.battingFriendly > 45 ? 'Balanced' :
                                    stadium.battingFriendly > 30 ? 'Bowling Friendly' :
                                    'Bowler\'s Paradise'
                                )}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold">{awayTeam.name}</div>
                            <div className="text-sm text-gray-600">Away Team</div>
                        </div>
                    </div>
                </div>

                {/* Simulation Controls */}
                <div className="col-span-12 bg-white rounded-lg shadow p-4">
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <select
                            value={simSpeed}
                            onChange={(e) => setSimSpeed(Number(e.target.value))}
                            className="px-4 py-2 border rounded"
                        >
                            <option value={2000}>Slow</option>
                            <option value={1000}>Normal</option>
                            <option value={500}>Fast</option>
                            <option value={100}>Very Fast</option>
                        </select>
                    </div>
                </div>

                {/* Main Game Info */}
                <div className="col-span-8">
                    {/* Score and Match Info */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <div className="text-3xl font-bold mb-2">
                            {game.currentBattingTeam.teamName} {game.currentScore}/
                            {currentBatterStats.filter(b => b.howOut).length}
                            {game.currentInnings === 2 && ` (Target: ${game.currentInnings1Score + 1})`}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div>Overs: {game.currentOvers}.{game.currentBalls}</div>
                                <div>RR: {((game.currentScore * 6) / 
                                    Math.max(1, (game.currentOvers * 6 + game.currentBalls))).toFixed(2)}</div>
                                {game.currentInnings === 2 && (
                                    <div>REQ: {(((game.currentInnings1Score + 1 - game.currentScore) * 6) / 
                                        Math.max(1, (120 - (game.currentOvers * 6 + game.currentBalls)))).toFixed(2)} RPO</div>
                                )}
                            </div>
                            <div className="text-right">
                                {game.currentInnings === 1 ? (
                                    <div>First Innings</div>
                                ) : (
                                    <div>
                                        First Innings: {game.currentInnings1Score}/{game.currentInnings1Wickets} 
                                        ({Math.floor(game.currentInnings1Balls / 6)}.{game.currentInnings1Balls % 6} ov)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Current Batters and Bowler Section */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Current Batters */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Current Batters</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-sm text-gray-600 border-b">
                                        <th className="text-left pb-2">Batter</th>
                                        <th className="text-right pb-2">R</th>
                                        <th className="text-right pb-2">B</th>
                                        <th className="text-right pb-2">4s</th>
                                        <th className="text-right pb-2">6s</th>
                                        <th className="text-right pb-2">SR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {game.currentBatters.slice(0, 2).map((batterIndex, idx) => {
                                        const batterId = game.currentBattingTeam.battingLineup[batterIndex];
                                        const stats = currentBatterStats.find(s => s.playerId === batterId);
                                        const player = getPlayerInfo(batterId);
                                        return (
                                            <tr key={`current_batter_${batterId}_${idx}`} className="border-b last:border-0">
                                                <td className="py-2">
                                                    <div 
                                                        className="cursor-pointer hover:text-blue-600 transition-colors"
                                                        onClick={() => {
                                                            const fullPlayer = league.players.find(p => p.id === batterId);
                                                            const ratings = fullPlayer?.playerRatings.slice(-1)[0];
                                                            if (player && ratings) {
                                                                setSelectedPlayer({ player, ratings, fullPlayer });
                                                            }
                                                        }}
                                                    >
                                                        {player?.name || 'Unknown'} {idx === 0 ? '*' : ''}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-right font-medium">{stats?.runs || 0}</td>
                                                <td className="py-2 text-right">{stats?.balls || 0}</td>
                                                <td className="py-2 text-right">{stats?.fours || 0}</td>
                                                <td className="py-2 text-right">{stats?.sixes || 0}</td>
                                                <td className="py-2 text-right text-gray-600">
                                                    {stats?.balls ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Current Bowler */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Current Bowler</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-sm text-gray-600 border-b">
                                        <th className="text-left pb-2">Bowler</th>
                                        <th className="text-right pb-2">O</th>
                                        <th className="text-right pb-2">M</th>
                                        <th className="text-right pb-2">R</th>
                                        <th className="text-right pb-2">W</th>
                                        <th className="text-right pb-2">Econ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const currentBowlerId = game.currentBowlingTeam.bowlingOrder[game.currentOvers];
                                        const stats = currentBowlerStats.find(s => s.playerId === currentBowlerId);
                                        const player = getPlayerInfo(currentBowlerId);
                                        return (
                                            <tr key={`current_bowler_${currentBowlerId}_${game.currentOvers}_${game.currentBalls}`}>
                                                <td className="py-2">
                                                    <div 
                                                        className="cursor-pointer hover:text-blue-600 transition-colors"
                                                        onClick={() => {
                                                            const fullPlayer = league.players.find(p => p.id === currentBowlerId);
                                                            const ratings = fullPlayer?.playerRatings.slice(-1)[0];
                                                            if (player && ratings) {
                                                                setSelectedPlayer({ player, ratings, fullPlayer });
                                                            }
                                                        }}
                                                    >
                                                        {player?.name || 'Unknown'} *
                                                    </div>
                                                </td>
                                                <td className="py-2 text-right font-medium">
                                                    {Math.floor((stats?.balls || 0) / 6)}.{(stats?.balls || 0) % 6}
                                                </td>
                                                <td className="py-2 text-right">{stats?.maidens || 0}</td>
                                                <td className="py-2 text-right">{stats?.runs || 0}</td>
                                                <td className="py-2 text-right">{stats?.wickets || 0}</td>
                                                <td className="py-2 text-right text-gray-600">
                                                    {stats?.balls ? ((stats.runs * 6) / stats.balls).toFixed(1) : '0.0'}
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>



                    {/* Complete Scorecards */}
                    {/* First Innings Batting */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="font-bold text-xl mb-4">
                            {game.currentInnings === 1 ? 'Current Innings' : 'First Innings'} - {game.currentInnings === 1 ? game.currentBattingTeam.teamName : (battingTeamIsHome ? awayTeam.name : homeTeam.name)} Batting
                        </h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-2 w-1/3">Batter</th>
                                    <th className="pb-2"></th>
                                    <th className="pb-2 text-right">R</th>
                                    <th className="pb-2 text-right">B</th>
                                    <th className="pb-2 text-right">4s</th>
                                    <th className="pb-2 text-right">6s</th>
                                    <th className="pb-2 text-right">SR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(game.currentInnings === 1 ? currentBatterStats : scorecard.firstInningsBatting).map((stats) => {
                                    const player = getPlayerInfo(stats.playerId);
                                    return (
                                        <tr key={stats.playerId} className="border-b last:border-0">
                                            <td className="py-2">
                                                <div className="font-medium">
                                                    {player?.name || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {player?.battingStyle} • {player?.hand}
                                                    {player?.isWicketKeeper && ' • 🧤'}
                                                </div>
                                            </td>
                                            <td className="py-2 text-xs text-gray-500">
                                                {stats.howOut?.toString() || 'not out'}
                                            </td>
                                            <td className="py-2 text-right">{stats.runs}</td>
                                            <td className="py-2 text-right">{stats.balls}</td>
                                            <td className="py-2 text-right">{stats.fours}</td>
                                            <td className="py-2 text-right">{stats.sixes}</td>
                                            <td className="py-2 text-right">
                                                {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Yet to Bat */}
                                {(() => {
                                    const battedPlayers = new Set((game.currentInnings === 1 ? currentBatterStats : scorecard.firstInningsBatting).map(s => s.playerId));
                                    const currentTeam = game.currentInnings === 1 ? 
                                        game.currentBattingTeam : 
                                        (battingTeamIsHome ? game.currentBowlingTeam : game.currentBattingTeam);
                                    return currentTeam.battingLineup
                                        .filter((id: number) => !battedPlayers.has(id))
                                        .map((playerId: number) => {
                                            const player = getPlayerInfo(playerId);
                                            return (
                                                <tr key={`yet_to_bat_${playerId}`} className="border-b last:border-0 text-gray-500">
                                                    <td className="py-2">
                                                        <div className="font-medium">
                                                            {player?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs">
                                                            {player?.battingStyle} • {player?.hand}
                                                            {player?.isWicketKeeper && ' • 🧤'}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-xs">Yet to bat</td>
                                                    <td className="py-2 text-right">-</td>
                                                    <td className="py-2 text-right">-</td>
                                                    <td className="py-2 text-right">-</td>
                                                    <td className="py-2 text-right">-</td>
                                                    <td className="py-2 text-right">-</td>
                                                </tr>
                                            );
                                        });
                                })()}
                            </tbody>
                        </table>
                    </div>

                    {/* First Innings Bowling */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="font-bold text-xl mb-4">
                            {game.currentInnings === 1 ? 'Current Innings' : 'First Innings'} - {game.currentInnings === 1 ? game.currentBowlingTeam.teamName : (battingTeamIsHome ? homeTeam.name : awayTeam.name)} Bowling
                        </h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-2 w-1/3">Bowler</th>
                                    <th className="pb-2 text-right">O</th>
                                    <th className="pb-2 text-right">M</th>
                                    <th className="pb-2 text-right">R</th>
                                    <th className="pb-2 text-right">W</th>
                                    <th className="pb-2 text-right">Econ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(game.currentInnings === 1 ? currentBowlerStats : scorecard.firstInningsBowling)
                                    .filter((stats, index, self) => 
                                        index === self.findIndex((s) => s.playerId === stats.playerId)
                                    )
                                    .map((stats) => {
                                        const player = getPlayerInfo(stats.playerId);
                                        return (
                                            <tr key={`first_innings_${stats.playerId}`} className="border-b last:border-0">
                                                <td className="py-2">
                                                    <div className="font-medium">
                                                        {player?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {player?.bowlingStyle} • {player?.hand}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-right">
                                                    {Math.floor((stats?.balls || 0) / 6)}.{(stats?.balls || 0) % 6}
                                                </td>
                                                <td className="py-2 text-right">{stats?.maidens || 0}</td>
                                                <td className="py-2 text-right">{stats?.runs || 0}</td>
                                                <td className="py-2 text-right">{stats?.wickets || 0}</td>
                                                <td className="py-2 text-right text-gray-600">
                                                    {stats?.balls ? ((stats.runs * 6) / stats.balls).toFixed(1) : '0.0'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>

                    {/* Second Innings Batting */}
                    {game.currentInnings === 2 && (
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <h3 className="font-bold text-xl mb-4">Current Innings - {game.currentBattingTeam.teamName} Batting</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-2 w-1/3">Batter</th>
                                        <th className="pb-2"></th>
                                        <th className="pb-2 text-right">R</th>
                                        <th className="pb-2 text-right">B</th>
                                        <th className="pb-2 text-right">4s</th>
                                        <th className="pb-2 text-right">6s</th>
                                        <th className="pb-2 text-right">SR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBatterStats.map((stats) => {
                                        const player = getPlayerInfo(stats.playerId);
                                        return (
                                            <tr key={stats.playerId} className="border-b last:border-0">
                                                <td className="py-2">
                                                    <div className="font-medium">
                                                        {player?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {player?.battingStyle} • {player?.hand}
                                                        {player?.isWicketKeeper && ' • 🧤'}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-xs text-gray-500">
                                                    {stats.howOut?.toString() || 'not out'}
                                                </td>
                                                <td className="py-2 text-right">{stats.runs}</td>
                                                <td className="py-2 text-right">{stats.balls}</td>
                                                <td className="py-2 text-right">{stats.fours}</td>
                                                <td className="py-2 text-right">{stats.sixes}</td>
                                                <td className="py-2 text-right">
                                                    {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Yet to Bat */}
                                    {(() => {
                                        const battedPlayers = new Set(currentBatterStats.map(s => s.playerId));
                                        return game.currentBattingTeam.battingLineup
                                            .filter(id => !battedPlayers.has(id))
                                            .map(playerId => {
                                                const player = getPlayerInfo(playerId);
                                                return (
                                                    <tr key={`yet_to_bat_${playerId}`} className="border-b last:border-0 text-gray-500">
                                                        <td className="py-2">
                                                            <div className="font-medium">
                                                                {player?.name || 'Unknown'}
                                                            </div>
                                                            <div className="text-xs">
                                                                {player?.battingStyle} • {player?.hand}
                                                                {player?.isWicketKeeper && ' • 🧤'}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 text-xs">Yet to bat</td>
                                                        <td className="py-2 text-right">-</td>
                                                        <td className="py-2 text-right">-</td>
                                                        <td className="py-2 text-right">-</td>
                                                        <td className="py-2 text-right">-</td>
                                                        <td className="py-2 text-right">-</td>
                                                    </tr>
                                                );
                                            });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Second Innings Bowling */}
                    {game.currentInnings === 2 && (
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-bold text-xl mb-4">Current Innings - {game.currentBowlingTeam.teamName} Bowling</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-2 w-1/3">Bowler</th>
                                        <th className="pb-2 text-right">O</th>
                                        <th className="pb-2 text-right">M</th>
                                        <th className="pb-2 text-right">R</th>
                                        <th className="pb-2 text-right">W</th>
                                        <th className="pb-2 text-right">Econ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBowlerStats
                                        .filter((stats, index, self) => 
                                            index === self.findIndex((s) => s.playerId === stats.playerId)
                                        )
                                        .map((stats) => {
                                            const player = getPlayerInfo(stats.playerId);
                                            return (
                                                <tr key={`second_innings_${stats.playerId}`} className="border-b last:border-0">
                                                    <td className="py-2">
                                                        <div className="font-medium">
                                                            {player?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {player?.bowlingStyle} • {player?.hand}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        {Math.floor((stats?.balls || 0) / 6)}.{(stats?.balls || 0) % 6}
                                                    </td>
                                                    <td className="py-2 text-right">{stats?.maidens || 0}</td>
                                                    <td className="py-2 text-right">{stats?.runs || 0}</td>
                                                    <td className="py-2 text-right">{stats?.wickets || 0}</td>
                                                    <td className="py-2 text-right text-gray-600">
                                                        {stats?.balls ? ((stats.runs * 6) / stats.balls).toFixed(1) : '0.0'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                <div className="col-span-4">
                    {/* Play Log */}
                    <div className="bg-white rounded-lg shadow p-4 h-[600px] overflow-y-auto">
                        <h3 className="font-bold text-lg mb-4 sticky top-0 bg-white">Play by Play</h3>
                        <div className="space-y-2 flex flex-col-reverse">
                            {game.currentPlayLog.map((play, i) => (
                                <div key={i} className="text-sm p-2 bg-gray-50 rounded">
                                    {play}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 