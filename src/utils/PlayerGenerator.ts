import { Player } from '../models/Player/Player';
import { Hand } from '../models/Player/Hand';
import { BattingStyle } from '../models/Player/BattingStyle';
import { BowlingStyle } from '../models/Player/BowlingStyle';
import { PlayerRatings } from '../models/Player/PlayerRatings';
import { League } from '../models/League/League';

const countries = ['India', 'Australia', 'England', 'New Zealand', 'Pakistan', 'South Africa', 'West Indies'];

// Map countries to their respective faker locales and name patterns
const countryNameConfig = {
    'India': {
        firstNames: [
            'Virat', 'Rohit', 'Sachin', 'Rahul', 'Sunil', 'Kapil', 'Anil', 'Sourav', 
            'Mahendra', 'Ravindra', 'Ajinkya', 'Cheteshwar', 'Ravichandran', 'Jasprit',
            'Yuvraj', 'Harbhajan', 'Shikhar', 'Ishant', 'Mohammed', 'Hardik'
        ],
        lastNames: [
            'Kohli', 'Sharma', 'Tendulkar', 'Dravid', 'Gavaskar', 'Dev', 'Kumble', 
            'Ganguly', 'Dhoni', 'Jadeja', 'Rahane', 'Pujara', 'Ashwin', 'Bumrah',
            'Singh', 'Patel', 'Dhawan', 'Shami', 'Pandya', 'Kumar'
        ]
    },
    'Australia': {
        firstNames: [
            'Steve', 'David', 'Pat', 'Mitchell', 'Glenn', 'Shane', 'Ricky', 'Michael',
            'Brett', 'Nathan', 'Aaron', 'Josh', 'Cameron', 'Travis', 'Marcus',
            'Matthew', 'Adam', 'Justin', 'Mark', 'Allan'
        ],
        lastNames: [
            'Smith', 'Warner', 'Cummins', 'Starc', 'McGrath', 'Warne', 'Ponting', 'Clarke',
            'Lee', 'Lyon', 'Finch', 'Hazlewood', 'Green', 'Head', 'Labuschagne',
            'Hayden', 'Gilchrist', 'Langer', 'Waugh', 'Border'
        ]
    },
    'England': {
        firstNames: [
            'Joe', 'Ben', 'James', 'Stuart', 'Alastair', 'Andrew', 'Kevin', 'Ian',
            'Harry', 'Jonny', 'Moeen', 'Chris', 'Jos', 'Ollie', 'Zak',
            'Sam', 'Mark', 'Michael', 'Graham', 'David'
        ],
        lastNames: [
            'Root', 'Stokes', 'Anderson', 'Broad', 'Cook', 'Flintoff', 'Pietersen', 'Botham',
            'Brook', 'Bairstow', 'Ali', 'Woakes', 'Buttler', 'Pope', 'Crawley',
            'Curran', 'Wood', 'Vaughan', 'Gooch', 'Gower'
        ]
    },
    'New Zealand': {
        firstNames: [
            'Kane', 'Ross', 'Trent', 'Tim', 'Martin', 'Brendon', 'Daniel', 'Stephen',
            'Tom', 'Devon', 'Mitchell', 'Kyle', 'Will', 'Henry', 'Colin',
            'James', 'Neil', 'Chris', 'Jacob', 'Glenn'
        ],
        lastNames: [
            'Williamson', 'Taylor', 'Boult', 'Southee', 'Guptill', 'McCullum', 'Vettori', 'Fleming',
            'Latham', 'Conway', 'Santner', 'Jamieson', 'Young', 'Nicholls', 'de Grandhomme',
            'Neesham', 'Wagner', 'Cairns', 'Oram', 'Phillips'
        ]
    },
    'Pakistan': {
        firstNames: [
            'Babar', 'Shaheen', 'Imran', 'Wasim', 'Waqar', 'Inzamam', 'Shoaib', 
            'Saeed', 'Younis', 'Mohammad', 'Sarfaraz', 'Fakhar', 'Shadab', 'Hasan',
            'Naseem', 'Azhar', 'Asif', 'Misbah', 'Yasir', 'Abdul'
        ],
        lastNames: [
            'Azam', 'Afridi', 'Khan', 'Akram', 'Younis', 'ul-Haq', 'Akhtar', 
            'Anwar', 'Ahmed', 'Amir', 'Zaman', 'Ali', 'Shah', 'Razzaq',
            'Malik', 'Latif', 'Qadir', 'Haq', 'Butt', 'Rizwan'
        ]
    },
    'South Africa': {
        firstNames: [
            'AB', 'Dale', 'Jacques', 'Hashim', 'Graeme', 'Allan', 'Shaun', 'Faf',
            'Kagiso', 'Vernon', 'Quinton', 'Temba', 'Aiden', 'David', 'Lungi',
            'Rassie', 'Dean', 'Keshav', 'Anrich', 'Marco'
        ],
        lastNames: [
            'de Villiers', 'Steyn', 'Kallis', 'Amla', 'Smith', 'Donald', 'Pollock', 'du Plessis',
            'Rabada', 'Philander', 'de Kock', 'Bavuma', 'Markram', 'Miller', 'Ngidi',
            'van der Dussen', 'Elgar', 'Maharaj', 'Nortje', 'Jansen'
        ]
    },
    'West Indies': {
        firstNames: [
            'Brian', 'Vivian', 'Chris', 'Curtly', 'Courtney', 'Malcolm', 'Michael', 
            'Clive', 'Gordon', 'Garfield', 'Dwayne', 'Kieron', 'Darren', 'Andre',
            'Jason', 'Shimron', 'Shai', 'Kemar', 'Shannon', 'Roston'
        ],
        lastNames: [
            'Lara', 'Richards', 'Gayle', 'Ambrose', 'Walsh', 'Marshall', 'Holding',
            'Lloyd', 'Greenidge', 'Sobers', 'Bravo', 'Pollard', 'Sammy', 'Russell',
            'Holder', 'Hetmyer', 'Hope', 'Roach', 'Gabriel', 'Chase'
        ]
    }
};

