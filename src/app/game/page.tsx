'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Team } from '@/models/Team/Team';
import { LocalStorageManager } from '@/utils/LocalStorageManager';
import { League } from '@/models/League/League';
import { SeasonScreen } from '@/screens/SeasonScreen';
import { Game } from '@/models/Game/Game';

interface GameState {
    currentOver: number;
    currentBall: number;
    battingTeam: Team | null;
    bowlingTeam: Team | null;
    score: number;
    wickets: number;
    currentBatters: number[];
    currentBowler: number;
    playLog: string[];
    isComplete: boolean;
    currentPartnership?: {
        runs: number;
        balls: number;
        batter1: number;
        batter2: number;
    };
    runRate: number;
    requiredRunRate?: number;
    target?: number;
    partnership: { runs: number; balls: number };
    currentBatterStats: { 
        [playerId: number]: { 
            runs: number; 
            balls: number; 
            fours: number; 
            sixes: number; 
            strikeRate: number;
            dismissal?: string;
        } 
    };
    bowlerStats: { 
        [playerId: number]: { 
            overs: number; 
            maidens: number; 
            runs: number; 
            wickets: number; 
            economy: number;
            dots: number;
        } 
    };
    extras: {
        wides: number;
        noBalls: number;
        legByes: number;
        total: number;
    };
    innings: number;
    lastOver: string[];
    fallOfWickets: Array<{
        score: number;
        wicket: number;
        overs: number;
        batter: number;
    }>;
    didNotBat: number[];
    partnerships: Array<{
        wicket: number;
        runs: number;
        batter1: number;
        batter2: number;
    }>;
}

