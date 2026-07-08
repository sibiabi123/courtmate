import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import path from 'path';

const ALLOWED_TABLES = ['users', 'posts', 'tournaments', 'matches', 'transactions', 'reports', 'audit_logs', 'post_participants', 'tournament_participants'];

export async function GET(req: NextRequest) {
  const table = req.nextUrl.searchParams.get('table');
  if (!table || !ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }
  try {
    const db = await getDb();, 'courtmate.db'), { readonly: true });
    // SQLite query
    const rows = await db.query(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 500`) as Record<string, unknown>[];
    
    
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
