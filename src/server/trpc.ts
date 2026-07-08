import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import { db } from './db';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export interface TRPCContext {
  db: typeof db;
  req: NextRequest;
  userId: string | null;
  userRole: string | null;
  userName: string | null;
}

export async function createTRPCContext({ req }: { req: NextRequest }): Promise<TRPCContext> {
  const authHeader = req.headers.get('authorization');
  const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
  const token = authHeader?.replace('Bearer ', '') ?? sessionCookie ?? null;

  let userId: string | null = null;
  let userRole: string | null = null;
  let userName: string | null = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId;
      userRole = payload.role;
      userName = payload.name;
    }
  }

  return { db, req, userId, userRole, userName };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in.' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (ctx.userRole !== 'super_admin' && ctx.userRole !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required.' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAuth);
export const adminProcedure = t.procedure.use(enforceAdmin);

export function ok<T>(data: T) { return { success: true as const, data }; }
export function fail(error: string) { return { success: false as const, error }; }
