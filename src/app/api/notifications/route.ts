import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch { return null; }
}

// GET /api/notifications - fetch notifications for current user
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ notifications: [] });

  try {
    const db = await getDb();
    const rows = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [user.userId]
    );
    return NextResponse.json({ success: true, notifications: rows });
  } catch (e) {
    return NextResponse.json({ success: false, notifications: [], error: String(e) });
  }
}

// PATCH /api/notifications - mark all as read
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const db = await getDb();
    await db.execute(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [user.userId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}

// POST /api/notifications - create a notification (admin only or system)
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  try {
    const { userId, title, message, type = 'general', relatedId } = await req.json();
    if (!userId || !title || !message) {
      return NextResponse.json({ success: false, error: 'userId, title, message required' }, { status: 400 });
    }
    const db = await getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title, message, type, relatedId || null, now]
    );
    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
