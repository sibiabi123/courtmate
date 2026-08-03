import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

// GET /api/elo-history?userId=xxx  - returns ELO chart data
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ history: [] });

    const db = await getDb();
    const rows = await db.query(
      `SELECT rating, delta, reason, recorded_at FROM elo_history WHERE user_id = ? ORDER BY recorded_at ASC LIMIT 30`,
      [userId]
    );
    return NextResponse.json({ success: true, history: rows });
  } catch (e) {
    return NextResponse.json({ success: false, history: [], error: String(e) });
  }
}
