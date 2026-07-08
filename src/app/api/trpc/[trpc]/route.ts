import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import type { NextRequest } from 'next/server';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError({ error, type, path }) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[tRPC] Error on ${path} (${type}):`, error);
      }
    },
  });

export { handler as GET, handler as POST };
