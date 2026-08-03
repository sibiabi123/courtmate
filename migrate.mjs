import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://courtmate-db-sibiabi123.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('Running migrations...');

  const migrations = [
    // Add ranking_points to users
    `ALTER TABLE users ADD COLUMN ranking_points INTEGER DEFAULT 0`,
    // Add matches_won and matches_played to users  
    `ALTER TABLE users ADD COLUMN matches_won INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN matches_played INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN tournaments_won INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN tournaments_played INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN phone TEXT DEFAULT NULL`,
    `ALTER TABLE users ADD COLUMN whatsapp TEXT DEFAULT NULL`,
    `ALTER TABLE users ADD COLUMN telegram TEXT DEFAULT NULL`,
    `ALTER TABLE users ADD COLUMN instagram TEXT DEFAULT NULL`,
    `ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL`,
    `ALTER TABLE users ADD COLUMN last_claim_date TEXT DEFAULT NULL`,

    // Challenges table
    `CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      challenger_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenged_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      sport TEXT NOT NULL,
      ground TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      description TEXT DEFAULT '',
      mode TEXT NOT NULL DEFAULT 'casual',
      status TEXT NOT NULL DEFAULT 'open',
      admin_approved INTEGER DEFAULT 0,
      winner_id TEXT DEFAULT NULL,
      ranking_points_stake INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,

    // Post comments
    `CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,

    // User achievements
    `CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge TEXT NOT NULL,
      unlocked_at TEXT DEFAULT (datetime('now'))
    )`,

    // ELO history for charts
    `CREATE TABLE IF NOT EXISTS elo_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating REAL NOT NULL,
      delta REAL DEFAULT 0,
      reason TEXT DEFAULT '',
      recorded_at TEXT DEFAULT (datetime('now'))
    )`,

    // Match results
    `CREATE TABLE IF NOT EXISTS match_results (
      id TEXT PRIMARY KEY,
      post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
      challenge_id TEXT REFERENCES challenges(id) ON DELETE SET NULL,
      winner_ids TEXT DEFAULT '[]',
      loser_ids TEXT DEFAULT '[]',
      score TEXT DEFAULT '',
      result_note TEXT DEFAULT '',
      reported_by TEXT REFERENCES users(id),
      admin_confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,

    // Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      related_id TEXT DEFAULT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,

    // Tournament rankings (per tournament points)
    `CREATE TABLE IF NOT EXISTS tournament_standings (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      points INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      position INTEGER DEFAULT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
  ];

  for (const sql of migrations) {
    try {
      await client.execute(sql);
      console.log('OK:', sql.substring(0, 60).trim() + '...');
    } catch (e) {
      if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
        console.log('SKIP (already exists):', sql.substring(0, 60).trim() + '...');
      } else {
        console.error('ERROR:', e.message);
      }
    }
  }

  console.log('\nMigration complete!');
  await client.close();
}

migrate().catch(console.error);
