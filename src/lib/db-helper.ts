/**
 * Shared database helper for API routes.
 * Auto-switches between local better-sqlite3 and Turso libSQL in production.
 */

let _tursoClient: any = null;

export async function getDb() {
  if (process.env.TURSO_DATABASE_URL) {
    // ── Production: Turso Cloud ──────────────────────────────────────────────
    if (!_tursoClient) {
      const { createClient } = await import('@libsql/client');
      _tursoClient = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    }
    const client = _tursoClient;
    return {
      /** Returns array of rows */
      query: async (sql: string, args: any[] = []): Promise<any[]> => {
        if (!sql || sql.trim() === '') return [];
        const result = await client.execute({ sql, args });
        return result.rows as any[];
      },
      /** Executes a write statement */
      execute: async (sql: string, args: any[] = []): Promise<void> => {
        if (!sql || sql.trim() === '') return;
        await client.execute({ sql, args });
      },
    };
  } else {
    // ── Local Development: better-sqlite3 ────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const path = require('path');
    const sqlite = new Database(path.join(process.cwd(), 'courtmate.db'));
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    return {
      query: async (sql: string, args: any[] = []): Promise<any[]> => {
        if (!sql || sql.trim() === '') return [];
        return sqlite.prepare(sql).all(...args);
      },
      execute: async (sql: string, args: any[] = []): Promise<void> => {
        if (!sql || sql.trim() === '') return;
        sqlite.prepare(sql).run(...args);
      },
    };
  }
}
