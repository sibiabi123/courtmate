import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import path from 'path';

const ALLOWED_TABLES = ['users', 'posts', 'tournaments', 'matches', 'transactions', 'reports', 'audit_logs'];
const IMMUTABLE_COLS = ['id', 'hash', 'created_at'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { table, row } = body;
    if (!table || !ALLOWED_TABLES.includes(table) || !row?.id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const updates = Object.entries(row).filter(([k]) => !IMMUTABLE_COLS.includes(k));
    if (updates.length === 0) return NextResponse.json({ success: true });

    const db = await getDb();
    const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
    const values = updates.map(([, v]) => v);
    await db.execute(`UPDATE ${table} SET ${setClauses} WHERE id = ?`, [...values, row.id]);
    
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Admin Update Error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
