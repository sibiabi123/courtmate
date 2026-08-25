const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'courtmate.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('Seeding rich dynamic data into courtmate.db...');

// Ensure all tables exist
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  glicko_rating REAL DEFAULT 1500,
  glicko_rd REAL DEFAULT 350,
  glicko_vol REAL DEFAULT 0.06,
  ranking_points INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  hostel TEXT NOT NULL DEFAULT 'Main Campus',
  coins INTEGER NOT NULL DEFAULT 100,
  role TEXT NOT NULL DEFAULT 'student',
  is_banned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  ground TEXT NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 10,
  current_players INTEGER NOT NULL DEFAULT 1,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  description TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS post_participants (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  challenger_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenged_id TEXT REFERENCES users(id),
  sport TEXT NOT NULL,
  ground TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  description TEXT DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'casual',
  status TEXT NOT NULL DEFAULT 'open',
  ranking_points_stake INTEGER NOT NULL DEFAULT 0,
  winner_id TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  organizer_id TEXT NOT NULL REFERENCES users(id),
  description TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  scheduled_at TEXT NOT NULL,
  prize INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 16,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS match_results (
  id TEXT PRIMARY KEY,
  challenge_id TEXT REFERENCES challenges(id),
  winner_ids TEXT DEFAULT '[]',
  loser_ids TEXT DEFAULT '[]',
  score TEXT DEFAULT '',
  reported_by TEXT REFERENCES users(id),
  admin_confirmed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  related_id TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS elo_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating REAL NOT NULL,
  delta REAL NOT NULL,
  reason TEXT NOT NULL,
  recorded_at TEXT DEFAULT (datetime('now'))
);
`);

const passwordHash = bcrypt.hashSync('Password123!', 8);

const USERS = [
  { id: 'u-1', name: 'Arjun Kumar', email: 'arjun.k@courtmate.io', rating: 2180, hostel: 'Main Campus / Center', coins: 850, won: 34, played: 42 },
  { id: 'u-2', name: 'Priya Sharma', email: 'priya.s@courtmate.io', rating: 2040, hostel: 'North District', coins: 620, won: 29, played: 36 },
  { id: 'u-3', name: 'Vikram Reddy', email: 'vikram.r@courtmate.io', rating: 1960, hostel: 'South District', coins: 540, won: 24, played: 31 },
  { id: 'u-4', name: 'Ananya Iyer', email: 'ananya.i@courtmate.io', rating: 1880, hostel: 'Sports Complex', coins: 490, won: 21, played: 28 },
  { id: 'u-5', name: 'Karthik Raja', email: 'karthik.r@courtmate.io', rating: 1820, hostel: 'East District', coins: 430, won: 19, played: 25 },
  { id: 'u-6', name: 'Deepika Nair', email: 'deepika.n@courtmate.io', rating: 1740, hostel: 'West District', coins: 380, won: 16, played: 22 },
  { id: 'u-7', name: 'Rohan Gupta', email: 'rohan.g@courtmate.io', rating: 1690, hostel: 'Downtown / Off-Campus', coins: 340, won: 14, played: 20 },
  { id: 'u-8', name: 'Meera Pillai', email: 'meera.p@courtmate.io', rating: 1620, hostel: 'Day Scholar / Resident', coins: 310, won: 12, played: 18 },
  { id: 'u-9', name: 'Siddharth Menon', email: 'siddharth.m@courtmate.io', rating: 1580, hostel: 'North District', coins: 280, won: 11, played: 17 },
  { id: 'u-10', name: 'Kavya Sundaram', email: 'kavya.s@courtmate.io', rating: 1540, hostel: 'South District', coins: 260, won: 10, played: 15 },
  { id: 'u-11', name: 'Aditya Verma', email: 'aditya.v@courtmate.io', rating: 1490, hostel: 'Main Campus / Center', coins: 220, won: 8, played: 14 },
  { id: 'u-12', name: 'Sneha Patel', email: 'sneha.p@courtmate.io', rating: 1430, hostel: 'Sports Complex', coins: 200, won: 7, played: 13 },
  { id: 'u-13', name: 'Harsh Vardhan', email: 'harsh.v@courtmate.io', rating: 1380, hostel: 'East District', coins: 180, won: 6, played: 12 },
  { id: 'u-14', name: 'Tanvi Joshi', email: 'tanvi.j@courtmate.io', rating: 1320, hostel: 'West District', coins: 160, won: 5, played: 10 },
  { id: 'u-15', name: 'Rahul Chawla', email: 'rahul.c@courtmate.io', rating: 1260, hostel: 'Downtown / Off-Campus', coins: 140, won: 4, played: 9 },
  { id: 'u-16', name: 'Ishita Roy', email: 'ishita.r@courtmate.io', rating: 1190, hostel: 'Day Scholar / Resident', coins: 120, won: 3, played: 8 },
  { id: 'u-17', name: 'Aman Tripathi', email: 'aman.t@courtmate.io', rating: 1120, hostel: 'North District', coins: 100, won: 2, played: 6 },
  { id: 'u-18', name: 'Admin Coach', email: 'admin@courtmate.io', rating: 2250, hostel: 'Sports Complex', coins: 5000, won: 50, played: 52, role: 'admin' },
];

const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, email, name, hash, avatar, glicko_rating, glicko_rd, ranking_points, matches_won, matches_played, hostel, coins, role, created_at)
  VALUES (@id, @email, @name, @hash, @avatar, @rating, 45, @rating, @won, @played, @hostel, @coins, @role, datetime('now', '-30 days'))
`);