function generateNameForCountry(country: string): string {
    const config = countryNameConfig[country as keyof typeof countryNameConfig];
    const firstName = config.firstNames[Math.floor(Math.random() * config.firstNames.length)];
    const lastName = config.lastNames[Math.floor(Math.random() * config.lastNames.length)];
    return `${firstName} ${lastName}`;
}

function generatePlayerRatings(seasonId: number, isBowler: boolean): PlayerRatings {
    return new PlayerRatings(
        isBowler,
        seasonId,
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100)
    );
}

function generateRandomPlayer(id: number, forceWicketKeeper: boolean = false): Player {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const name = generateNameForCountry(country);
    
    // If wicket keeper, force bowling style to NONE
    const isWicketKeeper = forceWicketKeeper || Math.random() > 0.9;
    const bowlingStyle = isWicketKeeper ? 
        BowlingStyle.NONE : 
        Object.values(BowlingStyle)[Math.floor(Math.random() * Object.values(BowlingStyle).length)];
    
    return new Player(
        id,
        name,
        20 + Math.floor(Math.random() * 20),
        country,
        '',
        Math.random() > 0.15 ? Hand.RIGHT_HANDED : Hand.LEFT_HANDED,
        Object.values(BattingStyle)[Math.floor(Math.random() * Object.values(BattingStyle).length)],
        bowlingStyle,
        isWicketKeeper,
        [generatePlayerRatings(0, bowlingStyle !== BowlingStyle.NONE)],
        []
    );
}

function generateDraftPool(league: League): Player[] {
    // Calculate total players needed
    const teamsCount = league.teams.length - 1; // Exclude free agents team
    const playersPerTeam = league.type.MAX_PLAYERS_PER_TEAM;
    const totalPlayersNeeded = teamsCount * playersPerTeam;
    
    // Generate 5x the needed amount
    const poolSize = totalPlayersNeeded * 5;
    const players: Player[] = [];
    
    // First generate enough wicket keepers (2 per team to be safe)
    const wicketKeepersNeeded = teamsCount * 2;
    for (let i = 0; i < wicketKeepersNeeded; i++) {
        const player = generateRandomPlayer(i + 1, true);
        players.push(player);
    }
    
    // Then generate the rest of the players
    for (let i = wicketKeepersNeeded; i < poolSize; i++) {
        players.push(generateRandomPlayer(i + 1));
    }
    
    return players;
}

export { generateRandomPlayer, generateDraftPool }; 