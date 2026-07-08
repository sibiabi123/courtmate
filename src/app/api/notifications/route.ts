import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ notifications: [] });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = await getDb();
    const rows = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [payload.userId]
    );
    return NextResponse.json({ success: true, notifications: rows });
  } catch (e) {
    return NextResponse.json({ success: false, notifications: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, title, message, meta = '{}' } = await req.json();
    if (!userId || !title) return NextResponse.json({ success: false });
    const db = await getDb();
    await db.execute(
      `INSERT INTO notifications (id, user_id, type, title, message, is_read, meta, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))`,
      [crypto.randomUUID(), userId, type || 'info', title, message || '', meta]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = await getDb();
    await db.execute(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [payload.userId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
