import { Stadium } from '../models/Stadium/Stadium';
import { PitchType } from '../models/Stadium/PitchType';
import { BoundarySize } from '../models/Stadium/BoundarySize';

const cityNames = ['Mumbai', 'Melbourne', 'London', 'Cape Town', 'Karachi', 'Auckland', 'Kingston', 'Dubai'];
const stadiumSuffixes = ['Cricket Ground', 'Oval', 'Stadium', 'Arena', 'Park'];

function generateRandomStadium(id: number): Stadium {
    const cityName = cityNames[Math.floor(Math.random() * cityNames.length)];
    const suffix = stadiumSuffixes[Math.floor(Math.random() * stadiumSuffixes.length)];
    
    return new Stadium(
        id,
        `${cityName} ${suffix}`,
        cityName,
        20000 + Math.floor(Math.random() * 60000),
        Object.values(PitchType)[Math.floor(Math.random() * Object.values(PitchType).length)] as PitchType,
        Object.values(BoundarySize)[Math.floor(Math.random() * Object.values(BoundarySize).length)] as BoundarySize,
        Math.floor(Math.random() * 100)
    );
} 

export { generateRandomStadium }; 