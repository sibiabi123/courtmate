import type { Game, Achievement, User, Post, Tournament, Group, Notification } from '@/types';

export const mockGames: Game[] = [
  // Physical Games (Primary Focus)
  {
    id: 'g-cricket',
    name: 'Cricket',
    icon: '🏏',
    category: 'physical',
    description: 'VIT Main Ground daily matches. Leather or tennis ball T20s and box cricket.',
    playerCount: '11v11 or Box Cricket',
    isPhysical: true,
    popularity: 98,
    color: '#ffd60a'
  },
  {
    id: 'g-football',
    name: 'Football',
    icon: '⚽',
    category: 'physical',
    description: '7v7 and 11v11 campus games. Real-time pitch booking coordination.',
    playerCount: '7v7 to 11v11',
    isPhysical: true,
    popularity: 95,
    color: '#00f5d4'
  },
  {
    id: 'g-badminton',
    name: 'Badminton',
    icon: '🏸',
    category: 'physical',
    description: 'Indoor courts at Gymkhana. Fast-paced singles or doubles matchups.',
    playerCount: 'Singles / Doubles',
    isPhysical: true,
    popularity: 92,
    color: '#7b2ff7'
  },
  {
    id: 'g-basketball',
    name: 'Basketball',
    icon: '🏀',
    category: 'physical',
    description: 'Hostel outdoor courts pickup games. Half-court or full-court 5v5.',
    playerCount: '3v3 or 5v5',
    isPhysical: true,
    popularity: 88,
    color: '#ff006e'
  },
  {
    id: 'g-tabletennis',
    name: 'Table Tennis',
    icon: '🏓',
    category: 'physical',
    description: 'Hostel common rooms and indoor complex recreation tables.',
    playerCount: 'Singles / Doubles',
    isPhysical: true,
    popularity: 85,
    color: '#3b82f6'
  },
  {
    id: 'g-volleyball',
    name: 'Volleyball',
    icon: '🏐',
    category: 'physical',
    description: 'Evening mud or clay court games behind hostel blocks.',
    playerCount: '6v6',
    isPhysical: true,
    popularity: 80,
    color: '#f59e0b'
  },
  {
    id: 'g-kabaddi',
    name: 'Kabaddi',
    icon: '🤼',
    category: 'physical',
    description: 'High-intensity local hostel tournament practice on campus grounds.',
    playerCount: '7v7',
    isPhysical: true,
    popularity: 75,
    color: '#ef4444'
  },
  {
    id: 'g-tennis',
    name: 'Tennis',
    icon: '🎾',
    category: 'physical',
    description: 'Hardcourt games coordinate at the outdoor courts.',
    playerCount: 'Singles / Doubles',
    isPhysical: true,
    popularity: 72,
    color: '#10b981'
  },
  {
    id: 'g-carrom',
    name: 'Carrom',
    icon: '🎯',
    category: 'board',
    description: 'Hostel common room casual gaming and tournament matches.',
    playerCount: '2 or 4 Players',
    isPhysical: true,
    popularity: 78,
    color: '#ec4899'
  },
  {
    id: 'g-chess',
    name: 'Chess',
    icon: '♟️',
    category: 'board',
    description: 'Mind games in the library or common halls. Rapid and Blitz rules.',
    playerCount: '1v1',
    isPhysical: true,
    popularity: 84,
    color: '#ffffff'
  },
  {
    id: 'g-swimming',
    name: 'Swimming',
    icon: '🏊',
    category: 'physical',
    description: 'Laps, timing checks, and friendly races at the VIT Swimming Complex.',
    playerCount: 'Individual / Relays',
    isPhysical: true,
    popularity: 65,
    color: '#3b82f6'
  },
  {
    id: 'g-athletics',
    name: 'Athletics',
    icon: '🏃',
    category: 'physical',
    description: 'Track workouts, sprints, and long-distance runs at the outdoor track.',
    playerCount: 'Solo / Group Runs',
    isPhysical: true,
    popularity: 60,
    color: '#ffd60a'
  },

  // Digital Games
  {
    id: 'g-valorant',
    name: 'Valorant',
    icon: '🎮',
    category: 'digital',
    description: '5v5 tactical shooter. Custom lobby matches and rank pushing.',
    playerCount: '5v5 Custom',
    isPhysical: false,
    popularity: 90,
    color: '#ff4655'
  },
  {
    id: 'g-bgmi',
    name: 'BGMI',
    icon: '📱',
    category: 'digital',
    description: 'Battlegrounds Mobile India squad games, room cards, scrims.',
    playerCount: 'Squads (4v4/100 players)',
    isPhysical: false,
    popularity: 94,
    color: '#be185d'
  },
  {
    id: 'g-fifa',
    name: 'FIFA/FC 24',
    icon: '⚽',
    category: 'digital',
    description: 'Console play in hosteller rooms or gaming lounges.',
    playerCount: '1v1 or 2v2',
    isPhysical: false,
    popularity: 86,
    color: '#3b82f6'
  },

  // Arcade Mini-games (Built-in)
  {
    id: 'g-snake',
    name: 'Snake Retro',
    icon: '🐍',
    category: 'arcade',
    description: 'Classic arcade feeding game. Score high on the leaderboard.',
    playerCount: 'Single Player',
    isPhysical: false,
    popularity: 70,
    color: '#10b981'
  },
  {
    id: 'g-2048',
    name: '2048 Neon',
    icon: '🔢',
    category: 'arcade',
    description: 'Slide tiles and join them to reach the 2048 tile.',
    playerCount: 'Single Player',
    isPhysical: false,
    popularity: 68,
    color: '#00f5d4'
  },
  {
    id: 'g-math',
    name: 'Quick Math',
    icon: '🧮',
    category: 'arcade',
    description: 'Solve arithmetic questions under intense time pressure.',
    playerCount: 'Single Player',
    isPhysical: false,
    popularity: 60,
    color: '#ffd60a'
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: 'ach-first-win',
    name: 'First Blood',
    description: 'Register and win your first competitive match on campus.',
    icon: '🩸',
    tier: 'bronze',
    isUnlocked: true
  },
  {
    id: 'ach-active-gamer',
    name: 'Hostel Legend',
    description: 'Participate in 10 physical matches in your hostel block.',
    icon: '🏰',
    tier: 'silver',
    isUnlocked: false
  },
  {
    id: 'ach-tournament-champ',
    name: 'Grandmaster',
    description: 'Place 1st in any official VIT Gaming Hub tournament.',
    icon: '🏆',
    tier: 'gold',
    isUnlocked: false
  },
  {
    id: 'ach-social-butterfly',
    name: 'Squad Leader',
    description: 'Create a gaming group and recruit 10+ active members.',
    icon: '👑',
    tier: 'diamond',
    isUnlocked: false
  },
  {
    id: 'ach-arcade-god',
    name: 'Arcade Master',
    description: 'Achieve a top-3 score on any built-in mini-game leaderboard.',
    icon: '👾',
    tier: 'gold',
    isUnlocked: false
  }
];

