import { BoundarySize } from "./BoundarySize";
import { PitchType } from "./PitchType";

export class Stadium {
    id: number;
    name: string;
    location: string;
    capacity: number;
    pitchType: PitchType;
    boundarySize: BoundarySize;
    battingFriendly: number;

    constructor(id: number, name: string, location: string, capacity: number, pitchType: PitchType, boundarySize: BoundarySize, battingFriendly: number) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.capacity = capacity;
        this.pitchType = pitchType;
        this.boundarySize = boundarySize;
        battingFriendly = Math.min(100, Math.max(0, battingFriendly));
        this.battingFriendly = battingFriendly;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            capacity: this.capacity,
            pitchType: this.pitchType,
            boundarySize: this.boundarySize,
            battingFriendly: this.battingFriendly
        };
    }

    static fromJSON(json: { id: number, name: string, location: string, capacity: number, pitchType: PitchType, boundarySize: BoundarySize, battingFriendly: number }): Stadium {
        return new Stadium(
            json.id,
            json.name,
            json.location,
            json.capacity,
            json.pitchType,
            json.boundarySize,
            json.battingFriendly
        );      
    }
}


