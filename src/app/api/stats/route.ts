import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  try {
    const db = new Database(path.join(process.cwd(), 'courtmate.db'), { readonly: true });
    const userRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const postRow = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'open'").get() as { count: number };
    const tournamentRow = db.prepare('SELECT COUNT(*) as count FROM tournaments').get() as { count: number };
    db.close();

    return NextResponse.json({
      totalUsers: userRow?.count || 0,
      activeMatches: postRow?.count || 0,
      totalTournaments: tournamentRow?.count || 0,
    });
  } catch (e) {
    console.error('Stats API error:', e);
    return NextResponse.json({ totalUsers: 0, activeMatches: 0, totalTournaments: 0 });
  }
}
