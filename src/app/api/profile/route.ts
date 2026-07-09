import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

// GET /api/profile?id=xxx OR own profile if no id
export async function GET(req: NextRequest) {
  try {
    const targetId = req.nextUrl.searchParams.get('id');
    const token = req.cookies.get(COOKIE_NAME)?.value;

    let userId = targetId;
    if (!userId && token) {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = payload.userId;
    }
    if (!userId) return NextResponse.json({ success: false, error: 'No user id' }, { status: 400 });

    const db = await getDb();
    const rows = await db.query(
      `SELECT id, name, email, avatar, hostel, role, coins, glicko_rating, glicko_rd, bio, phone, whatsapp, telegram, instagram, created_at FROM users WHERE id = ?`,
      [userId]
    );
    if (rows.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const u = rows[0] as any;
    // Get rank
    const rankRows = await db.query(`SELECT COUNT(*) as cnt FROM users WHERE glicko_rating > ? AND is_banned = 0`, [u.glicko_rating]);
    const rank = Number((rankRows[0] as any)?.cnt || 0) + 1;
    // Get recent posts
    const posts = await db.query(`SELECT id, sport, ground, current_players, max_players, status, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId]);
    // Get tournaments joined
    const tournaments = await db.query(`SELECT t.id, t.name, t.sport, t.status FROM tournament_participants tp LEFT JOIN tournaments t ON tp.tournament_id = t.id WHERE tp.user_id = ? ORDER BY tp.joined_at DESC LIMIT 5`, [userId]);

    return NextResponse.json({
      success: true,
      user: {
        id: u.id, name: u.name, email: u.email, avatar: u.avatar,
        hostel: u.hostel, role: u.role, coins: Number(u.coins) || 0,
        glickoRating: { rating: Number(u.glicko_rating) || 1500, rd: Number(u.glicko_rd) || 350 },
        bio: u.bio, phone: u.phone, whatsapp: u.whatsapp,
        telegram: u.telegram, instagram: u.instagram,
        createdAt: u.created_at, rank,
      },
      posts, tournaments,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

// PATCH /api/profile - update own profile (bio, phone, whatsapp, telegram, instagram)
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { bio, phone, whatsapp, telegram, instagram, name } = await req.json();
    const db = await getDb();
    await db.execute(
      `UPDATE users SET bio = ?, phone = ?, whatsapp = ?, telegram = ?, instagram = ?, name = COALESCE(?, name) WHERE id = ?`,
      [bio ?? null, phone ?? null, whatsapp ?? null, telegram ?? null, instagram ?? null, name ?? null, payload.userId]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
