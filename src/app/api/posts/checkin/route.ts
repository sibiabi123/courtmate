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

async function ensureTables(db: any) {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS match_checkins (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_attendance_karma (
        user_id TEXT PRIMARY KEY,
        total_matches INTEGER DEFAULT 0,
        attended_matches INTEGER DEFAULT 0,
        flaked_matches INTEGER DEFAULT 0,
        reliability_score REAL DEFAULT 100.0,
        last_updated TEXT NOT NULL
      )
    `);
  } catch (err) {
    console.error('Error ensuring checkin tables:', err);
  }
}

// GET /api/posts/checkin?postId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ success: false, error: 'postId parameter required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    await ensureTables(db);

    // Fetch all participants for this post with check-in status & karma
    const rows = await db.query(`
      SELECT 
        u.id as userId,
        u.name,
        u.avatar,
        u.hostel,
        mc.status as checkinStatus,
        mc.created_at as checkinTime,
        COALESCE(uak.reliability_score, 100.0) as reliabilityScore,
        COALESCE(uak.attended_matches, 0) as attendedMatches,
        COALESCE(uak.flaked_matches, 0) as flakedMatches
      FROM post_participants pp
      JOIN users u ON pp.user_id = u.id
      LEFT JOIN match_checkins mc ON mc.post_id = pp.post_id AND mc.user_id = pp.user_id
      LEFT JOIN user_attendance_karma uak ON uak.user_id = pp.user_id
      WHERE pp.post_id = ?
      ORDER BY mc.created_at DESC
    `, [postId]);

    return NextResponse.json({
      success: true,
      checkins: rows,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/posts/checkin — Record pre-match check-in
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postId, status, note } = body;

    if (!postId || !status) {
      return NextResponse.json({ success: false, error: 'postId and status are required' }, { status: 400 });
    }

    if (!['heading_out', 'arrived', 'cant_make_it'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid checkin status' }, { status: 400 });
    }

    const db = await getDb();
    await ensureTables(db);

    const postRows = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    const post = postRows[0] as any;
    if (!post) {
      return NextResponse.json({ success: false, error: 'Match post not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const checkinId = `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Upsert match checkin record
    await db.execute('DELETE FROM match_checkins WHERE post_id = ? AND user_id = ?', [postId, user.userId]);
    await db.execute(
      'INSERT INTO match_checkins (id, post_id, user_id, status, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [checkinId, postId, user.userId, status, note || null, now]
    );

    // Fetch user karma record
    const karmaRows = await db.query('SELECT * FROM user_attendance_karma WHERE user_id = ?', [user.userId]);
    let karma = karmaRows[0] as any;
    if (!karma) {
      karma = { user_id: user.userId, total_matches: 0, attended_matches: 0, flaked_matches: 0, reliability_score: 100.0 };
    }

    if (status === 'cant_make_it') {
      // 1. Release slot from post_participants
      await db.execute('DELETE FROM post_participants WHERE post_id = ? AND user_id = ?', [postId, user.userId]);

      // 2. Decrement post current_players and reset status to open
      const newCount = Math.max(0, post.current_players - 1);
      await db.execute('UPDATE posts SET current_players = ?, status = ? WHERE id = ?', [newCount, 'open', postId]);

      // 3. Update karma metrics
      const newTotal = (karma.total_matches || 0) + 1;
      const newFlaked = (karma.flaked_matches || 0) + 1;
      const attended = karma.attended_matches || 0;
      const newScore = Math.max(0, Math.round((attended / newTotal) * 100));

      await db.execute(
        `INSERT INTO user_attendance_karma (user_id, total_matches, attended_matches, flaked_matches, reliability_score, last_updated)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           total_matches = excluded.total_matches,
           flaked_matches = excluded.flaked_matches,
           reliability_score = excluded.reliability_score,
           last_updated = excluded.last_updated`,
        [user.userId, newTotal, attended, newFlaked, newScore, now]
      );

      // 4. Notify post host immediately
      try {
        await db.execute(
          `INSERT INTO notifications (id, user_id, type, title, message, is_read, meta, created_at)
           VALUES (?, ?, 'flake_alert', ?, ?, 0, ?, ?)`,
          [
            crypto.randomUUID(),
            post.user_id,
            `⚠️ Slot Available in ${post.sport}!`,
            `${user.name} had to cancel. A slot just reopened for your ${post.sport} game at ${post.ground}.`,
            JSON.stringify({ postId, sport: post.sport }),
            now,
          ]
        );
      } catch {}

      return NextResponse.json({
        success: true,
        action: 'slot_released',
        message: 'Your slot has been released and an emergency standby call was triggered.',
        currentPlayers: newCount,
        reliabilityScore: newScore,
      });
    } else {
      // heading_out or arrived
      const newTotal = (karma.total_matches || 0) + 1;
      const newAttended = (karma.attended_matches || 0) + 1;
      const flaked = karma.flaked_matches || 0;
      const newScore = Math.round((newAttended / newTotal) * 100);

      await db.execute(
        `INSERT INTO user_attendance_karma (user_id, total_matches, attended_matches, flaked_matches, reliability_score, last_updated)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           total_matches = excluded.total_matches,
           attended_matches = excluded.attended_matches,
           reliability_score = excluded.reliability_score,
           last_updated = excluded.last_updated`,
        [user.userId, newTotal, newAttended, flaked, newScore, now]
      );

      // Ping host with checkin
      try {
        await db.execute(
          `INSERT INTO notifications (id, user_id, type, title, message, is_read, meta, created_at)
           VALUES (?, ?, 'checkin', ?, ?, 0, ?, ?)`,
          [
            crypto.randomUUID(),
            post.user_id,
            `✓ Player Checked In!`,
            `${user.name} is ${status === 'arrived' ? 'on the court' : 'heading out'} for ${post.sport} at ${post.ground}.`,
            JSON.stringify({ postId, status }),
            now,
          ]
        );
      } catch {}

      return NextResponse.json({
        success: true,
        action: 'checked_in',
        status,
        message: status === 'arrived' ? '✓ Verified on court!' : '✓ Departure confirmed!',
        reliabilityScore: newScore,
      });
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
