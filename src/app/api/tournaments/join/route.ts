import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { tournamentId } = await req.json();
    if (!tournamentId) return NextResponse.json({ success: false, error: 'tournamentId required' }, { status: 400 });

    const db = await getDb();

    const tournaments = await db.query('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
    const tournament = tournaments[0] as any;
    if (!tournament) return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    if (tournament.status === 'completed') return NextResponse.json({ success: false, error: 'Tournament has ended' }, { status: 400 });

    const existingRows = await db.query('SELECT id FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [tournamentId, payload.userId]);
    if (existingRows.length > 0) return NextResponse.json({ success: false, error: 'Already registered' }, { status: 400 });

    const countRows = await db.query('SELECT COUNT(*) as cnt FROM tournament_participants WHERE tournament_id = ?', [tournamentId]);
    const currentCount = Number((countRows[0] as any)?.cnt) || 0;
    if (currentCount >= tournament.max_participants) return NextResponse.json({ success: false, error: 'Tournament is full' }, { status: 400 });

    await db.execute(
      'INSERT INTO tournament_participants (id, tournament_id, user_id, joined_at) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), tournamentId, payload.userId, new Date().toISOString()]
    );

    // Auto-seed joining participant into open bracket slot
    try {
      const userRows = await db.query('SELECT name, hostel FROM users WHERE id = ?', [payload.userId]);
      const userName = (userRows[0] as any)?.name || 'Participant';
      const userHostel = (userRows[0] as any)?.hostel ? ` (${(userRows[0] as any).hostel})` : '';
      const displayName = `${userName}${userHostel}`;

      const bracketMatches = await db.query(
        'SELECT * FROM tournament_brackets WHERE tournament_id = ? ORDER BY match_number ASC',
        [tournamentId]
      );

      for (const bm of bracketMatches) {
        if (bm.team1_name.startsWith('TBD') || bm.team1_name.startsWith('Seed')) {
          await db.execute('UPDATE tournament_brackets SET team1_name = ? WHERE id = ?', [displayName, bm.id]);
          break;
        } else if (bm.team2_name.startsWith('TBD') || bm.team2_name.startsWith('Seed')) {
          await db.execute('UPDATE tournament_brackets SET team2_name = ? WHERE id = ?', [displayName, bm.id]);
          break;
        }
      }
    } catch (seedErr) {
      console.error('Error auto-seeding participant in bracket:', seedErr);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Join tournament error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
