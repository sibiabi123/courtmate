/**
 * Shared database helper for API routes.
 * Uses better-sqlite3 locally, or Turso libSQL in production.
 */

let _client: any = null;

function getDb() {
  if (process.env.TURSO_DATABASE_URL) {
    if (!_client) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@libsql/client');
      _client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    }
    return {
      isTurso: true,
      client: _client,
      async execute(sql: string, args: any[] = []) {
        return _client.execute({ sql, args });
      },
      async query(sql: string, args: any[] = []) {
        const result = await _client.execute({ sql, args });
        return result.rows;
      },
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const path = require('path');
    const sqlite = new Database(path.join(process.cwd(), 'courtmate.db'));
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    return {
      isTurso: false,
      client: sqlite,
      execute(sql: string, args: any[] = []) {
        return sqlite.prepare(sql).run(...args);
      },
      query(sql: string, args: any[] = []) {
        return sqlite.prepare(sql).all(...args);
      },
    };
  }
}

export { getDb };
