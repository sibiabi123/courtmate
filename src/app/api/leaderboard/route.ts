import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';

export async function GET(req: NextRequest) {
  try {
    const hostel = req.nextUrl.searchParams.get('hostel');
    const db = await getDb();
    const rows = hostel && hostel !== 'All'
      ? await db.query(`SELECT id, name, email, avatar, hostel, coins, role, glicko_rating, glicko_rd FROM users WHERE is_banned = 0 AND hostel = ? ORDER BY glicko_rating DESC LIMIT 100`, [hostel])
      : await db.query(`SELECT id, name, email, avatar, hostel, coins, role, glicko_rating, glicko_rd FROM users WHERE is_banned = 0 ORDER BY glicko_rating DESC LIMIT 100`);

    const users = (rows as any[]).map((u, i) => ({
      id: u.id, name: u.name, email: u.email, avatar: u.avatar,
      hostel: u.hostel, coins: Number(u.coins) || 0, role: u.role,
      rank: i + 1,
      glickoRating: { rating: Number(u.glicko_rating) || 1500, rd: Number(u.glicko_rd) || 350 },
    }));
    return NextResponse.json({ success: true, users });
  } catch (e) {
    return NextResponse.json({ success: false, users: [], error: String(e) });
  }
}
