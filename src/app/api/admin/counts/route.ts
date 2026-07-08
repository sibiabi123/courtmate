import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';

const TABLES = ['users', 'posts', 'tournaments', 'matches', 'transactions', 'reports', 'audit_logs'];

export async function GET() {
  try {
    const db = await getDb();
    const counts: Record<string, number> = {};
    for (const table of TABLES) {
      try {
        const rows = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        const row = rows[0] as any;
        counts[table] = Number(row?.count) || 0;
      } catch {
        counts[table] = 0;
      }
    }
    return NextResponse.json(counts);
  } catch (e) {
    console.error('Admin Counts Error:', e);
    return NextResponse.json({});
  }
}
