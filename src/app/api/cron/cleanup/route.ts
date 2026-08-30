import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    let expiredLobbies = 0;
    let autoConfirmedDuels = 0;
    let cleanedNotifications = 0;

    // 1. Auto-expire open match lobbies older than 3 hours
    try {
      // In posts, check status='open' or status='active'
      const checkPosts = await db.query(
        `SELECT id FROM posts WHERE status = 'open' AND (scheduled_at < datetime('now', '-3 hours') OR date < date('now', '-1 day'))`
      );
      if (checkPosts.length > 0) {
        await db.execute(
          `UPDATE posts SET status = 'expired' WHERE status = 'open' AND (scheduled_at < datetime('now', '-3 hours') OR date < date('now', '-1 day'))`
        );
        expiredLobbies = checkPosts.length;
      }
    } catch {}

    // 2. Auto-confirm pending match duel results (24h rule with no dispute)
    try {
      const pendingChallenges = await db.query(
        `SELECT * FROM challenges WHERE status = 'awaiting_confirmation'`
      );

      for (const c of pendingChallenges) {
        let meta: any = null;
        if (c.description && typeof c.description === 'string' && c.description.startsWith('{')) {
          try { meta = JSON.parse(c.description); } catch {}
        }

        const reportedAt = meta?.reported_at ? new Date(meta.reported_at).getTime() : 0;
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

        // If reported more than 24 hours ago and has winner info, auto-confirm
        if (reportedAt > 0 && reportedAt < cutoff && meta?.reported_winner_id) {
          const winnerId = meta.reported_winner_id;
          const loserId = meta.reported_loser_id || (winnerId === c.challenger_id ? c.challenged_id : c.challenger_id);
          const score = meta.reported_score || 'Auto-Confirmed';

          await db.execute(
            `UPDATE challenges SET status = 'completed', winner_id = ? WHERE id = ?`,
            [winnerId, c.id]
          );

          // Log in match_results
          const resultId = crypto.randomUUID();
          await db.execute(
            `INSERT INTO match_results (id, challenge_id, winner_ids, loser_ids, score, reported_by, admin_confirmed, created_at)
             VALUES (?, ?, ?, ?, ?, 'system_cron_auto', 1, ?)`,
            [resultId, c.id, JSON.stringify([winnerId]), JSON.stringify([loserId]), score, now]
          );

          // Update ELO
          const isRanked = c.mode === 'ranked';
          const K = isRanked ? 32 : 16;
          const winnerRows = await db.query('SELECT glicko_rating FROM users WHERE id = ?', [winnerId]);
          const loserRows = await db.query('SELECT glicko_rating FROM users WHERE id = ?', [loserId]);

          if (winnerRows[0] && loserRows[0]) {
            const wR = Number((winnerRows[0] as any).glicko_rating) || 1500;
            const lR = Number((loserRows[0] as any).glicko_rating) || 1500;
            const expW = 1 / (1 + Math.pow(10, (lR - wR) / 400));
            const expL = 1 - expW;
            const newWR = Math.round(wR + K * (1 - expW));
            const newLR = Math.max(100, Math.round(lR + K * (0 - expL)));
            const rpGain = isRanked ? Math.abs(newWR - wR) : 5;

            await db.execute(
              `UPDATE users SET glicko_rating = ?, ranking_points = ranking_points + ?, matches_won = matches_won + 1, matches_played = matches_played + 1 WHERE id = ?`,
              [newWR, rpGain, winnerId]
            );
            await db.execute(
              `UPDATE users SET glicko_rating = ?, matches_played = matches_played + 1 WHERE id = ?`,
              [newLR, loserId]
            );
          }

          // Notify winner & loser of auto-confirmation
          const notifId1 = crypto.randomUUID();
          const notifId2 = crypto.randomUUID();
          await db.execute(
            `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
             VALUES (?, ?, ?, ?, 'match_result', ?, ?)`,
            [notifId1, winnerId, '🏆 Duel Auto-Confirmed', `Your ${c.sport} match result was auto-confirmed after 24h of no dispute. ELO updated!`, c.id, now]
          );
          await db.execute(
            `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
             VALUES (?, ?, ?, ?, 'match_result', ?, ?)`,
            [notifId2, loserId, '📊 Duel Auto-Confirmed', `The ${c.sport} match result was auto-confirmed after 24h. Ratings have settled.`, c.id, now]
          );

          autoConfirmedDuels++;
        }
      }
    } catch {}

    // 3. Clean up read notifications older than 30 days (excluding attendance karma records)
    try {
      const oldNotifs = await db.query(
        `SELECT COUNT(*) as cnt FROM notifications WHERE is_read = 1 AND type NOT IN ('attendance_confirmed', 'attendance_penalty') AND created_at < datetime('now', '-30 days')`
      );
      cleanedNotifications = Number((oldNotifs[0] as any)?.cnt || 0);
      if (cleanedNotifications > 0) {
        await db.execute(
          `DELETE FROM notifications WHERE is_read = 1 AND type NOT IN ('attendance_confirmed', 'attendance_penalty') AND created_at < datetime('now', '-30 days')`
        );
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Cleanup cron job executed successfully',
      stats: {
        expiredLobbies,
        autoConfirmedDuels,
        cleanedNotifications,
      },
      timestamp: now,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
