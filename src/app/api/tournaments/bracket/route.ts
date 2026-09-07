import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; name: string };
  } catch {
    return null;
  }
}

async function ensureTable(db: any) {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tournament_brackets (
        id TEXT PRIMARY KEY,
        tournament_id TEXT NOT NULL,
        round_name TEXT NOT NULL,
        match_number INTEGER NOT NULL,
        team1_name TEXT NOT NULL,
        team2_name TEXT NOT NULL,
        score1 INTEGER DEFAULT 0,
        score2 INTEGER DEFAULT 0,
        winner_name TEXT,
        status TEXT NOT NULL, -- 'scheduled', 'live', 'completed', 'disputed'
        captain1_verified INTEGER DEFAULT 0,
        captain2_verified INTEGER DEFAULT 0,
        court_venue TEXT,
        scheduled_time TEXT,
        created_at TEXT NOT NULL
      )
    `);
  } catch (err) {
    console.error('Error ensuring tournament_brackets table:', err);
  }
}

// GET /api/tournaments/bracket?tournamentId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get('tournamentId') || 'tourn-default-1';

  try {
    const db = await getDb();
    await ensureTable(db);

    let matches = await db.query(
      'SELECT * FROM tournament_brackets WHERE tournament_id = ? ORDER BY match_number ASC',
      [tournamentId]
    );

    // If no matches yet, initialize standard 8-team collegiate bracket
    if (!matches || matches.length === 0) {
      const defaultMatches = [
        // Round 1: Quarterfinals
        { id: `b-${tournamentId}-m1`, tId: tournamentId, round: 'Quarterfinals', num: 1, t1: 'MH-D Red Dragons', t2: 'MH-A Warriors', s1: 21, s2: 15, w: 'MH-D Red Dragons', st: 'completed', c1: 1, c2: 1, v: 'Court 1', time: '10:00 AM' },
        { id: `b-${tournamentId}-m2`, tId: tournamentId, round: 'Quarterfinals', num: 2, t1: 'LH-B Valkyries', t2: 'LH-A Phoenix', s1: 21, s2: 19, w: 'LH-B Valkyries', st: 'completed', c1: 1, c2: 1, v: 'Court 2', time: '10:30 AM' },
        { id: `b-${tournamentId}-m3`, tId: tournamentId, round: 'Quarterfinals', num: 3, t1: 'MH-Q Titans', t2: 'MH-K Strikers', s1: 18, s2: 21, w: 'MH-K Strikers', st: 'completed', c1: 1, c2: 1, v: 'Court 1', time: '11:00 AM' },
        { id: `b-${tournamentId}-m4`, tId: tournamentId, round: 'Quarterfinals', num: 4, t1: 'Day Scholars XI', t2: 'MH-G Lions', s1: 21, s2: 14, w: 'Day Scholars XI', st: 'completed', c1: 1, c2: 1, v: 'Court 2', time: '11:30 AM' },
        // Round 2: Semifinals
        { id: `b-${tournamentId}-m5`, tId: tournamentId, round: 'Semifinals', num: 5, t1: 'MH-D Red Dragons', t2: 'LH-B Valkyries', s1: 21, s2: 18, w: 'MH-D Red Dragons', st: 'completed', c1: 1, c2: 1, v: 'Center Court', time: '2:00 PM' },
        { id: `b-${tournamentId}-m6`, tId: tournamentId, round: 'Semifinals', num: 6, t1: 'MH-K Strikers', t2: 'Day Scholars XI', s1: 19, s2: 21, w: 'Day Scholars XI', st: 'completed', c1: 1, c2: 1, v: 'Center Court', time: '2:45 PM' },
        // Round 3: Championship Final
        { id: `b-${tournamentId}-m7`, tId: tournamentId, round: 'Championship Final', num: 7, t1: 'MH-D Red Dragons', t2: 'Day Scholars XI', s1: 16, s2: 14, w: null, st: 'live', c1: 0, c2: 0, v: 'Center Court', time: '4:30 PM' },
      ];

      for (const m of defaultMatches) {
        await db.execute(
          `INSERT INTO tournament_brackets 
           (id, tournament_id, round_name, match_number, team1_name, team2_name, score1, score2, winner_name, status, captain1_verified, captain2_verified, court_venue, scheduled_time, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          [m.id, m.tId, m.round, m.num, m.t1, m.t2, m.s1, m.s2, m.w, m.st, m.c1, m.c2, m.v, m.time]
        );
      }

      matches = await db.query(
        'SELECT * FROM tournament_brackets WHERE tournament_id = ? ORDER BY match_number ASC',
        [tournamentId]
      );
    }

    return NextResponse.json({ success: true, matches });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/tournaments/bracket — Referee score update & captain handshake
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, score1, score2, status, verifyAsCaptain } = body;

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'matchId required' }, { status: 400 });
    }

    const db = await getDb();
    await ensureTable(db);

    const matchRows = await db.query('SELECT * FROM tournament_brackets WHERE id = ?', [matchId]);
    const match = matchRows[0] as any;
    if (!match) {
      return NextResponse.json({ success: false, error: 'Bracket match not found' }, { status: 404 });
    }

    let winner = match.winner_name;
    let newStatus = status || match.status;
    let c1 = match.captain1_verified;
    let c2 = match.captain2_verified;

    if (verifyAsCaptain === 1) c1 = 1;
    if (verifyAsCaptain === 2) c2 = 1;

    // Determine winner if completed or scores entered
    if (score1 !== undefined && score2 !== undefined) {
      if (score1 > score2) winner = match.team1_name;
      else if (score2 > score1) winner = match.team2_name;
    }

    if (c1 === 1 && c2 === 1) {
      newStatus = 'completed';
    }

    await db.execute(
      `UPDATE tournament_brackets SET 
        score1 = COALESCE(?, score1),
        score2 = COALESCE(?, score2),
        winner_name = ?,
        status = ?,
        captain1_verified = ?,
        captain2_verified = ?
       WHERE id = ?`,
      [score1 ?? match.score1, score2 ?? match.score2, winner, newStatus, c1, c2, matchId]
    );

    return NextResponse.json({
      success: true,
      message: c1 === 1 && c2 === 1 ? '✓ Both Captains verified! Match result locked.' : 'Score updated.',
      match: {
        ...match,
        score1: score1 ?? match.score1,
        score2: score2 ?? match.score2,
        winner_name: winner,
        status: newStatus,
        captain1_verified: c1,
        captain2_verified: c2,
      }
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
