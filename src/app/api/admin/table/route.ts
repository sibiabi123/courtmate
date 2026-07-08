import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const ALLOWED_TABLES = ['users', 'posts', 'tournaments', 'matches', 'transactions', 'reports', 'audit_logs', 'post_participants', 'tournament_participants'];

export async function GET(req: NextRequest) {
  const table = req.nextUrl.searchParams.get('table');
  if (!table || !ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }
  try {
    const db = new Database(path.join(process.cwd(), 'courtmate.db'), { readonly: true });
    // SQLite query
    const rows = db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 500`).all() as Record<string, unknown>[];
    db.close();
    
    // Remove hash field for security
    const safeRows = rows.map(r => {
      const { hash, ...rest } = r as any;
      return rest;
    });
    return NextResponse.json({ rows: safeRows });
  } catch (e) {
    console.error('Admin Fetch Table Error:', e);
    return NextResponse.json({ rows: [], error: String(e) });
  }
}
