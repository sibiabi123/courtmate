import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; name: string };
  } catch { return null; }
}

async function ensureTable(db: any) {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lobby_messages (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_avatar TEXT,
        message TEXT NOT NULL,
        is_chip INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);
  } catch {}
}

// GET /api/posts/messages?postId=... — Fetch lobby chat and ping messages
export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get('postId');
    if (!postId) {
      return NextResponse.json({ success: false, error: 'postId is required' }, { status: 400 });
    }

    const db = await getDb();
    await ensureTable(db);

    const rows = await db.query(
      `SELECT * FROM lobby_messages WHERE post_id = ? ORDER BY created_at ASC LIMIT 100`,
      [postId]
    );

    const messages = rows.map((r: any) => ({
      id: r.id,
      postId: r.post_id,
      userId: r.user_id,
      userName: r.user_name,
      userAvatar: r.user_avatar,
      message: r.message,
      isChip: Boolean(r.is_chip),
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, messages });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/posts/messages — Send chat message or tactical chip ping
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postId, message, isChip = false } = body;

    if (!postId || !message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'postId and message are required' }, { status: 400 });
    }

    const cleanMessage = message.trim().slice(0, 240); // 240 char cap
    const db = await getDb();
    await ensureTable(db);

    // Fetch user details
    const userRows = await db.query(`SELECT avatar FROM users WHERE id = ?`, [user.userId]);
    const userAvatar = (userRows[0] as any)?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`;

    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO lobby_messages (id, post_id, user_id, user_name, user_avatar, message, is_chip, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, postId, user.userId, user.name, userAvatar, cleanMessage, isChip ? 1 : 0, now]
    );

    const newMessage = {
      id,
      postId,
      userId: user.userId,
      userName: user.name,
      userAvatar,
      message: cleanMessage,
      isChip: Boolean(isChip),
      createdAt: now,
    };

    return NextResponse.json({ success: true, message: newMessage });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
