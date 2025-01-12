const teamNames = [
    { name: 'Royal Challengers', shortName: 'RC' },
    { name: 'Super Kings', shortName: 'SK' },
    { name: 'Knight Riders', shortName: 'KR' },
    { name: 'Hurricanes', shortName: 'HUR' },
    { name: 'Titans', shortName: 'TIT' },
    { name: 'Warriors', shortName: 'WAR' },
    { name: 'Strikers', shortName: 'STR' },
    { name: 'Lions', shortName: 'LNS' },
    { name: 'Eagles', shortName: 'EAG' },
    { name: 'Panthers', shortName: 'PAN' }
];

let availableTeamNames = [...teamNames];

function generateTeamName() {
    if (availableTeamNames.length === 0) {
        throw new Error('No more team names available');
    }
    
    const randomIndex = Math.floor(Math.random() * availableTeamNames.length);
    const selectedTeam = availableTeamNames[randomIndex];
    
    // Remove the selected team from available names
    availableTeamNames.splice(randomIndex, 1);
    
    return selectedTeam;
}

export function resetTeamNames() {
    availableTeamNames = [...teamNames];
}

export default generateTeamName; 