const insertUserTx = db.transaction((users) => {
  for (const u of users) {
    insertUser.run({
      id: u.id,
      email: u.email,
      name: u.name,
      hash: passwordHash,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(u.name)}`,
      rating: u.rating,
      won: u.won,
      played: u.played,
      hostel: u.hostel,
      coins: u.coins,
      role: u.role || 'student',
    });
  }
});
insertUserTx(USERS);

// Clear & seed posts
db.exec(`DELETE FROM posts; DELETE FROM post_participants;`);

const POSTS = [
  {
    id: 'p-1',
    user_id: 'u-1',
    sport: 'Badminton',
    ground: 'Indoor Badminton Complex',
    max_players: 4,
    current_players: 3,
    scheduled_at: new Date(Date.now() + 3600000).toISOString(),
    description: '🏸 Doubles high-intensity practice! Need 1 more skilled player to complete our 2v2 lineup.',
  },
  {
    id: 'p-2',
    user_id: 'u-2',
    sport: 'Football',
    ground: 'Main Sports Arena',
    max_players: 14,
    current_players: 11,
    scheduled_at: new Date(Date.now() + 7200000).toISOString(),
    description: '⚽ 7v7 Floodlit turf match under the lights! 3 open spots for defenders or strikers.',
  },
  {
    id: 'p-3',
    user_id: 'u-3',
    sport: 'Cricket',
    ground: 'Cricket Nets Arena',
    max_players: 12,
    current_players: 8,
    scheduled_at: new Date(Date.now() + 10800000).toISOString(),
    description: '🏏 T20 practice match with leather ball & speed radar tracking. Bring pads if you have them!',
  },
  {
    id: 'p-4',
    user_id: 'u-4',
    sport: 'Basketball',
    ground: 'Basketball Center Court',
    max_players: 10,
    current_players: 9,
    scheduled_at: new Date(Date.now() + 14400000).toISOString(),
    description: '🏀 5v5 Full court pickup game. 1 spot remaining — jump in for fast-break hoops!',
  },
  {
    id: 'p-5',
    user_id: 'u-5',
    sport: 'Table Tennis',
    ground: 'Table Tennis Hall',
    max_players: 4,
    current_players: 2,
    scheduled_at: new Date(Date.now() + 18000000).toISOString(),
    description: '🏓 Topspin & loop duel training. 2 open tables available for singles & doubles.',
  },
  {
    id: 'p-6',
    user_id: 'u-6',
    sport: 'Tennis',
    ground: 'Outdoor Multi-Courts',
    max_players: 2,
    current_players: 1,
    scheduled_at: new Date(Date.now() + 21600000).toISOString(),
    description: '🎾 Singles practice on center court. Looking for an intermediate or advanced rally partner.',
  },
  {
    id: 'p-7',
    user_id: 'u-7',
    sport: 'Volleyball',
    ground: 'Volleyball Court',
    max_players: 12,
    current_players: 10,
    scheduled_at: new Date(Date.now() + 25200000).toISOString(),
    description: '🏐 6v6 High-energy sunset beach volleyball. 2 open spots for setters/spikers!',
  },
  {
    id: 'p-8',
    user_id: 'u-8',
    sport: 'Chess',
    ground: 'Sports Complex',
    max_players: 2,
    current_players: 1,
    scheduled_at: new Date(Date.now() + 28800000).toISOString(),
    description: '♟️ 5m+3s Blitz chess series. Stake rating points or play casual grandmaster duels.',
  },
];

const insertPost = db.prepare(`
  INSERT INTO posts (id, user_id, sport, ground, max_players, current_players, scheduled_at, status, description, created_at)
  VALUES (@id, @user_id, @sport, @ground, @max_players, @current_players, @scheduled_at, 'open', @description, datetime('now', '-2 hours'))
`);

const insertPart = db.prepare(`
  INSERT INTO post_participants (id, post_id, user_id, joined_at)
  VALUES (?, ?, ?, datetime('now', '-1 hour'))
`);

for (const p of POSTS) {
  insertPost.run(p);
  insertPart.run(`part-${p.id}-owner`, p.id, p.user_id);
  // Add some dummy joiners
  for (let i = 1; i < p.current_players; i++) {
    const randomUser = USERS[(i + parseInt(p.id.replace('p-', ''))) % USERS.length];
    insertPart.run(`part-${p.id}-${i}`, p.id, randomUser.id);
  }
}

// Clear & seed challenges
db.exec(`DELETE FROM challenges;`);

const CHALLENGES = [
  {
    id: 'ch-1',
    challenger_id: 'u-1',
    challenged_id: 'u-2',
    sport: 'Badminton',
    ground: 'Indoor Badminton Complex',
    scheduled_at: new Date(Date.now() + 3600000).toISOString(),
    description: '1v1 High Stakes Singles Championship rematch!',
    mode: 'ranked',
    status: 'accepted',
    ranking_points_stake: 35,
  },
  {
    id: 'ch-2',
    challenger_id: 'u-3',
    challenged_id: null,
    sport: 'Football',
    ground: 'Main Sports Arena',
    scheduled_at: new Date(Date.now() + 7200000).toISOString(),
    description: 'Penalty shootout duel challenge. Who has the nerves?',
    mode: 'ranked',
    status: 'open',
    ranking_points_stake: 25,
  },
  {
    id: 'ch-3',
    challenger_id: 'u-4',
    challenged_id: 'u-5',
    sport: 'Table Tennis',
    ground: 'Table Tennis Hall',
    scheduled_at: new Date(Date.now() - 3600000).toISOString(),
    description: 'Best of 5 sets table tennis duel.',
    mode: 'ranked',
    status: 'completed',
    ranking_points_stake: 30,
    winner_id: 'u-4',
  },
  {
    id: 'ch-4',
    challenger_id: 'u-5',
    challenged_id: null,
    sport: 'Basketball',
    ground: 'Basketball Center Court',
    scheduled_at: new Date(Date.now() + 14400000).toISOString(),
    description: '1v1 Half-court King of the Court to 15 points.',
    mode: 'casual',
    status: 'open',
    ranking_points_stake: 0,
  },
  {
    id: 'ch-5',
    challenger_id: 'u-6',
    challenged_id: 'u-7',
    sport: 'Tennis',
    ground: 'Outdoor Multi-Courts',
    scheduled_at: new Date(Date.now() + 18000000).toISOString(),
    description: '3-set clay court battle for Diamond tier ranking points!',
    mode: 'ranked',
    status: 'accepted',
    ranking_points_stake: 40,
  },
];

const insertChallenge = db.prepare(`
  INSERT INTO challenges (id, challenger_id, challenged_id, sport, ground, scheduled_at, description, mode, status, ranking_points_stake, winner_id, created_at)
  VALUES (@id, @challenger_id, @challenged_id, @sport, @ground, @scheduled_at, @description, @mode, @status, @ranking_points_stake, @winner_id, datetime('now', '-4 hours'))
`);

for (const c of CHALLENGES) {
  insertChallenge.run({
    ...c,
    winner_id: c.winner_id || null,
  });
}

// Clear & seed tournaments
db.exec(`DELETE FROM tournaments; DELETE FROM tournament_participants;`);

const TOURNAMENTS = [
  {
    id: 't-1',
    name: 'Premier Badminton Masters Open 2026',
    sport: 'Badminton',
    organizer_id: 'u-18',
    description: 'Official singles knockout championship with live score tracking, certified refereeing, and cash coin prize pool.',
    venue: 'Indoor Badminton Complex',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    prize: 1500,
    max_participants: 16,
    status: 'upcoming',
  },
  {
    id: 't-2',
    name: 'Champions League 7v7 Football Cup',
    sport: 'Football',
    organizer_id: 'u-18',
    description: 'High-octane 7-a-side floodlit tournament on synthetic turf with group stage and knockout playoffs.',
    venue: 'Main Sports Arena',
    scheduled_at: new Date(Date.now() + 172800000).toISOString(),
    prize: 3000,
    max_participants: 8,
    status: 'upcoming',
  },
  {
    id: 't-3',
    name: 'Grand Slam Tennis Championship',
    sport: 'Tennis',
    organizer_id: 'u-18',
    description: 'Singles hard court championship series. FIDE-style seedings with ELO adjustments.',
    venue: 'Outdoor Multi-Courts',
    scheduled_at: new Date(Date.now() + 259200000).toISOString(),
    prize: 1200,
    max_participants: 16,
    status: 'upcoming',
  },
  {
    id: 't-4',
    name: 'Blitz Chess Grand Prix #4',
    sport: 'Chess',
    organizer_id: 'u-18',
    description: '5-round Swiss format 3m+2s blitz tournament. Clocks and boards provided.',
    venue: 'Sports Complex',
    scheduled_at: new Date(Date.now() - 3600000).toISOString(),
    prize: 800,
    max_participants: 32,
    status: 'ongoing',
  },
];

const insertTournament = db.prepare(`
  INSERT INTO tournaments (id, name, sport, organizer_id, description, venue, scheduled_at, prize, max_participants, status, created_at)
  VALUES (@id, @name, @sport, @organizer_id, @description, @venue, @scheduled_at, @prize, @max_participants, @status, datetime('now', '-1 day'))
`);

const insertTournPart = db.prepare(`
  INSERT INTO tournament_participants (id, tournament_id, user_id, joined_at)
  VALUES (?, ?, ?, datetime('now', '-12 hours'))
`);

for (const t of TOURNAMENTS) {
  insertTournament.run(t);
  // Add participants
  const count = t.status === 'ongoing' ? t.max_participants : Math.floor(t.max_participants * 0.7);
  for (let i = 0; i < count; i++) {
    const user = USERS[i % USERS.length];
    insertTournPart.run(`tpart-${t.id}-${user.id}-${i}`, t.id, user.id);
  }
}

console.log('✅ Database seeded successfully with dynamic users, match lobbies, challenges, and tournaments!');
