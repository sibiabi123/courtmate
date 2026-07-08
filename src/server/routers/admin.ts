import { z } from 'zod';
import { eq, desc, count } from 'drizzle-orm';
import { router, adminProcedure, protectedProcedure, publicProcedure, ok, fail } from '../trpc';
import { users, posts, tournaments, reports, auditLogs, matches } from '../db/schema';

export const adminRouter = router({
  leaderboard: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const dbUsers = ctx.db
          .select({
            userId: users.id,
            name: users.name,
            rating: users.glickoRating,
            hostel: users.hostel,
            avatar: users.avatar,
            coins: users.coins,
          })
          .from(users)
          .where(eq(users.isBanned, false))
          .orderBy(desc(users.glickoRating))
          .limit(input.limit)
          .all();

        return ok(dbUsers);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  dashboardStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const [userCount] = ctx.db.select({ count: count() }).from(users).all();
        const [postCount] = ctx.db.select({ count: count() }).from(posts).all();
        const [matchCount] = ctx.db.select({ count: count() }).from(matches).all();
        const [reportCount] = ctx.db.select({ count: count() }).from(reports).where(eq(reports.status, 'pending')).all();

        return ok({
          totalUsers: userCount?.count || 0,
          totalPosts: postCount?.count || 0,
          totalMatches: matchCount?.count || 0,
          pendingReports: reportCount?.count || 0,
        });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  auditLogs: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(500).default(100),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const logs = ctx.db.select()
          .from(auditLogs)
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit)
          .all();
        return ok(logs);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  toggleBan: adminProcedure
    .input(z.object({ userId: z.string(), ban: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.db.update(users)
          .set({ isBanned: input.ban })
          .where(eq(users.id, input.userId))
          .run();

        ctx.db.insert(auditLogs).values({
          id: crypto.randomUUID(),
          adminId: ctx.userId!,
          action: input.ban ? 'ban_user' : 'unban_user',
          targetType: 'user',
          targetId: input.userId,
          detail: `User ban toggled to ${input.ban}`,
          createdAt: new Date().toISOString(),
        }).run();

        return ok({ banned: input.ban });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  deletePost: adminProcedure
    .input(z.object({ postId: z.string(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.db.delete(posts).where(eq(posts.id, input.postId)).run();

        ctx.db.insert(auditLogs).values({
          id: crypto.randomUUID(),
          adminId: ctx.userId!,
          action: 'delete_post',
          targetType: 'post',
          targetId: input.postId,
          detail: `Reason: ${input.reason}`,
          createdAt: new Date().toISOString(),
        }).run();

        return ok({ deleted: true });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  resolveReport: adminProcedure
    .input(z.object({
      reportId: z.string(),
      status: z.enum(['resolved', 'dismissed']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.db.update(reports)
          .set({ status: input.status })
          .where(eq(reports.id, input.reportId))
          .run();

        ctx.db.insert(auditLogs).values({
          id: crypto.randomUUID(),
          adminId: ctx.userId!,
          action: `report_${input.status}`,
          targetType: 'report',
          targetId: input.reportId,
          detail: `Report resolved as ${input.status}`,
          createdAt: new Date().toISOString(),
        }).run();

        return ok({ resolved: true });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),
});
