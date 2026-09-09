import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function GET(req: NextRequest) {
  try {
    const sport = req.nextUrl.searchParams.get('sport');
    const status = req.nextUrl.searchParams.get('status');
    const id = req.nextUrl.searchParams.get('id');
    const db = await getDb();

    // Single tournament lookup by ID
    if (id) {
      const rows = await db.query(
        `SELECT t.*, u.name as organizer_name,
           (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id) as current_participants
         FROM tournaments t
         LEFT JOIN users u ON t.organizer_id = u.id
         WHERE t.id = ?`,
        [id]
      );
      const r = rows[0] as any;
      if (!r) return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });

      const participants = await db.query(
        `SELECT tp.*, u.name as user_name, u.avatar as user_avatar, u.hostel as user_hostel, u.glicko_rating as user_rating
         FROM tournament_participants tp
         JOIN users u ON tp.user_id = u.id
         WHERE tp.tournament_id = ?
         ORDER BY tp.joined_at ASC`,
        [id]
      );

      return NextResponse.json({
        success: true,
        tournament: {
          id: r.id,
          name: r.name,
          sport: r.sport,
          venue: r.venue || 'Sports Arena',
          start_date: r.scheduled_at,
          scheduled_at: r.scheduled_at,
          max_participants: Number(r.max_participants) || 16,
          current_participants: Number(r.current_participants) || participants.length,
          prize: Number(r.prize) || 0,
          status: r.status,
          description: r.description,
          organizer_id: r.organizer_id,
          organizerName: r.organizer_name,
        },
        participants,
      });
    }

    // List all tournaments with filtering
    let sql = `
      SELECT t.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id) as current_participants
      FROM tournaments t
      LEFT JOIN users u ON t.organizer_id = u.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (sport && sport !== 'All') {
      sql += ' AND t.sport = ?';
      args.push(sport);
    }
    if (status && status !== 'all') {
      sql += ' AND t.status = ?';
      args.push(status);
    }
    sql += ' ORDER BY t.created_at DESC';

    const rows = await db.query(sql, args);
    const tournaments = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      sport: r.sport,
      venue: r.venue || 'Sports Arena',
      start_date: r.scheduled_at,
      scheduled_at: r.scheduled_at,
      max_participants: Number(r.max_participants) || 16,
      current_participants: Number(r.current_participants) || 0,
      prize: Number(r.prize) || 0,
      status: r.status,
      description: r.description,
      organizer_id: r.organizer_id,
      organizerName: r.organizer_name,
    }));

    return NextResponse.json({ success: true, tournaments });
  } catch (e) {
    return NextResponse.json({ success: false, tournaments: [], error: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { name, sport, venue = 'Main Sports Arena', start_date, max_participants = 16, prize = 500, description = '' } = await req.json();
    if (!name || !sport) return NextResponse.json({ success: false, error: 'Name and sport are required' }, { status: 400 });

    const db = await getDb();
    const id = `t-${Date.now()}`;
    const now = new Date().toISOString();
    const sched = start_date ? new Date(start_date).toISOString() : now;

    await db.execute(
      `INSERT INTO tournaments (id, name, sport, organizer_id, description, venue, scheduled_at, prize, max_participants, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)`,
      [id, name, sport, payload.userId, description, venue, sched, prize, max_participants, now]
    );

    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