// Helper user generation
const INDIAN_NAMES = [
  'Arjun Sharma', 'Priya Patel', 'Rahul Krishnan', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Iyer', 'Karthik Rao', 'Deepika Sen', 'Rohan Verma', 'Meera Nair',
  'Aditya Joshi', 'Kavya Gupta', 'Siddharth Roy', 'Ishita Bose', 'Nikhil Saxena',
  'Pooja Mishra', 'Varun Kapoor', 'Riya Malhotra', 'Akash Choudhury', 'Divya Prasad',
  'Harsh Vardhan', 'Tanvi Shah', 'Suresh Kumar', 'Neha Sharma', 'Rajesh Patel',
  'Simran Kaur', 'Devendra Singh', 'Kritika Sen', 'Aman Verma', 'Shruti Iyer'
];

const HOSTELS = [
  'MH-A Block', 'MH-B Block', 'MH-C Block', 'MH-Q Block', 'MH-K Block',
  'LH-A Block', 'LH-B Block', 'LH-F Block', 'Day Scholar'
];

export const mockUsers: User[] = INDIAN_NAMES.map((name, i) => {
  const emailName = name.toLowerCase().replace(/\s+/g, '.');
  const role = i === 0 ? 'super_admin' : i === 1 || i === 2 ? 'admin' : 'student';
  const rating = 1400 + (30 - i) * 28 + (i % 3 === 0 ? 45 : -20);
  
  return {
    id: `u-${i + 1}`,
    email: `${emailName}${2020 + (i % 5)}@vitstudent.ac.in`,
    name,
    hash: '$2b$12$K7BnvPqfC829fCkqmK8sxeD3vYg1Y68z81/Yt90Nl1d4pP01d4p2a', // Hashed value of dummy password
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name.replace(/\s+/g, '')}`,
    glickoRating: { rating, rd: 75, vol: 0.06 },
    hostel: HOSTELS[i % HOSTELS.length],
    lat: 12.9692 + (i % 10) * 0.0005,
    lng: 79.1559 + (i % 10) * 0.0005,
    coins: 200 + (i * 45) % 1000,
    role,
    isBanned: false,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  } as any;
});

// Primary focus is physical games (Cricket, Football, Badminton, Basketball)
const SPORTS_POOL = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Chess'];
const GROUNDS_POOL = ['Main Ground', 'Outdoor Sports Complex', 'Gymkhana Court A', 'Hostel Court B', 'Main TT Room', 'Outdoor Clay Court', 'Gymkhana Kabaddi Turf', 'Central Library Hall'];

export const mockPosts: Post[] = Array.from({ length: 20 }).map((_, i) => {
  const creator = mockUsers[i % mockUsers.length];
  const sport = SPORTS_POOL[i % SPORTS_POOL.length];
  const ground = GROUNDS_POOL[i % GROUNDS_POOL.length];
  const maxPlayers = sport === 'Cricket' ? 22 : sport === 'Football' ? 14 : sport === 'Badminton' ? 4 : 10;
  const currentPlayers = Math.floor(Math.random() * (maxPlayers - 1)) + 1;
  const scheduledStart = new Date(Date.now() + (i * 2 - 5) * 60 * 60 * 1000).toISOString();
  const scheduledEnd = new Date(Date.now() + (i * 2 - 3) * 60 * 60 * 1000).toISOString();
  const status = currentPlayers >= maxPlayers ? 'full' : i % 5 === 0 ? 'live' : 'open';

  return {
    id: `p-${i + 1}`,
    userId: creator.id,
    user: creator,
    sport,
    ground,

    maxPlayers,
    currentPlayers,
    slotsTotal: maxPlayers,
    slotsFilled: currentPlayers,
    scheduledStart,
    scheduledEnd,
    status,
    geoLocked: i % 3 === 0,
    aiDescription: `🔥 Join us for an energetic ${sport} match at ${ground}! Need active players to dominate. 🚀`,
    isLive: status === 'live',
    createdAt: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
    responses: Array.from({ length: currentPlayers }).map((_, rIdx) => ({
      id: `resp-${i}-${rIdx}`,
      postId: `p-${i + 1}`,
      userId: mockUsers[(i + rIdx) % mockUsers.length].id,
      user: mockUsers[(i + rIdx) % mockUsers.length],
      status: 'joined',
      createdAt: new Date(Date.now() - i * 20 * 60 * 1000).toISOString(),
    })),
  } as any;
});

export const mockTournaments: Tournament[] = [
  {
    id: 'tour-1',
    name: 'VIT Monsoon Cricket Blitz',
    sport: 'Cricket',
    stakes: 100,
    prize: 1600,
    status: 'ongoing',
    maxParticipants: 16,
    currentParticipants: 12,
    bracket: {
      round1: [
        { matchId: 'm1', p1: 'Arjun & Squad', p2: 'Vellore Warriors', winner: 'Arjun & Squad' },
        { matchId: 'm2', p1: 'Shuttle Kings', p2: 'Super Giants', winner: null },
      ],
    },
    registrations: [],
    matches: [],
    banner: '',
    entryFee: 10
  } as any,
  {
    id: 'tour-2',
    name: 'Radix Indoor Badminton Clash',
    sport: 'Badminton',
    stakes: 50,
    prize: 800,
    status: 'upcoming',
    maxParticipants: 8,
    currentParticipants: 4,
    bracket: {
      round1: [],
    },
    registrations: [],
    matches: [],
    banner: '',
    entryFee: 5
  } as any,
  {
    id: 'tour-3',
    name: 'VIT Hostel Futsal League',
    sport: 'Football',
    stakes: 200,
    prize: 3200,
    status: 'upcoming',
    maxParticipants: 16,
    currentParticipants: 16,
    bracket: {
      round1: [
        { matchId: 'f1', p1: 'MH A-Block F.C.', p2: 'MH Q-Block Tigers', winner: null },
        { matchId: 'f2', p1: 'Day Scholar FC', p2: 'LH Queens F.C.', winner: null },
      ]
    },
    registrations: [],
    matches: [],
    banner: '',
    entryFee: 20
  } as any
];

export const mockGroups: Group[] = [
  {
    id: 'g-cricket-club',
    name: 'VIT Cricket Club',
    gameId: 'g-cricket',
    ownerId: 'u-1',
    description: 'The official campus Cricket club coordinating weekend matches on the main ground and night box cricket sessions.',
    logo: '🏏',
    requirements: 'Bring your own tennis / leather bat if possible.',
    memberCount: 42,
    maxMembers: 100,
    members: [],
    isOpen: true,
    createdAt: new Date().toISOString(),
    tags: ['cricket', 'main-ground', 'weekends'],
  } as any,
  {
    id: 'g-shuttle-squad',
    name: 'Shuttle Squad',
    gameId: 'g-badminton',
    ownerId: 'u-2',
    description: 'Gymkhana badminton court regulars. Singles, doubles, and tournament prep games.',
    logo: '🏸',
    requirements: 'Intermediate skill level or above.',
    memberCount: 18,
    maxMembers: 30,
    members: [],
    isOpen: true,
    createdAt: new Date().toISOString(),
    tags: ['badminton', 'gymkhana', 'daily'],
  } as any,
  {
    id: 'g-football-fanatics',
    name: 'Football Fanatics',
    gameId: 'g-football',
    ownerId: 'u-3',
    description: 'We live and breathe football. Regular 7v7 matches every evening on the main turf.',
    logo: '⚽',
    requirements: 'Studs are mandatory.',
    memberCount: 35,
    maxMembers: 50,
    members: [],
    isOpen: true,
    createdAt: new Date().toISOString(),
    tags: ['football', 'turf', '7v7', 'evening'],
  } as any,
  {
    id: 'g-chess-grandmasters',
    name: 'VIT Chess Masters',
    gameId: 'g-chess',
    ownerId: 'u-4',
    description: 'Rapid and Blitz chess players on campus. Weekly libraries board meets.',
    logo: '♟️',
    requirements: 'None. Beginners are welcome!',
    memberCount: 22,
    maxMembers: 40,
    members: [],
    isOpen: true,
    createdAt: new Date().toISOString(),
    tags: ['chess', 'mind-sports', 'library'],
  } as any
];

export const mockReports: any[] = [];
export const mockAdminActions: any[] = [];
export const mockNotifications: Notification[] = [
  {
    id: 'not-1',
    userId: 'u-1',
    type: 'match_filled',
    title: 'Match filled up!',
    message: 'Your Cricket match at Main Ground is now full. Chat room is active.',
    icon: '🏏',
    isRead: false,
    createdAt: new Date().toISOString()
  } as any,
  {
    id: 'not-2',
    userId: 'u-1',
    type: 'xp_gain',
    title: 'Level Up!',
    message: 'You gained 50 XP for creating a match post.',
    icon: '⚡',
    isRead: false,
    createdAt: new Date().toISOString()
  } as any
];
export const mockConversations: any[] = [];

export const resolvePost = (post: any) => post;
export const resolveTournament = (t: any) => t;
