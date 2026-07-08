import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';

export async function GET() {
  try {
    const db = await getDb();
    const userRows = await db.query('SELECT COUNT(*) as count FROM users');
    const postRows = await db.query("SELECT COUNT(*) as count FROM posts WHERE status = 'open'");
    const tournamentRows = await db.query('SELECT COUNT(*) as count FROM tournaments');

    return NextResponse.json({
      totalUsers: Number((userRows[0] as any)?.count) || 0,
      activeMatches: Number((postRows[0] as any)?.count) || 0,
      totalTournaments: Number((tournamentRows[0] as any)?.count) || 0,
    });
  } catch (e) {
    console.error('Stats API error:', e);
    return NextResponse.json({ totalUsers: 0, activeMatches: 0, totalTournaments: 0 });
  }
}
