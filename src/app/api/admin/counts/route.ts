import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const TABLES = ['users', 'posts', 'tournaments', 'matches', 'transactions', 'reports', 'audit_logs'];

export async function GET() {
  try {
    const db = new Database(path.join(process.cwd(), 'courtmate.db'), { readonly: true });
    const counts: Record<string, number> = {};
    for (const table of TABLES) {
      try {
        const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
        counts[table] = row?.count || 0;
      } catch {
        counts[table] = 0;
      }
    }
    db.close();
    return NextResponse.json(counts);
  } catch (e) {
    console.error('Admin Counts Error:', e);
    return NextResponse.json({});
  }
}