export default function GamePage() {
    const searchParams = useSearchParams();
    const [league, setLeague] = useState<League | null>(null);
    const [homeTeam, setHomeTeam] = useState<Team | null>(null);
    const [awayTeam, setAwayTeam] = useState<Team | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [simSpeed, setSimSpeed] = useState(1000);

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

                console.log('Creating game with lineups:', {
                    homeBatting: homeLineup.battingOrder,
                    homeBowling: homeLineup.bowlingOrder,
                    awayBatting: awayLineup.battingOrder,
                    awayBowling: awayLineup.bowlingOrder
                });

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

                console.log('Game initialized with:', {
                    homeBattingLineup: gameInstance.currentBattingTeam.battingLineup,
                    currentBatters: gameInstance.currentBatters,
                    currentBatterIndex: gameInstance.currentBatters[0],
                    currentBatterID: gameInstance.currentBattingTeam.battingLineup[gameInstance.currentBatters[0]]
                });

                setGame(gameInstance);

                // Initialize game state
                setGameState({
                    currentOver: 0,
                    currentBall: 0,
                    battingTeam: homeTeam,
                    bowlingTeam: awayTeam,
                    score: 0,
                    wickets: 0,
                    currentBatters: [homeLineup.battingOrder[0], homeLineup.battingOrder[1]],
                    currentBowler: awayLineup.bowlingOrder[0],
                    playLog: ['Match started!'],
                    isComplete: false,
                    runRate: 0,
                    partnership: { runs: 0, balls: 0 },
                    currentBatterStats: {
                        [homeLineup.battingOrder[0]]: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
                        [homeLineup.battingOrder[1]]: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 }
                    },
                    bowlerStats: {
                        [awayLineup.bowlingOrder[0]]: { overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, dots: 0 }
                    },
                    extras: {
                        wides: 0,
                        noBalls: 0,
                        legByes: 0,
                        total: 0
                    },
                    innings: 1,
                    lastOver: [],
                    fallOfWickets: [],
                    didNotBat: homeLineup.battingOrder.slice(2),
                    partnerships: [{
                        wicket: 0,
                        runs: 0,
                        batter1: homeLineup.battingOrder[0],
                        batter2: homeLineup.battingOrder[1]
                    }],
                });
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (!game || !gameState || gameState.isComplete || isPaused) return;

        const timer = setTimeout(() => {
            // Validate player IDs before simulation
            const currentBatterIndex = game.currentBatters[0];
            const currentBatterID = game.currentBattingTeam.battingLineup[currentBatterIndex];
            const currentBowlerID = game.currentBowlingTeam.bowlingOrder[Math.floor(game.currentBalls / 6)];
            
            console.log('Validating players:', {
                currentBatterIndex,
                battingLineup: game.currentBattingTeam.battingLineup,
                currentBatterID,
                bowlingOrder: game.currentBowlingTeam.bowlingOrder,
                currentBowlerID,
                currentBalls: game.currentBalls
            });
            
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
            
            // Get updated scorecard
            const scorecard = game.getScorecard();
            const battingTeamIsHome = game.currentBattingTeam.teamName === homeTeam?.name;
            const battingStats = battingTeamIsHome ? scorecard.homeTeamBatting : scorecard.awayTeamBatting;
            const bowlingStats = battingTeamIsHome ? scorecard.awayTeamBowling : scorecard.homeTeamBowling;
            
            setGameState(prevState => {
                if (!prevState) return prevState;

                // Update state based on scorecard
                return {
                    ...prevState,
                    currentOver: Math.floor(game.currentBalls / 6),
                    currentBall: game.currentBalls % 6,
                    score: battingTeamIsHome ? game.currentInnings1Score : game.currentScore,
                    wickets: battingStats.filter(b => b.howOut).length,
                    currentBatters: game.currentBatters.slice(0, 2).map(idx => 
                        game.currentBattingTeam.battingLineup[idx]
                    ),
                    currentBowler: game.currentBowlingTeam.bowlingOrder[Math.floor(game.currentBalls / 6)],
                    isComplete: game.isComplete,
                    currentBatterStats: battingStats.reduce((acc, b) => ({
                        ...acc,
                        [b.playerId]: {
                            runs: b.runs,
                            balls: b.balls,
                            fours: b.fours,
                            sixes: b.sixes,
                            strikeRate: b.balls > 0 ? (b.runs / b.balls) * 100 : 0,
                            dismissal: b.howOut
                        }
                    }), {}),
                    bowlerStats: bowlingStats.reduce((acc, b) => {
                        const previousStats = prevState.bowlerStats[b.playerId] || { overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, dots: 0 };
                        const isCurrentBowler = b.playerId === game.currentBowlingTeam.bowlingOrder[Math.floor(game.currentBalls / 6)];
                        
                        // If this is the current bowler, add the current over's stats
                        if (isCurrentBowler) {
                            const ballsInOver = game.currentBalls % 6;
                            return {
                                ...acc,
                                [b.playerId]: {
                                    overs: previousStats.overs + (ballsInOver === 0 ? 1 : ballsInOver / 10),
                                    maidens: b.maidens,
                                    runs: b.runs,
                                    wickets: b.wickets,
                                    economy: b.runs / (previousStats.overs + (ballsInOver === 0 ? 1 : ballsInOver / 10)),
                                    dots: previousStats.dots + (b.runs === 0 ? 1 : 0)
                                }
                            };
                        }
                        
                        // For other bowlers, keep their previous stats
                        return {
                            ...acc,
                            [b.playerId]: {
                                ...previousStats,
                                maidens: b.maidens,
                                runs: b.runs,
                                wickets: b.wickets,
                                economy: previousStats.overs > 0 ? b.runs / previousStats.overs : 0
                            }
                        };
                    }, {}),
                    playLog: game.currentPlayLog,
                    lastOver: game.currentPlayLog.slice(-6).map(log => {
                        if (log.includes('FOUR')) return '4';
                        if (log.includes('SIX')) return '6';
                        if (log.includes('WICKET') || log.includes('CAUGHT') || log.includes('BOWLED') || log.includes('LBW') || log.includes('STUMPED')) return 'W';
                        if (log.includes('dot ball')) return '0';
                        const runs = log.match(/(\d+) runs?/);
                        return runs ? runs[1] : '0';
                    }),
                    runRate: (battingTeamIsHome ? game.currentInnings1Score : game.currentScore) / 
                        (Math.floor(game.currentBalls / 6) + ((game.currentBalls % 6) / 10)),
                    extras: {
                        wides: battingStats.reduce((sum, b) => sum + (b.howOut?.toString().includes('Wide') ? 1 : 0), 0),
                        noBalls: battingStats.reduce((sum, b) => sum + (b.howOut?.toString().includes('No Ball') ? 1 : 0), 0),
                        legByes: 0, // Not tracked in scorecard yet
                        total: battingStats.reduce((sum, b) => sum + (b.howOut?.toString().includes('Wide') || b.howOut?.toString().includes('No Ball') ? 1 : 0), 0)
                    },
                    partnership: {
                        runs: 0, // Will need to calculate from game state
                        balls: 0
                    },
                    fallOfWickets: [], // Will need to track in game state
                    partnerships: [], // Will need to track in game state
                    didNotBat: game.currentBattingTeam.battingLineup.slice(game.currentBatters.length)
                };
            });
        }, simSpeed);

        return () => clearTimeout(timer);
    }, [game, gameState, isPaused, simSpeed, homeTeam]);

    if (!league || !homeTeam || !awayTeam) {
        return <div>Loading...</div>;
    }

    // Get stadium from league
    const stadium = league.stadiums.find(s => s.id === homeTeam.stadium);

    return (
        <div className="container mx-auto p-4">
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
                            {gameState?.battingTeam?.name || 'Unknown Team'} {gameState?.score || 0}/{gameState?.wickets || 0}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div>Overs: {gameState?.currentOver || 0}.{gameState?.currentBall || 0}</div>
                                <div>RR: {gameState?.runRate?.toFixed(2) || 0}</div>
                                {gameState?.requiredRunRate && (
                                    <div>Req. RR: {gameState.requiredRunRate.toFixed(2)}</div>
                                )}
                            </div>
                            {gameState?.target && (
                                <div>
                                    <div>Target: {gameState.target}</div>
                                    <div>Need {gameState.target - (gameState.score || 0)} runs from {120 - ((gameState.currentOver || 0) * 6 + (gameState.currentBall || 0))} balls</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Batters */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Current Batters</h3>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left">Batter</th>
                                    <th className="text-right">R</th>
                                    <th className="text-right">B</th>
                                    <th className="text-right">4s</th>
                                    <th className="text-right">6s</th>
                                    <th className="text-right">SR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gameState?.currentBatters.map((batterId, idx) => {
                                    const stats = gameState.currentBatterStats[batterId];
                                    const player = getPlayerInfo(batterId);
                                    return (
                                        <tr key={batterId} className="border-b last:border-0">
                                            <td className="py-2">
                                                {player?.name || 'Unknown'} {idx === 0 ? '*' : ''}
                                            </td>
                                            <td className="py-2">{stats?.runs || 0}</td>
                                            <td className="py-2">{stats?.balls || 0}</td>
                                            <td className="py-2">{stats?.fours || 0}</td>
                                            <td className="py-2">{stats?.sixes || 0}</td>
                                            <td className="py-2">{stats?.strikeRate.toFixed(1) || 0}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Current Bowler - Moved up */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Current Bowler</h3>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left">Bowler</th>
                                    <th className="text-right">O</th>
                                    <th className="text-right">M</th>
                                    <th className="text-right">R</th>
                                    <th className="text-right">W</th>
                                    <th className="text-right">Econ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gameState?.currentBowler && (
                                    <tr>
                                        <td className="py-2">
                                            {getPlayerInfo(gameState.currentBowler)?.name || 'Unknown'} *
                                        </td>
                                        <td className="py-2">{gameState.bowlerStats[gameState.currentBowler]?.overs || 0}</td>
                                        <td className="py-2">{gameState.bowlerStats[gameState.currentBowler]?.maidens || 0}</td>
                                        <td className="py-2">{gameState.bowlerStats[gameState.currentBowler]?.runs || 0}</td>
                                        <td className="py-2">{gameState.bowlerStats[gameState.currentBowler]?.wickets || 0}</td>
                                        <td className="py-2">{gameState.bowlerStats[gameState.currentBowler]?.economy.toFixed(1) || 0}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Current Partnership */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Current Partnership</h3>
                        <p>
                            {gameState && gameState.currentPartnership ? 
                                `${gameState.currentPartnership.runs} runs from ${gameState.currentPartnership.balls} balls (SR: ${((gameState.currentPartnership.runs / Math.max(1, gameState.currentPartnership.balls)) * 100).toFixed(1)})` 
                                : '0 runs from 0 balls (SR: 0.0)'}
                        </p>
                    </div>

                    {/* Complete Batting Scorecard */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="font-bold text-xl mb-4">{gameState?.battingTeam.name} Innings</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-2 w-1/3">Batter</th>
                                    <th className="pb-2"></th>
                                    <th className="pb-2 text-right">R</th>
                                    <th className="pb-2 text-right">B</th>
                                    <th className="pb-2 text-right">M</th>
                                    <th className="pb-2 text-right">4s</th>
                                    <th className="pb-2 text-right">6s</th>
                                    <th className="pb-2 text-right">SR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gameState && gameState.battingTeam?.lineup?.battingOrder?.map(batterId => {
                                    const stats = gameState?.currentBatterStats[batterId] || { 
                                        runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 
                                    };
                                    const player = getPlayerInfo(batterId);
                                    const isCurrentBatter = gameState?.currentBatters?.includes(batterId);
                                    return (
                                        <tr key={batterId} className="border-b last:border-0">
                                            <td className="py-2">
                                                <div className="font-medium">
                                                    {player?.name || 'Unknown'} {isCurrentBatter ? '*' : ''}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {player?.battingStyle} • {player?.hand}
                                                    {player?.isWicketKeeper && ' • 🧤'}
                                                </div>
                                            </td>
                                            <td className="py-2 text-xs text-gray-500">
                                                {stats.dismissal || 'not out'}
                                            </td>
                                            <td className="py-2 text-right">{stats.runs}</td>
                                            <td className="py-2 text-right">{stats.balls}</td>
                                            <td className="py-2 text-right">-</td>
                                            <td className="py-2 text-right">{stats.fours}</td>
                                            <td className="py-2 text-right">{stats.sixes}</td>
                                            <td className="py-2 text-right">{stats.strikeRate.toFixed(1)}</td>
                                        </tr>
                                    );
                                })}
                                <tr className="border-t border-gray-300">
                                    <td colSpan={2} className="py-2 font-medium">Extras</td>
                                    <td colSpan={6} className="py-2">
                                        {gameState?.extras?.total || 0} (w {gameState?.extras?.wides || 0}, 
                                        nb {gameState?.extras?.noBalls || 0}, lb {gameState?.extras?.legByes || 0})
                                    </td>
                                </tr>
                                <tr className="border-t border-gray-300 font-bold">
                                    <td colSpan={2} className="py-2">Total</td>
                                    <td colSpan={6} className="py-2">
                                        {gameState?.score}/{gameState?.wickets} ({gameState?.currentOver}.{gameState?.currentBall} Ov)
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Fall of Wickets */}
                        {gameState && gameState.fallOfWickets && gameState.fallOfWickets.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Fall of Wickets</h3>
                                <p>
                                    {gameState.fallOfWickets.map((fow) => (
                                        `${fow.wicket}-${fow.score} (${getPlayerInfo(fow.batter)?.name}, ${fow.overs.toFixed(1)} ov)`
                                    )).join(", ")}
                                </p>
                            </div>
                        )}

                        {/* Did Not Bat */}
                        {gameState && gameState.didNotBat && gameState.didNotBat.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Did Not Bat</h3>
                                <p>{gameState.didNotBat.map(id => getPlayerInfo(id)?.name).join(", ")}</p>
                            </div>
                        )}

                        {/* Partnerships */}
                        <div className="mt-4">
                            <h4 className="font-bold mb-2">Partnerships</h4>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-2">Wicket</th>
                                        <th className="pb-2">Runs</th>
                                        <th className="pb-2">Batters</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gameState?.partnerships.map((p, index) => {
                                        const batter1 = getPlayerInfo(p.batter1);
                                        const batter2 = getPlayerInfo(p.batter2);
                                        return (
                                            <tr key={index} className="border-b">
                                                <td className="py-2">{index + 1}</td>
                                                <td className="py-2">{p.runs}</td>
                                                <td className="py-2">
                                                    {batter1?.name} - {batter2?.name}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Complete Bowling Scorecard */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-bold text-xl mb-4">Bowling</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-2 w-1/3">Bowler</th>
                                    <th className="pb-2 text-right">O</th>
                                    <th className="pb-2 text-right">M</th>
                                    <th className="pb-2 text-right">R</th>
                                    <th className="pb-2 text-right">W</th>
                                    <th className="pb-2 text-right">Dots</th>
                                    <th className="pb-2 text-right">Econ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(gameState?.bowlerStats || {}).map(([bowlerId, stats]) => {
                                    const player = getPlayerInfo(Number(bowlerId));
                                    const isCurrentBowler = gameState?.currentBowler === Number(bowlerId);
                                    return (
                                        <tr key={bowlerId} className="border-b last:border-0">
                                            <td className="py-2">
                                                <div className="font-medium">
                                                    {player?.name || 'Unknown'} {isCurrentBowler ? '*' : ''}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {player?.bowlingStyle} • {player?.hand}
                                                </div>
                                            </td>
                                            <td className="py-2 text-right">{stats.overs}</td>
                                            <td className="py-2 text-right">{stats.maidens}</td>
                                            <td className="py-2 text-right">{stats.runs}</td>
                                            <td className="py-2 text-right">{stats.wickets}</td>
                                            <td className="py-2 text-right">{stats.dots}</td>
                                            <td className="py-2 text-right">{stats.economy.toFixed(1)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="col-span-4">
                    {/* Last Over */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="font-bold text-lg mb-2">Last Over</h3>
                        <div className="flex gap-2">
                            {gameState?.lastOver.map((ball, i) => (
                                <div key={i} className={`
                                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                                    ${ball === 'W' ? 'bg-red-100 text-red-700' :
                                      ball === '4' ? 'bg-blue-100 text-blue-700' :
                                      ball === '6' ? 'bg-green-100 text-green-700' :
                                      'bg-gray-100 text-gray-700'}
                                `}>
                                    {ball}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Play Log */}
                    <div className="bg-white rounded-lg shadow p-4 h-[600px] overflow-y-auto">
                        <h3 className="font-bold text-lg mb-4 sticky top-0 bg-white">Play by Play</h3>
                        <div className="space-y-2">
                            {gameState?.playLog.map((play, i) => (
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