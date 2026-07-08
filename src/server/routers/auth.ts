import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure, ok, fail } from '../trpc';
import { users } from '../db/schema';
import { hashPassword, verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2).max(64),
      email: z.string().email().refine(
        (e) => e.endsWith('@vitstudent.ac.in') || e.endsWith('@vit.ac.in'),
        { message: 'Must be a VIT email (@vitstudent.ac.in or @vit.ac.in)' }
      ),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      hostel: z.string().default('Day Scholar'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await ctx.db.query.users.findFirst({
          where: eq(users.email, input.email),
        });
        if (existing) return fail('An account with this email already exists.');

        const hash = await hashPassword(input.password);
        const avatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(input.email)}`;

        const [user] = await ctx.db.insert(users).values({
          name: input.name,
          email: input.email,
          hash,
          hostel: input.hostel,
          avatar,
          role: 'student',
          coins: 100, // Welcome bonus
          glickoRating: 1500,
          glickoRd: 350,
          glickoVol: 0.06,
        }).returning();


        const token = signToken({ userId: user.id, role: user.role, name: user.name, email: user.email });
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });

        const { hash: _, ...safeUser } = user;
        return ok(safeUser);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.email, input.email),
        });
        if (!user) return fail('No account found with this email.');
        if (user.isBanned) return fail('Your account has been suspended. Contact admin.');

        const valid = await verifyPassword(input.password, user.hash);
        if (!valid) return fail('Incorrect password.');

        const token = signToken({ userId: user.id, role: user.role, name: user.name, email: user.email });
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });

        const { hash: _, ...safeUser } = user;
        return ok(safeUser);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  logout: publicProcedure
    .mutation(async () => {
      try {
        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME);
        return ok({ loggedOut: true });
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, ctx.userId!),
        });
        if (!user) return fail('User not found.');
        const { hash: _, ...safeUser } = user;
        return ok(safeUser);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(64).optional(),
      hostel: z.string().optional(),
      avatar: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [updated] = await ctx.db.update(users)
          .set({ ...input })
          .where(eq(users.id, ctx.userId!))
          .returning();
        const { hash: _, ...safeUser } = updated;
        return ok(safeUser);
      } catch (e) {
        return fail((e as Error).message);
      }
    }),
});
