/**
 * Database connection — supports both:
 *  - Local:      better-sqlite3 (courtmate.db) when TURSO_DATABASE_URL is not set
 *  - Production: Turso (libSQL cloud) when TURSO_DATABASE_URL is set
 */

import * as schema from './schema';

let db: any;

if (process.env.TURSO_DATABASE_URL) {
  // ─── Production: Turso Cloud SQLite ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@libsql/client');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require('drizzle-orm/libsql');
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzle(client, { schema });
} else {
  // ─── Local Development: better-sqlite3 ───────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  const path = require('path');
  const sqlite = new Database(path.join(process.cwd(), 'courtmate.db'));
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  db = drizzle(sqlite, { schema });
}

export { db };
export type DB = typeof db;
