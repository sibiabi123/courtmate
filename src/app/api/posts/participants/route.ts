import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';

export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get('postId');
    if (!postId) return NextResponse.json({ participants: [] });
    const db = await getDb();
    const rows = await db.query(
      `SELECT pp.user_id, pp.joined_at,
              u.name, u.avatar, u.hostel, u.glicko_rating, u.coins,
              u.phone, u.whatsapp, u.telegram, u.instagram, u.bio
       FROM post_participants pp
       LEFT JOIN users u ON pp.user_id = u.id
       WHERE pp.post_id = ?
       ORDER BY pp.joined_at ASC`,
      [postId]
    );
    const participants = (rows as any[]).map(r => ({
      id: r.user_id, name: r.name, avatar: r.avatar,
      hostel: r.hostel, coins: Number(r.coins) || 0,
      glickoRating: Number(r.glicko_rating) || 1500,
      joinedAt: r.joined_at,
      bio: r.bio,
      contact: {
        phone: r.phone,
        whatsapp: r.whatsapp,
        telegram: r.telegram,
        instagram: r.instagram,
      },
    }));
    return NextResponse.json({ success: true, participants });
  } catch (e) {
    return NextResponse.json({ success: false, participants: [], error: String(e) });
  }
}
