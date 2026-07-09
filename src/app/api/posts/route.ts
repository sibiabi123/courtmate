import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { sport, ground, maxPlayers = 10, scheduledStart, description = '' } = await req.json();
    if (!sport || !ground) return NextResponse.json({ success: false, error: 'Sport and ground are required' }, { status: 400 });

    const db = await getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const schedStr = scheduledStart ? new Date(scheduledStart).toISOString() : now;

    await db.execute(
      `INSERT INTO posts (id, user_id, sport, ground, max_players, current_players, scheduled_at, status, description, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, 'open', ?, ?)`,
      [id, payload.userId, sport, ground, maxPlayers, schedStr, description || `${sport} match at ${ground}`, now]
    );
    await db.execute(
      `INSERT INTO post_participants (id, post_id, user_id, joined_at) VALUES (?, ?, ?, ?)`,
      [crypto.randomUUID(), id, payload.userId, now]
    );

    const rows = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ success: true, post: rows[0] });
  } catch (e) {
    console.error('Create post error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sport = req.nextUrl.searchParams.get('sport');
    const db = await getDb();

    const rows = sport && sport !== 'All'
      ? await db.query(
          `SELECT p.*, u.name as user_name, u.avatar as user_avatar, u.hostel as user_hostel, u.glicko_rating as user_rating, u.coins as user_coins
           FROM posts p LEFT JOIN users u ON p.user_id = u.id
           WHERE p.status != 'completed' AND p.sport = ?
           ORDER BY p.created_at DESC LIMIT 50`,
          [sport]
        )
      : await db.query(
          `SELECT p.*, u.name as user_name, u.avatar as user_avatar, u.hostel as user_hostel, u.glicko_rating as user_rating, u.coins as user_coins
           FROM posts p LEFT JOIN users u ON p.user_id = u.id
           WHERE p.status != 'completed'
           ORDER BY p.created_at DESC LIMIT 50`
        );

    const posts = (rows as any[]).map((r: any) => ({
      id: r.id, userId: r.user_id, sport: r.sport, ground: r.ground,
      maxPlayers: Number(r.max_players), currentPlayers: Number(r.current_players),
      scheduledStart: r.scheduled_at, scheduledAt: r.scheduled_at,
      status: r.status, description: r.description, createdAt: r.created_at,
      user: r.user_name ? {
        id: r.user_id, name: r.user_name, avatar: r.user_avatar,
        hostel: r.user_hostel, glickoRating: Number(r.user_rating) || 1500,
        coins: Number(r.user_coins) || 0,
      } : null,
      responses: [],
    }));

    return NextResponse.json({ success: true, posts });
  } catch (e) {
    return NextResponse.json({ success: false, posts: [], error: String(e) });
  }
}
