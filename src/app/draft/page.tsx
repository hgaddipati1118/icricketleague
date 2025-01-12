'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocalStorageManager } from '../../utils/LocalStorageManager';
import { DraftScreenComponent } from '../../components/DraftScreenComponent';
import { League } from '../../models/League/League';
import { DraftScreen } from '../../screens/DraftScreen';

export default function DraftPage() {
    const router = useRouter();
    const [league, setLeague] = useState<League | null>(null);
    const [draftScreen, setDraftScreen] = useState<DraftScreen | null>(null);

    useEffect(() => {
        const leagueData = LocalStorageManager.getLeague();
        const teamSelection = LocalStorageManager.getTeamSelection();
        
        if (!leagueData || !teamSelection) {
            router.push('/');
            return;
        }
        
        setLeague(leagueData);
        setDraftScreen(DraftScreen.loadFromLocalStorage(leagueData));
    }, [router]);

    if (!league || !draftScreen) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-8">{league.name} - Draft</h1>
                <DraftScreenComponent draftScreen={draftScreen} />
            </div>
        </div>
    );
} 