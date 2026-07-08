import { z } from 'zod';
import { eq, desc, avg, count, and } from 'drizzle-orm';
import { router, publicProcedure, ok, fail } from '../trpc';
import { users } from '../db/schema';

export const leaderboardRouter = router({
  global: publicProcedure
    .input(z.object({
      hostel: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      try {
        let rows;
        if (input.hostel && input.hostel !== 'All Hostels') {
          rows = ctx.db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              avatar: users.avatar,
              hostel: users.hostel,
              coins: users.coins,
              glickoRating: users.glickoRating,
            })
            .from(users)
            .where(and(eq(users.isBanned, false), eq(users.hostel, input.hostel)))
            .orderBy(desc(users.glickoRating))
            .limit(input.limit)
            .all();
        } else {
          rows = ctx.db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              avatar: users.avatar,
              hostel: users.hostel,
              coins: users.coins,
              glickoRating: users.glickoRating,
            })
            .from(users)
            .where(eq(users.isBanned, false))
            .orderBy(desc(users.glickoRating))
            .limit(input.limit)
            .all();
        }

        const mappedRows = rows.map(r => ({
          ...r,
          glickoRating: { rating: r.glickoRating || 1500 }
        }));

        return ok(mappedRows);
      } catch (e) {
        console.error('Leaderboard global error:', e);
        return fail((e as Error).message);
      }
    }),

  hostelRankings: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const result = ctx.db
          .select({
            hostel: users.hostel,
            avgRating: avg(users.glickoRating),
            memberCount: count(users.id),
          })
          .from(users)
          .where(eq(users.isBanned, false))
          .groupBy(users.hostel)
          .orderBy(desc(avg(users.glickoRating)))
          .all();
        return ok(result);
      } catch (e) {
        console.error('Leaderboard hostelRankings error:', e);
        return fail((e as Error).message);
      }
    }),
});
