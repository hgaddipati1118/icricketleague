import { Stadium } from '../../../models/Stadium/Stadium';
import { PitchType } from '../../../models/Stadium/PitchType';
import { BoundarySize } from '../../../models/Stadium/BoundarySize';

describe('Stadium', () => {
    let defaultStadium: Stadium;

    beforeEach(() => {
        defaultStadium = new Stadium(
            1,                  // id
            'Test Stadium',     // name
            'Test City',        // location
            50000,              // capacity
            PitchType.FLAT,     // pitchType
            BoundarySize.MEDIUM, // boundarySize
            75                  // battingFriendly
        );
    });

    describe('constructor', () => {
        it('should create a stadium with provided values', () => {
            expect(defaultStadium.id).toBe(1);
            expect(defaultStadium.name).toBe('Test Stadium');
            expect(defaultStadium.location).toBe('Test City');
            expect(defaultStadium.capacity).toBe(50000);
            expect(defaultStadium.pitchType).toBe(PitchType.FLAT);
            expect(defaultStadium.boundarySize).toBe(BoundarySize.MEDIUM);
            expect(defaultStadium.battingFriendly).toBe(75);
        });

        it('should handle different pitch types', () => {
            const greenPitch = new Stadium(
                2, 'Bowler Paradise', 'Green City', 30000,
                PitchType.GREEN, BoundarySize.LARGE, 30
            );
            expect(greenPitch.pitchType).toBe(PitchType.GREEN);

            const dustyPitch = new Stadium(
                3, 'Spin Heaven', 'Dusty City', 40000,
                PitchType.DUSTY, BoundarySize.SMALL, 50
            );
            expect(dustyPitch.pitchType).toBe(PitchType.DUSTY);
        });

        it('should handle different boundary sizes', () => {
            const smallBoundary = new Stadium(
                4, 'Small Ground', 'Tiny City', 20000,
                PitchType.DRY, BoundarySize.SMALL, 90
            );
            expect(smallBoundary.boundarySize).toBe(BoundarySize.SMALL);

            const largeBoundary = new Stadium(
                5, 'Large Ground', 'Big City', 60000,
                PitchType.GREEN, BoundarySize.LARGE, 40
            );
            expect(largeBoundary.boundarySize).toBe(BoundarySize.LARGE);
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should correctly serialize and deserialize a stadium', () => {
            const json = defaultStadium.toJSON();
            const recreatedStadium = Stadium.fromJSON(json);

            expect(recreatedStadium.id).toBe(defaultStadium.id);
            expect(recreatedStadium.name).toBe(defaultStadium.name);
            expect(recreatedStadium.location).toBe(defaultStadium.location);
            expect(recreatedStadium.capacity).toBe(defaultStadium.capacity);
            expect(recreatedStadium.pitchType).toBe(defaultStadium.pitchType);
            expect(recreatedStadium.boundarySize).toBe(defaultStadium.boundarySize);
            expect(recreatedStadium.battingFriendly).toBe(defaultStadium.battingFriendly);
        });

        it('should preserve enum values during serialization', () => {
            const json = defaultStadium.toJSON();
            expect(json.pitchType).toBe(PitchType.FLAT);
            expect(json.boundarySize).toBe(BoundarySize.MEDIUM);
        });
    });
}); 