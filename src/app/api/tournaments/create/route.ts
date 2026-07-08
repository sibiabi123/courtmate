import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; name: string };

    const { name, sport, maxParticipants = 16, prize = 0, venue = '', description = '' } = await req.json();
    if (!name || !sport) return NextResponse.json({ success: false, error: 'Name and sport are required' }, { status: 400 });

    const db = await getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tournaments (id, name, sport, organizer_id, description, venue, scheduled_at, prize, max_participants, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)
    `).run(id, name, sport, payload.userId, description, venue, now, prize, maxParticipants, now);

    const tournament = (await db.query('SELECT * FROM tournaments WHERE id = ?', [id]))[0];
    

    return NextResponse.json({ success: true, tournament });
  } catch (e) {
    console.error('Create tournament error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
