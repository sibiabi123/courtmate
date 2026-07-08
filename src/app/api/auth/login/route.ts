import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required.' }, { status: 400 });
    }

    const db = await getDb();
    const user = (await db.query('SELECT * FROM users WHERE email = ?', [email]))[0] as any;
    

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email.' }, { status: 401 });
    }
    if (user.is_banned) {
      return NextResponse.json({ success: false, error: 'Your account has been suspended.' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Construct clean user response with snake_to_camel mappings if needed or exact db properties
    const { hash, ...safeUser } = user;
    // Map db columns to UIState expectations
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

    const res = NextResponse.json({ success: true, user: mappedUser });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('Auth Login API Error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
