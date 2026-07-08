import { router } from '../trpc';
import { postRouter } from './post';
import { matchRouter } from './match';
import { adminRouter } from './admin';
import { authRouter } from './auth';
import { leaderboardRouter } from './leaderboard';
import { tournamentRouter } from './tournament';

export const appRouter = router({
  post: postRouter,
  match: matchRouter,
  admin: adminRouter,
  auth: authRouter,
  leaderboard: leaderboardRouter,
  tournament: tournamentRouter,
});

export type AppRouter = typeof appRouter;
