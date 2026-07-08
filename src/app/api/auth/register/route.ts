import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, hostel = 'Day Scholar' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }
    if (!email.endsWith('@vitstudent.ac.in') && !email.endsWith('@vit.ac.in')) {
      return NextResponse.json({ success: false, error: 'Must use a VIT email address.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const db = new Database(path.join(process.cwd(), 'courtmate.db'));
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      db.close();
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();
    const avatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(email)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, name, hash, avatar, hostel, role, coins, glicko_rating, glicko_rd, glicko_vol, is_banned, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'student', 100, 1500, 350, 0.06, 0, ?)
    `).run(id, email, name, hash, avatar, hostel, now);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    db.close();

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { hash: _, ...safeUser } = user;
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
    console.error('Auth Register API Error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
