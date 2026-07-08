import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'courtmate.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create tables
sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  glicko_rating REAL DEFAULT 1500,
  glicko_rd REAL DEFAULT 350,
  glicko_vol REAL DEFAULT 0.06,
  hostel TEXT NOT NULL DEFAULT 'Day Scholar',
  coins INTEGER NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  result TEXT DEFAULT '',
  winner_ids TEXT DEFAULT '[]',
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT REFERENCES users(id),
  reported_id TEXT NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
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

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT DEFAULT '',
  detail TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// Check if admin already exists
const existing = sqlite.prepare('SELECT id FROM users WHERE email = ?').get('admin@vitstudent.ac.in');
if (!existing) {
  const adminId = crypto.randomUUID();
  const hash = bcrypt.hashSync('Admin@123', 12);
  sqlite.prepare(`
    INSERT INTO users (id, email, name, hash, hostel, role, coins, glicko_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 'admin@vitstudent.ac.in', 'CourtMate Admin', hash, 'Day Scholar', 'super_admin', 9999, 2000);
  console.log('✅ Admin user created: admin@vitstudent.ac.in / Admin@123');
} else {
  console.log('ℹ️  Admin user already exists.');
}

sqlite.close();
console.log('✅ Database seeded successfully at', DB_PATH);
