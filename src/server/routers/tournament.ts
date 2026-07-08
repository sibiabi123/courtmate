import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure, ok, fail } from '../trpc';
import { tournaments, users } from '../db/schema';

export const tournamentRouter = router({
  list: publicProcedure
    .input(z.object({
      status: z.enum(['upcoming', 'ongoing', 'completed']).optional(),
      sport: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = [];
        if (input.status) conditions.push(eq(tournaments.status, input.status));
        if (input.sport) conditions.push(eq(tournaments.sport, input.sport));

        const all = ctx.db.select()
          .from(tournaments)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(tournaments.createdAt))
          .all();

        return ok(all);
      } catch (e) {
        console.error('List tournaments error:', e);
        return fail((e as Error).message);
      }
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      sport: z.string(),
      maxParticipants: z.number().min(4).max(64).default(16),
      stakes: z.number().min(0).default(0),
      prize: z.number().min(0).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        ctx.db.insert(tournaments).values({
          id,
          name: input.name,
          sport: input.sport,
          organizerId: ctx.userId!,
          maxParticipants: input.maxParticipants,
          prize: input.prize,
          status: 'upcoming',
          scheduledAt: now,
          createdAt: now,
        }).run();

        const t = ctx.db.select().from(tournaments).where(eq(tournaments.id, id)).get();
        return ok(t);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const t = ctx.db.select().from(tournaments).where(eq(tournaments.id, input.id)).get();
        if (!t) return fail('Tournament not found');
        return ok(t);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),
});
