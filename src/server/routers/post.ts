import { z } from 'zod';
import { eq, desc, and, ne } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure, ok, fail } from '../trpc';
import { posts, postParticipants, users } from '../db/schema';

export const postRouter = router({
  // ─── Create a new post ─────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      sport: z.string().min(2),
      ground: z.string().min(2),
      maxPlayers: z.number().min(2).max(50).default(10),
      scheduledStart: z.date(),
      geoLocked: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const schedStr = input.scheduledStart.toISOString();

        ctx.db.insert(posts).values({
          id,
          userId: ctx.userId!,
          sport: input.sport,
          ground: input.ground,
          maxPlayers: input.maxPlayers,
          currentPlayers: 1,
          scheduledAt: schedStr,
          status: 'open',
          description: `Action-packed ${input.sport} match at ${input.ground}!`,
          createdAt: now,
        }).run();

        ctx.db.insert(postParticipants).values({
          id: crypto.randomUUID(),
          postId: id,
          userId: ctx.userId!,
          joinedAt: now,
        }).run();

        const post = ctx.db.select().from(posts).where(eq(posts.id, id)).get();
        return ok(post);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  // ─── List posts ────────────────────────────
  list: publicProcedure
    .input(z.object({
      sport: z.string().optional(),
      ground: z.string().optional(),
      status: z.enum(['open', 'full', 'live', 'completed']).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = [];
        if (input.sport) conditions.push(eq(posts.sport, input.sport));
        if (input.ground) conditions.push(eq(posts.ground, input.ground));
        if (input.status) conditions.push(eq(posts.status, input.status));
        else conditions.push(ne(posts.status, 'completed'));

        const rows = ctx.db.select()
          .from(posts)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(posts.createdAt))
          .limit(input.limit)
          .all();

        const postsWithDetails = rows.map(post => {
          const creator = ctx.db.select({
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            hostel: users.hostel
          })
          .from(users)
          .where(eq(users.id, post.userId))
          .get();

          const participants = ctx.db.select({
            id: postParticipants.id,
            userId: postParticipants.userId,
            joinedAt: postParticipants.joinedAt
          })
          .from(postParticipants)
          .where(eq(postParticipants.postId, post.id))
          .all();

          return {
            ...post,
            scheduledStart: post.scheduledAt,
            user: creator,
            responses: participants.map(p => ({
              id: p.id,
              userId: p.userId,
              status: 'joined',
              createdAt: p.joinedAt
            }))
          };
        });

        return ok({ posts: postsWithDetails });
      } catch (e) {
        console.error('List posts error:', e);
        return fail((e as Error).message);
      }
    }),

  // ─── Join a post ────────────────────────────────
  join: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = ctx.db.select().from(posts).where(eq(posts.id, input.postId)).get();
        if (!post) return fail('Post not found');
        if (post.status === 'full' || post.status === 'completed') return fail('Match is no longer open');

        const existing = ctx.db.select()
          .from(postParticipants)
          .where(and(
            eq(postParticipants.postId, input.postId),
            eq(postParticipants.userId, ctx.userId!)
          ))
          .get();

        if (existing) return fail('Already joined this match');

        const now = new Date().toISOString();
        ctx.db.insert(postParticipants).values({
          id: crypto.randomUUID(),
          postId: input.postId,
          userId: ctx.userId!,
          joinedAt: now,
        }).run();

        const newCount = post.currentPlayers + 1;
        const newStatus = newCount >= post.maxPlayers ? 'full' : 'open';

        ctx.db.update(posts)
          .set({ currentPlayers: newCount, status: newStatus })
          .where(eq(posts.id, input.postId))
          .run();

        return ok({ joined: true, newStatus });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),
});
