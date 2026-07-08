import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const ALLOWED_TABLES = ['users', 'posts', 'tournaments', 'matches', 'transactions', 'reports', 'audit_logs'];

export async function DELETE(req: NextRequest) {
  const table = req.nextUrl.searchParams.get('table');
  const id = req.nextUrl.searchParams.get('id');
  if (!table || !ALLOWED_TABLES.includes(table) || !id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    const db = new Database(path.join(process.cwd(), 'courtmate.db'));
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    db.close();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Admin Delete Error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
