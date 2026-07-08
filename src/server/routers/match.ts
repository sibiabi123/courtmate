import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { router, protectedProcedure, ok, fail } from '../trpc';
import { posts, matches, postParticipants, users } from '../db/schema';

export const matchRouter = router({
  checkIn: protectedProcedure
    .input(z.object({
      postId: z.string(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = ctx.db.select().from(posts).where(eq(posts.id, input.postId)).get();
        if (!post) return fail('Post not found');

        // Mark post as live
        ctx.db.update(posts)
          .set({ status: 'live' })
          .where(eq(posts.id, input.postId))
          .run();

        return ok({ checkedIn: true });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  complete: protectedProcedure
    .input(z.object({
      postId: z.string(),
      winnerIds: z.array(z.string()),
      loserIds: z.array(z.string()),
      scores: z.record(z.string(), z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = ctx.db.select().from(posts).where(eq(posts.id, input.postId)).get();
        if (!post) return fail('Post not found');

        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        // Insert match record
        ctx.db.insert(matches).values({
          id,
          postId: input.postId,
          result: input.scores ? JSON.stringify(input.scores) : 'Completed',
          winnerIds: JSON.stringify(input.winnerIds),
          completedAt: now,
          createdAt: now,
        }).run();

        // Mark post as completed
        ctx.db.update(posts)
          .set({ status: 'completed' })
          .where(eq(posts.id, input.postId))
          .run();

        // Award ELO/coins to winners
        for (const wId of input.winnerIds) {
          const user = ctx.db.select().from(users).where(eq(users.id, wId)).get();
          if (user) {
            ctx.db.update(users)
              .set({
                glickoRating: (user.glickoRating || 1500) + 15,
                coins: (user.coins || 0) + 15,
              })
              .where(eq(users.id, wId))
              .run();
          }
        }

        // Penalty to losers ELO, award default participation coins
        for (const lId of input.loserIds) {
          const user = ctx.db.select().from(users).where(eq(users.id, lId)).get();
          if (user) {
            ctx.db.update(users)
              .set({
                glickoRating: Math.max(100, (user.glickoRating || 1500) - 10),
                coins: (user.coins || 0) + 5,
              })
              .where(eq(users.id, lId))
              .run();
          }
        }

        return ok({ success: true });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),
});
