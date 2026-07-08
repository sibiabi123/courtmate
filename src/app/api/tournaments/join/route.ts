import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { tournamentId } = await req.json();
    if (!tournamentId) return NextResponse.json({ success: false, error: 'tournamentId required' }, { status: 400 });

    const db = await getDb();, 'courtmate.db'));

    const tournament = (await db.query('SELECT * FROM tournaments WHERE id = ?', [tournamentId]))[0] as any;
    if (!tournament) {  return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 }); }
    if (tournament.status === 'completed') {  return NextResponse.json({ success: false, error: 'Tournament has ended' }, { status: 400 }); }

    const existing = (await db.query('SELECT id FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [tournamentId, payload.userId]))[0];
    if (existing) {  return NextResponse.json({ success: false, error: 'Already registered' }, { status: 400 }); }

    const currentCount = (db.prepare('SELECT COUNT(*) as cnt FROM tournament_participants WHERE tournament_id = ?').get(tournamentId) as any).cnt;
    if (currentCount >= tournament.max_participants) {  return NextResponse.json({ success: false, error: 'Tournament is full' }, { status: 400 }); }

    db.prepare('INSERT INTO tournament_participants (id, tournament_id, user_id, joined_at) VALUES (?, ?, ?, ?)').run(crypto.randomUUID(), tournamentId, payload.userId, new Date().toISOString());

    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Join tournament error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
