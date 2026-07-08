import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = await getDb();, 'courtmate.db'), { readonly: true });
    const user = (await db.query('SELECT * FROM users WHERE id = ?', [payload.userId]))[0] as any;
    

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const { hash, ...safeUser } = user;
    const mappedUser = {
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      avatar: safeUser.avatar,
      hostel: safeUser.hostel,
      coins: safeUser.coins,
      role: safeUser.role,
      glickoRating: {
        rating: safeUser.glicko_rating || 1500,
        rd: safeUser.glicko_rd || 350,
        vol: safeUser.glicko_vol || 0.06
      }
    };
    return NextResponse.json({ success: true, user: mappedUser });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}
