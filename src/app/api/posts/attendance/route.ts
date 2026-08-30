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

async function ensureTable(db: any) {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS match_attendance (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        attended INTEGER NOT NULL,
        marked_by TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  } catch {}
}

// POST /api/posts/attendance — Host checkoff of attended / no-show athletes
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postId, records } = body; // records: [{ userId: string, attended: boolean }]

    if (!postId || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: 'postId and non-empty records array are required' }, { status: 400 });
    }

    const db = await getDb();
    await ensureTable(db);

    const now = new Date().toISOString();
    let recordedCount = 0;

    for (const rec of records) {
      const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const attendedInt = rec.attended ? 1 : 0;

      // Delete existing checkoff for this user on this post if any, then insert
      await db.execute(
        `DELETE FROM match_attendance WHERE post_id = ? AND user_id = ?`,
        [postId, rec.userId]
      );

      await db.execute(
        `INSERT INTO match_attendance (id, post_id, user_id, attended, marked_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, postId, rec.userId, attendedInt, user.userId, now]
      );

      // Notify the athlete of attendance record
      const notifId = crypto.randomUUID();
      if (rec.attended) {
        await db.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
           VALUES (?, ?, ?, ?, 'attendance_confirmed', ?, ?)`,
          [notifId, rec.userId, '🛡️ Attendance Confirmed', `Host confirmed your attendance! Your Fair Play Karma remains high.`, postId, now]
        );
      } else {
        await db.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
           VALUES (?, ?, ?, ?, 'attendance_penalty', ?, ?)`,
          [notifId, rec.userId, '⚠️ Marked as No-Show', `You were marked as a no-show for match ${postId}. Repeated no-shows reduce your Fair Play Karma score.`, postId, now]
        );
      }

      recordedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully verified attendance for ${recordedCount} athletes.`,
      recorded: recordedCount,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

// GET /api/posts/attendance?userId=... — Compute Fair Play Karma index
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const db = await getDb();
    await ensureTable(db);

    const rows = await db.query(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END) as attended_count,
         SUM(CASE WHEN attended = 0 THEN 1 ELSE 0 END) as noshow_count
       FROM match_attendance
       WHERE user_id = ?`,
      [userId]
    );

    const data = rows[0] as any;
    const total = Number(data?.total || 0);
    const attended = Number(data?.attended_count || 0);
    const noShows = Number(data?.noshow_count || 0);

    // Default 100% karma for new players with 0 records
    const karma = total > 0 ? Math.round((attended / total) * 100) : 100;
    const isReliable = karma >= 90;
    const isRestricted = total >= 3 && karma < 75;

    return NextResponse.json({
      success: true,
      karma,
      attended,
      noShows,
      total,
      isReliable,
      isRestricted,
      badge: karma >= 95 ? '🛡️ High Reliability' : karma >= 80 ? '⚡ Dependable' : karma >= 65 ? '⚠️ Unstable' : '🚨 High No-Show Risk',
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
