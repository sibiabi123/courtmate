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
    sql += ' ORDER BY c.created_at DESC LIMIT 60';

    const rows = await db.query(sql, args);

    // Format & unpack reported data from description if present
    const challenges = rows.map((c: any) => {
      let reportData: any = null;
      if (c.description && typeof c.description === 'string' && c.description.startsWith('{')) {
        try {
          reportData = JSON.parse(c.description);
        } catch {}
      }

      return {
        ...c,
        reported_winner_id: reportData?.reported_winner_id || null,
        reported_loser_id: reportData?.reported_loser_id || null,
        reported_score: reportData?.reported_score || null,
        reported_by_id: reportData?.reported_by_id || null,
        reported_by_name: reportData?.reported_by_name || null,
        reported_at: reportData?.reported_at || null,
        dispute_reason: reportData?.dispute_reason || null,
        display_description: reportData?.original_description !== undefined ? reportData.original_description : c.description,
      };
    });

    return NextResponse.json({ success: true, challenges });
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

// PATCH /api/challenges - accept / decline / report_score / confirm_result / dispute_result / complete
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await req.json();
    const { challengeId, action, winnerId, score, myScore, oppScore, reason } = body;

    if (!challengeId || !action) {
      return NextResponse.json({ success: false, error: 'challengeId and action are required' }, { status: 400 });
    }

    const db = await getDb();
    const rows = await db.query('SELECT * FROM challenges WHERE id = ?', [challengeId]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
    const challenge = rows[0] as any;

    // Helper to extract existing description payload
    let existingMeta: any = {};
    if (challenge.description && typeof challenge.description === 'string' && challenge.description.startsWith('{')) {
      try { existingMeta = JSON.parse(challenge.description); } catch {}
    } else {
      existingMeta = { original_description: challenge.description || '' };
    }

    // ── ACTION: ACCEPT ─────────────────────────────────────────────────────────────
    if (action === 'accept') {
      if (challenge.status !== 'open') {
        return NextResponse.json({ success: false, error: 'Challenge is not open for acceptance' }, { status: 400 });
      }
      if (challenge.challenger_id === user.userId) {
        return NextResponse.json({ success: false, error: 'Cannot accept your own challenge' }, { status: 400 });
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

    // ── ACTION: DECLINE ────────────────────────────────────────────────────────────
    if (action === 'decline') {
      await db.execute(`UPDATE challenges SET status = 'declined' WHERE id = ?`, [challengeId]);
      return NextResponse.json({ success: true, message: 'Challenge declined' });
    }

    // ── ACTION: REPORT_SCORE (Anti-Cheat Handshake Step 1) ────────────────────────
    if (action === 'report_score') {
      const isParticipant = challenge.challenger_id === user.userId || challenge.challenged_id === user.userId;
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      if (!isParticipant && !isAdmin) {
        return NextResponse.json({ success: false, error: 'Only match participants can report scores' }, { status: 403 });
      }

      const scoreStr = score || (myScore !== undefined && oppScore !== undefined ? `${myScore}-${oppScore}` : 'Result Reported');
      const chosenWinner = winnerId || (parseInt(myScore) > parseInt(oppScore) ? user.userId : (user.userId === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id));
      const chosenLoser = chosenWinner === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id;

      const reportMeta = {
        ...existingMeta,
        reported_winner_id: chosenWinner,
        reported_loser_id: chosenLoser,
        reported_score: scoreStr,
        reported_by_id: user.userId,
        reported_by_name: user.name,
        reported_at: new Date().toISOString(),
      };

      await db.execute(
        `UPDATE challenges SET status = 'awaiting_confirmation', description = ? WHERE id = ?`,
        [JSON.stringify(reportMeta), challengeId]
      );

      // Notify the other player to confirm or dispute
      const opponentId = user.userId === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id;
      if (opponentId) {
        const notifId = crypto.randomUUID();
        await db.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
           VALUES (?, ?, ?, ?, 'result_pending', ?, ?)`,
          [
            notifId,
            opponentId,
            '⚔️ Confirm Match Result',
            `${user.name} reported the match score as ${scoreStr}. Please confirm or dispute the result!`,
            challengeId,
            new Date().toISOString(),
          ]
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Match score reported! Status changed to awaiting opponent confirmation.',
        status: 'awaiting_confirmation',
      });
    }

    // ── ACTION: CONFIRM_RESULT (Anti-Cheat Handshake Step 2) ──────────────────────
    if (action === 'confirm_result') {
      const isParticipant = challenge.challenger_id === user.userId || challenge.challenged_id === user.userId;
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      if (!isParticipant && !isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized to confirm this match' }, { status: 403 });
      }

      const reportedWinner = existingMeta.reported_winner_id || winnerId;
      const reportedLoser = existingMeta.reported_loser_id || (reportedWinner === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id);
      const reportedScore = existingMeta.reported_score || score || 'Confirmed';

      if (!reportedWinner) {
        return NextResponse.json({ success: false, error: 'No reported winner found for this challenge' }, { status: 400 });
      }

      // Reporter cannot confirm their own report unless admin
      if (existingMeta.reported_by_id === user.userId && !isAdmin) {
        return NextResponse.json({ success: false, error: 'Waiting for your opponent to confirm this result' }, { status: 400 });
      }

      await db.execute(
        `UPDATE challenges SET status = 'completed', winner_id = ? WHERE id = ?`,
        [reportedWinner, challengeId]
      );

      // Log confirmed match result
      const resultId = crypto.randomUUID();
      await db.execute(
        `INSERT INTO match_results (id, challenge_id, winner_ids, loser_ids, score, reported_by, admin_confirmed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
        [resultId, challengeId, JSON.stringify([reportedWinner]), JSON.stringify([reportedLoser]), reportedScore, user.userId, new Date().toISOString()]
      );

      // Update ELO & ranking points
      await updateELO(db, reportedWinner, reportedLoser, challenge.mode === 'ranked');

      // Notify both players
      const winnerNotifId = crypto.randomUUID();
      const loserNotifId = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
         VALUES (?, ?, ?, ?, 'match_result', ?, ?)`,
        [winnerNotifId, reportedWinner, '🏆 Match Result Confirmed! (Victory)', `Your ${challenge.sport} match win (${reportedScore}) has been mutually verified. ELO updated!`, challengeId, now]
      );
      await db.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
         VALUES (?, ?, ?, ?, 'match_result', ?, ?)`,
        [loserNotifId, reportedLoser, '📊 Match Result Confirmed', `Your ${challenge.sport} match score (${reportedScore}) has been mutually verified. Keep grinding!`, challengeId, now]
      );

      return NextResponse.json({ success: true, message: 'Result confirmed! ELO and stats updated.' });
    }

    // ── ACTION: DISPUTE_RESULT (Anti-Cheat Dispute Queue) ─────────────────────────
    if (action === 'dispute_result') {
      const isParticipant = challenge.challenger_id === user.userId || challenge.challenged_id === user.userId;
      if (!isParticipant) {
        return NextResponse.json({ success: false, error: 'Only participants can dispute match scores' }, { status: 403 });
      }

      const disputeMeta = {
        ...existingMeta,
        disputed_by_id: user.userId,
        disputed_by_name: user.name,
        dispute_reason: reason || 'Opponent submitted inaccurate final score',
        disputed_at: new Date().toISOString(),
      };

      await db.execute(
        `UPDATE challenges SET status = 'disputed', description = ? WHERE id = ?`,
        [JSON.stringify(disputeMeta), challengeId]
      );

      // Route to admin notifications
      const adminRows = await db.query(`SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 5`);
      const now = new Date().toISOString();
      for (const adm of adminRows) {
        const notifId = crypto.randomUUID();
        await db.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
           VALUES (?, ?, ?, ?, 'match_disputed', ?, ?)`,
          [
            notifId,
            (adm as any).id,
            '⚠️ Match Score Disputed',
            `User ${user.name} disputed match ${challengeId} (${challenge.sport}). Reason: ${reason || 'Score conflict'}. Requires admin moderation.`,
            challengeId,
            now,
          ]
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Match result disputed. Moderation team has been alerted for review.',
        status: 'disputed',
      });
    }

    // ── ACTION: COMPLETE (Direct admin or legacy fallback) ────────────────────────
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

      const resultId = crypto.randomUUID();
      const loserId = winnerId === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id;
      await db.execute(
        `INSERT INTO match_results (id, challenge_id, winner_ids, loser_ids, score, reported_by, admin_confirmed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [resultId, challengeId, JSON.stringify([winnerId]), JSON.stringify([loserId]), score || '', user.userId, isAdmin ? 1 : 0, new Date().toISOString()]
      );

      await updateELO(db, winnerId, loserId, challenge.mode === 'ranked');
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
