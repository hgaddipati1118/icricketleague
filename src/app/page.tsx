'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocalStorageManager } from '../utils/LocalStorageManager';
import { LeagueCreationScreen } from '../screens/LeagueCreationScreen';

const PREDEFINED_TEAMS = [
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

interface TeamPreviewProps {
    name: string;
    shortName: string;
    colors: { primary: string; secondary: string };
    selected: boolean;
    onSelect: () => void;
}

function TeamPreview({ name, shortName, colors, selected, onSelect }: TeamPreviewProps) {
    return (
        <button
            onClick={onSelect}
            className={`relative w-full h-48 rounded-2xl transition-all duration-200 ${
                selected 
                    ? 'ring-4 ring-blue-500 transform scale-105' 
                    : 'hover:transform hover:scale-102'
            }`}
            style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
        >
            <div className="absolute inset-4 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
                <p className="text-gray-500 mt-2">{shortName}</p>
                {selected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
        </button>
    );
}

export default function LeagueSetupPage() {
    const router = useRouter();
    const [leagueName, setLeagueName] = useState('');
    const [teamCount, setTeamCount] = useState(8);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamId) return;

        // Clear all existing league data
        LocalStorageManager.clearAll();

        LocalStorageManager.saveLeagueSetup(leagueName, teamCount);
        LocalStorageManager.saveTeamSelection(selectedTeamId);
        const league = LeagueCreationScreen.createNewLeague(leagueName, selectedTeamId);
        LocalStorageManager.saveLeague(league);
        router.push('/draft');
    };

    const availableTeams = PREDEFINED_TEAMS.slice(0, teamCount);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Create Your League</h1>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                        <div>
                            <label htmlFor="leagueName" className="block text-sm font-medium text-gray-700">
                                League Name
                            </label>
                            <input
                                type="text"
                                id="leagueName"
                                value={leagueName}
                                onChange={(e) => setLeagueName(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter league name"
                            />
                        </div>
                        <div>
                            <label htmlFor="teamCount" className="block text-sm font-medium text-gray-700">
                                Number of Teams
                            </label>
                            <select
                                id="teamCount"
                                value={teamCount}
                                onChange={(e) => {
                                    const newCount = parseInt(e.target.value);
                                    setTeamCount(newCount);
                                    // Reset team selection if current selection is out of new range
                                    if (selectedTeamId && selectedTeamId > newCount) {
                                        setSelectedTeamId(null);
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {[8, 10].map((num) => (
                                    <option key={num} value={num}>
                                        {num} Teams
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Choose Your Team</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableTeams.map((team) => (
                                <TeamPreview
                                    key={team.id}
                                    name={team.name}
                                    shortName={team.shortName}
                                    colors={team.colors}
                                    selected={selectedTeamId === team.id}
                                    onSelect={() => setSelectedTeamId(team.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!selectedTeamId || !leagueName.trim()}
                            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Start Draft
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
