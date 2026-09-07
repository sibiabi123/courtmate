import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import { getActiveCampusConfig } from '@/lib/campus-config';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const campusConfig = getActiveCampusConfig();
    const hostels = campusConfig.hostels || [];

    // Query user counts & ratings per hostel
    let userStats: any[] = [];
    try {
      userStats = await db.query(`
        SELECT 
          hostel,
          COUNT(*) as residentCount,
          SUM(COALESCE(games_played, 0)) as totalGames,
          SUM(COALESCE(wins, 0)) as totalWins
        FROM users
        WHERE hostel IS NOT NULL AND hostel != ''
        GROUP BY hostel
      `);
    } catch {
      userStats = [];
    }

    const statsMap: Record<string, { residentCount: number; totalGames: number; totalWins: number }> = {};
    for (const stat of userStats) {
      if (stat.hostel) {
        statsMap[stat.hostel] = {
          residentCount: Number(stat.residentCount || 0),
          totalGames: Number(stat.totalGames || 0),
          totalWins: Number(stat.totalWins || 0),
        };
      }
    }

    // Build complete leaderboard across all known campus hostel blocks
    const standings = hostels.map(h => {
      const stats = statsMap[h.name] || { residentCount: 0, totalGames: 0, totalWins: 0 };
      const category = h.gender === 'ladies' ? "Ladies'" : h.gender === 'mens' ? "Men's" : 'Campus';
      // Points calculation: participation (15 pts per game) + wins (25 pts) + active athletes (10 pts)
      const points = (stats.residentCount * 10) + (stats.totalGames * 15) + (stats.totalWins * 25);

      return {
        id: h.id,
        hostel: h.name,
        category,
        points: Math.max(120, points), // Base floor so blocks start active
        matchesWon: stats.totalWins,
        activeAthletes: stats.residentCount,
        topSport: h.gender === 'ladies' ? 'Badminton & Basketball' : 'Cricket & Football',
      };
    });

    // Sort descending by points
    standings.sort((a, b) => b.points - a.points);

    // Assign dynamic ranks
    const rankedStandings = standings.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    return NextResponse.json({
      success: true,
      standings: rankedStandings,
      campus: campusConfig.shortName,
      totalHostels: rankedStandings.length,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
