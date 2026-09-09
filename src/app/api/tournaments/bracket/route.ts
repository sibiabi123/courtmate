import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // If no matches exist yet, initialize default 8-team collegiate bracket
    if (!matches || matches.length === 0) {
      const defaultMatches = [
        // Quarterfinals
        { id: `b-${tournamentId}-m1`, tId: tournamentId, round: 'Quarterfinals', num: 1, t1: 'MH-D Red Dragons', t2: 'MH-A Warriors', s1: 21, s2: 15, w: 'MH-D Red Dragons', st: 'completed', c1: 1, c2: 1, v: 'Court 1', time: '10:00 AM' },
        { id: `b-${tournamentId}-m2`, tId: tournamentId, round: 'Quarterfinals', num: 2, t1: 'LH-B Valkyries', t2: 'LH-A Phoenix', s1: 21, s2: 19, w: 'LH-B Valkyries', st: 'completed', c1: 1, c2: 1, v: 'Court 2', time: '10:30 AM' },
        { id: `b-${tournamentId}-m3`, tId: tournamentId, round: 'Quarterfinals', num: 3, t1: 'MH-Q Titans', t2: 'MH-K Strikers', s1: 18, s2: 21, w: 'MH-K Strikers', st: 'completed', c1: 1, c2: 1, v: 'Court 1', time: '11:00 AM' },
        { id: `b-${tournamentId}-m4`, tId: tournamentId, round: 'Quarterfinals', num: 4, t1: 'Day Scholars XI', t2: 'MH-G Lions', s1: 21, s2: 14, w: 'Day Scholars XI', st: 'completed', c1: 1, c2: 1, v: 'Court 2', time: '11:30 AM' },
        // Semifinals
        { id: `b-${tournamentId}-m5`, tId: tournamentId, round: 'Semifinals', num: 5, t1: 'MH-D Red Dragons', t2: 'LH-B Valkyries', s1: 21, s2: 18, w: 'MH-D Red Dragons', st: 'completed', c1: 1, c2: 1, v: 'Center Court', time: '2:00 PM' },
        { id: `b-${tournamentId}-m6`, tId: tournamentId, round: 'Semifinals', num: 6, t1: 'MH-K Strikers', t2: 'Day Scholars XI', s1: 19, s2: 21, w: 'Day Scholars XI', st: 'completed', c1: 1, c2: 1, v: 'Center Court', time: '2:45 PM' },
        // Championship Final
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

// POST /api/tournaments/bracket — Customization, Scoring & Regeneration
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = await getDb();
    await ensureTable(db);

    // ── ACTION A: Custom Bracket Regeneration (4, 8, or 16 teams) ────────────
    if (body.action === 'generate_bracket') {
      const { tournamentId, size = 8, teams = [] } = body;
      if (!tournamentId) {
        return NextResponse.json({ success: false, error: 'tournamentId required' }, { status: 400 });
      }

      // Delete existing bracket matches for this tournament
      await db.execute('DELETE FROM tournament_brackets WHERE tournament_id = ?', [tournamentId]);

      const now = new Date().toISOString();
      const generatedMatches: any[] = [];

      if (size === 4) {
        // 4 Teams: 2 Semifinals, 1 Final
        const t = teams.length >= 4 ? teams : ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];
        generatedMatches.push(
          { id: `b-${tournamentId}-m1`, round: 'Semifinals', num: 1, t1: t[0], t2: t[1], s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Court 1', time: '10:00 AM' },
          { id: `b-${tournamentId}-m2`, round: 'Semifinals', num: 2, t1: t[2], t2: t[3], s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Court 2', time: '10:45 AM' },
          { id: `b-${tournamentId}-m3`, round: 'Championship Final', num: 3, t1: 'TBD (Winner SF1)', t2: 'TBD (Winner SF2)', s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Center Court', time: '02:30 PM' }
        );
      } else if (size === 16) {
        // 16 Teams: 8 Round of 16, 4 Quarters, 2 Semis, 1 Final
        const default16 = Array.from({ length: 16 }, (_, i) => teams[i] || `Seed #${i + 1}`);
        // Round of 16
        for (let i = 0; i < 8; i++) {
          generatedMatches.push({
            id: `b-${tournamentId}-m${i + 1}`,
            round: 'Round of 16',
            num: i + 1,
            t1: default16[i * 2],
            t2: default16[i * 2 + 1],
            s1: 0, s2: 0, w: null, st: 'scheduled', v: `Court ${(i % 4) + 1}`, time: `${9 + Math.floor(i / 2)}:00 AM`
          });
        }
        // Quarters
        for (let i = 0; i < 4; i++) {
          generatedMatches.push({
            id: `b-${tournamentId}-m${i + 9}`,
            round: 'Quarterfinals',
            num: i + 9,
            t1: `TBD (Winner M${i * 2 + 1})`,
            t2: `TBD (Winner M${i * 2 + 2})`,
            s1: 0, s2: 0, w: null, st: 'scheduled', v: `Court ${(i % 2) + 1}`, time: `${1 + i}:00 PM`
          });
        }
        // Semis
        generatedMatches.push(
          { id: `b-${tournamentId}-m13`, round: 'Semifinals', num: 13, t1: 'TBD (Winner QF1)', t2: 'TBD (Winner QF2)', s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Center Court', time: '04:00 PM' },
          { id: `b-${tournamentId}-m14`, round: 'Semifinals', num: 14, t1: 'TBD (Winner QF3)', t2: 'TBD (Winner QF4)', s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Center Court', time: '05:00 PM' }
        );
        // Final
        generatedMatches.push(
          { id: `b-${tournamentId}-m15`, round: 'Championship Final', num: 15, t1: 'TBD (Winner SF1)', t2: 'TBD (Winner SF2)', s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Arena Main Stage', time: '07:00 PM' }
        );
      } else {
        // Default 8 Teams: 4 Quarters, 2 Semis, 1 Final
        const t = Array.from({ length: 8 }, (_, i) => teams[i] || `Seed #${i + 1}`);
        generatedMatches.push(
          { id: `b-${tournamentId}-m1`, round: 'Quarterfinals', num: 1, t1: t[0], t2: t[1], s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Court 1', time: '10:00 AM' },
          { id: `b-${tournamentId}-m2`, round: 'Quarterfinals', num: 2, t1: t[2], t2: t[3], s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Court 2', time: '10:30 AM' },
          { id: `b-${tournamentId}-m3`, round: 'Quarterfinals', num: 3, t1: t[4], t2: t[5], s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Court 1', time: '11:00 AM' },
          { id: `b-${tournamentId}-m4`, round: 'Quarterfinals', num: 4, t1: t[6], t2: t[7], s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Court 2', time: '11:30 AM' },
          { id: `b-${tournamentId}-m5`, round: 'Semifinals', num: 5, t1: 'TBD (Winner QF1)', t2: 'TBD (Winner QF2)', s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Center Court', time: '02:00 PM' },
          { id: `b-${tournamentId}-m6`, round: 'Semifinals', num: 6, t1: 'TBD (Winner QF3)', t2: 'TBD (Winner QF4)', s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Center Court', time: '02:45 PM' },
          { id: `b-${tournamentId}-m7`, round: 'Championship Final', num: 7, t1: 'TBD (Winner SF1)', t2: 'TBD (Winner SF2)', s1: 0, s2: 0, w: null, st: 'scheduled', v: 'Center Court', time: '04:30 PM' }
        );
      }

      for (const m of generatedMatches) {
        await db.execute(
          `INSERT INTO tournament_brackets 
           (id, tournament_id, round_name, match_number, team1_name, team2_name, score1, score2, winner_name, status, captain1_verified, captain2_verified, court_venue, scheduled_time, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
          [m.id, tournamentId, m.round, m.num, m.t1, m.t2, m.s1, m.s2, m.w, m.st, m.v, m.time, now]
        );
      }

      const newMatches = await db.query(
        'SELECT * FROM tournament_brackets WHERE tournament_id = ? ORDER BY match_number ASC',
        [tournamentId]
      );
      return NextResponse.json({ success: true, message: `Bracket regenerated for ${size} teams`, matches: newMatches });
    }

    // ── ACTION B: Single Match Editing & Score Verification ──────────────────
    const { matchId, team1_name, team2_name, score1, score2, winner_name, court_venue, scheduled_time, status, verifyAsCaptain } = body;

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'matchId is required' }, { status: 400 });
    }

    const matchRows = await db.query('SELECT * FROM tournament_brackets WHERE id = ?', [matchId]);
    const match = matchRows[0] as any;
    if (!match) {
      return NextResponse.json({ success: false, error: 'Bracket match not found' }, { status: 404 });
    }

    const t1 = team1_name !== undefined ? team1_name : match.team1_name;
    const t2 = team2_name !== undefined ? team2_name : match.team2_name;
    const s1 = score1 !== undefined ? Number(score1) : match.score1;
    const s2 = score2 !== undefined ? Number(score2) : match.score2;
    const venue = court_venue !== undefined ? court_venue : match.court_venue;
    const time = scheduled_time !== undefined ? scheduled_time : match.scheduled_time;

    let winner = winner_name !== undefined ? winner_name : match.winner_name;
    let newStatus = status || match.status;
    let c1 = match.captain1_verified;
    let c2 = match.captain2_verified;

    if (verifyAsCaptain === 1) c1 = 1;
    if (verifyAsCaptain === 2) c2 = 1;

    // Automatically calculate winner if scores are modified or completed
    if (winner === undefined || winner === null || score1 !== undefined || score2 !== undefined) {
      if (s1 > s2) winner = t1;
      else if (s2 > s1) winner = t2;
    }

    if (c1 === 1 && c2 === 1) {
      newStatus = 'completed';
    }

    await db.execute(
      `UPDATE tournament_brackets SET 
        team1_name = ?,
        team2_name = ?,
        score1 = ?,
        score2 = ?,
        winner_name = ?,
        court_venue = ?,
        scheduled_time = ?,
        status = ?,
        captain1_verified = ?,
        captain2_verified = ?
       WHERE id = ?`,
      [t1, t2, s1, s2, winner, venue, time, newStatus, c1, c2, matchId]
    );

    // ── Winner Propagation: Advance winner to the next round if applicable ────
    if (winner && (newStatus === 'completed' || newStatus === 'live')) {
      const tournamentId = match.tournament_id;
      const num = match.match_number;

      // 8-Team Bracket Auto-Advancement Rules
      let targetMatchNum = 0;
      let isTeam1Slot = true;

      if (num === 1) { targetMatchNum = 5; isTeam1Slot = true; }
      else if (num === 2) { targetMatchNum = 5; isTeam1Slot = false; }
      else if (num === 3) { targetMatchNum = 6; isTeam1Slot = true; }
      else if (num === 4) { targetMatchNum = 6; isTeam1Slot = false; }
      else if (num === 5) { targetMatchNum = 7; isTeam1Slot = true; }
      else if (num === 6) { targetMatchNum = 7; isTeam1Slot = false; }

      if (targetMatchNum > 0) {
        if (isTeam1Slot) {
          await db.execute(
            `UPDATE tournament_brackets SET team1_name = ? WHERE tournament_id = ? AND match_number = ?`,
            [winner, tournamentId, targetMatchNum]
          );
        } else {
          await db.execute(
            `UPDATE tournament_brackets SET team2_name = ? WHERE tournament_id = ? AND match_number = ?`,
            [winner, tournamentId, targetMatchNum]
          );
        }
      }
    }

    const updatedRows = await db.query('SELECT * FROM tournament_brackets WHERE id = ?', [matchId]);
    return NextResponse.json({
      success: true,
      message: 'Match bracket customized successfully',
      match: updatedRows[0] || match
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

