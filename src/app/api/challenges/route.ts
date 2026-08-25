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
  } catch { return null; }
}

// GET /api/challenges  - list all open/active challenges
export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const status = req.nextUrl.searchParams.get('status');
    const sport = req.nextUrl.searchParams.get('sport');
    const userId = req.nextUrl.searchParams.get('userId');

    let sql = `
      SELECT c.*,
        c.ranking_points_stake as stake_points,
        c.scheduled_at as match_time,
        c.challenged_id as opponent_id,
        u1.name as challenger_name, u1.avatar as challenger_avatar,
        u1.hostel as challenger_hostel, u1.glicko_rating as challenger_rating,
        u2.name as opponent_name, u2.name as challenged_name,
        u2.avatar as opponent_avatar, u2.avatar as challenged_avatar,
        u2.glicko_rating as opponent_rating
      FROM challenges c
      LEFT JOIN users u1 ON c.challenger_id = u1.id
      LEFT JOIN users u2 ON c.challenged_id = u2.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND c.status = ?';
      args.push(status);
    }
    if (sport && sport !== 'All') {
      sql += ' AND c.sport = ?';
      args.push(sport);
    }
    if (userId) {
      sql += ' AND (c.challenger_id = ? OR c.challenged_id = ?)';
      args.push(userId, userId);
    }
    sql += ' ORDER BY c.created_at DESC LIMIT 50';

    const rows = await db.query(sql, args);
    return NextResponse.json({ success: true, challenges: rows });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/challenges - create a new challenge
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      sport,
      ground,
      scheduledAt,
      match_time,
      description = '',
      mode = 'casual',
      challengedId = null,
      rankingPointsStake = 0,
      stake_points = 0
    } = body;

    const finalMatchTime = match_time || scheduledAt || new Date().toISOString();
    const finalStake = stake_points || rankingPointsStake || 0;

    if (!sport || !ground) {
      return NextResponse.json({ success: false, error: 'sport and ground are required' }, { status: 400 });
    }

    const db = await getDb();
    const id = `ch-${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO challenges (id, challenger_id, challenged_id, sport, ground, scheduled_at, description, mode, status, ranking_points_stake, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
      [id, user.userId, challengedId, sport, ground, finalMatchTime, description, mode, finalStake, now]
    );

    // Notify the challenged player if specific
    if (challengedId) {
      const notifId = crypto.randomUUID();
      await db.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
         VALUES (?, ?, ?, ?, 'challenge', ?, ?)`,
        [notifId, challengedId, '⚔️ New Challenge!', `${user.name} has challenged you to a ${sport} match! Check Challenges to accept.`, id, now]
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

// PATCH /api/challenges - accept / decline / complete a challenge
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await req.json();
    const { challengeId, action, winnerId, score } = body;

    if (!challengeId || !action) {
      return NextResponse.json({ success: false, error: 'challengeId and action are required' }, { status: 400 });
    }

    const db = await getDb();
    const rows = await db.query('SELECT * FROM challenges WHERE id = ?', [challengeId]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
    const challenge = rows[0] as any;

    if (action === 'accept') {
      if (challenge.status !== 'open') {
        return NextResponse.json({ success: false, error: 'Challenge is not open for acceptance' }, { status: 400 });
      }
      await db.execute(
        `UPDATE challenges SET status = 'accepted', challenged_id = ? WHERE id = ?`,
        [user.userId, challengeId]
      );
      // Notify challenger
      const notifId = crypto.randomUUID();
      await db.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
         VALUES (?, ?, ?, ?, 'challenge_accepted', ?, ?)`,
        [notifId, challenge.challenger_id, '✅ Challenge Accepted!', `${user.name} has accepted your ${challenge.sport} challenge!`, challengeId, new Date().toISOString()]
      );
      return NextResponse.json({ success: true, message: 'Challenge accepted' });
    }

    if (action === 'decline') {
      await db.execute(`UPDATE challenges SET status = 'declined' WHERE id = ?`, [challengeId]);
      return NextResponse.json({ success: true, message: 'Challenge declined' });
    }

    if (action === 'complete') {
      const isParticipant = challenge.challenger_id === user.userId || challenge.challenged_id === user.userId;
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      if (!isParticipant && !isAdmin) {
        return NextResponse.json({ success: false, error: 'Only participants or admins can complete challenges' }, { status: 403 });
      }

      if (!winnerId) return NextResponse.json({ success: false, error: 'winnerId is required to complete a challenge' }, { status: 400 });

      await db.execute(
        `UPDATE challenges SET status = 'completed', winner_id = ? WHERE id = ?`,
        [winnerId, challengeId]
      );

      // Log match result
      const resultId = crypto.randomUUID();
      const loserId = winnerId === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id;
      await db.execute(
        `INSERT INTO match_results (id, challenge_id, winner_ids, loser_ids, score, reported_by, admin_confirmed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [resultId, challengeId, JSON.stringify([winnerId]), JSON.stringify([loserId]), score || '', user.userId, isAdmin ? 1 : 0, new Date().toISOString()]
      );

      // Update ELO ratings (simplified Glicko-2)
      await updateELO(db, winnerId, loserId, challenge.mode === 'ranked');

      // Notify both players
      const winnerNotifId = crypto.randomUUID();
      const loserNotifId = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
         VALUES (?, ?, ?, ?, 'match_result', ?, ?)`,
        [winnerNotifId, winnerId, '🏆 You Won!', `Great job! Your ${challenge.sport} challenge result has been recorded.`, challengeId, now]
      );
      await db.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
         VALUES (?, ?, ?, ?, 'match_result', ?, ?)`,
        [loserNotifId, loserId, '📊 Match Completed', `Your ${challenge.sport} match result has been recorded. Keep grinding!`, challengeId, now]
      );

      return NextResponse.json({ success: true, message: 'Challenge completed and ELO updated' });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

async function updateELO(db: any, winnerId: string, loserId: string, isRanked: boolean) {
  const K = isRanked ? 32 : 16;

  const winnerRows = await db.query('SELECT glicko_rating, ranking_points, matches_won, matches_played FROM users WHERE id = ?', [winnerId]);
  const loserRows = await db.query('SELECT glicko_rating, ranking_points, matches_played FROM users WHERE id = ?', [loserId]);
  if (!winnerRows[0] || !loserRows[0]) return;

  const wR = winnerRows[0] as any;
  const lR = loserRows[0] as any;

  const winnerRating = Number(wR.glicko_rating) || 1500;
  const loserRating = Number(lR.glicko_rating) || 1500;

  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;

  const newWinnerRating = Math.round(winnerRating + K * (1 - expectedWinner));
  const newLoserRating = Math.max(100, Math.round(loserRating + K * (0 - expectedLoser)));

  const now = new Date().toISOString();
  const winnerDelta = newWinnerRating - winnerRating;
  const loserDelta = newLoserRating - loserRating;
  const rpGain = isRanked ? Math.abs(winnerDelta) : 5;

  // Update winner
  await db.execute(
    `UPDATE users SET glicko_rating = ?, ranking_points = ranking_points + ?, matches_won = matches_won + 1, matches_played = matches_played + 1 WHERE id = ?`,
    [newWinnerRating, rpGain, winnerId]
  );
  // Update loser
  await db.execute(
    `UPDATE users SET glicko_rating = ?, matches_played = matches_played + 1 WHERE id = ?`,
    [newLoserRating, loserId]
  );

  // Record ELO history
  const wHistId = crypto.randomUUID();
  const lHistId = crypto.randomUUID();
  await db.execute(
    `INSERT INTO elo_history (id, user_id, rating, delta, reason, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [wHistId, winnerId, newWinnerRating, winnerDelta, isRanked ? 'Ranked Win' : 'Casual Win', now]
  );
  await db.execute(
    `INSERT INTO elo_history (id, user_id, rating, delta, reason, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [lHistId, loserId, newLoserRating, loserDelta, isRanked ? 'Ranked Loss' : 'Casual Loss', now]
  );
}
