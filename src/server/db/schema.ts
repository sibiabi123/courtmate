import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
} from 'drizzle-orm/sqlite-core';

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  hash: text('hash').notNull(),
  avatar: text('avatar').default(''),
  glickoRating: real('glicko_rating').default(1500),
  glickoRd: real('glicko_rd').default(350),
  glickoVol: real('glicko_vol').default(0.06),
  hostel: text('hostel').notNull().default('Day Scholar'),
  coins: integer('coins').notNull().default(0),
  role: text('role').notNull().default('student'),
  isBanned: integer('is_banned', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Posts ────────────────────────────────────────────────────────────────────
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sport: text('sport').notNull(),
  ground: text('ground').notNull(),
  maxPlayers: integer('max_players').notNull().default(10),
  currentPlayers: integer('current_players').notNull().default(1),
  scheduledAt: text('scheduled_at').notNull(),
  status: text('status').notNull().default('open'), // open | full | live | completed
  description: text('description').default(''),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Post Participants ────────────────────────────────────────────────────────
export const postParticipants = sqliteTable('post_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: text('joined_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Matches ──────────────────────────────────────────────────────────────────
export const matches = sqliteTable('matches', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  result: text('result').default(''),
  winnerIds: text('winner_ids').default('[]'), // JSON string of user IDs
  completedAt: text('completed_at'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Transactions (Coin Wallet) ───────────────────────────────────────────────
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // earn | stake | payout
  note: text('note').default(''),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reporterId: text('reporter_id').references(() => users.id),
  reportedId: text('reported_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'), // pending | resolved | dismissed
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Tournaments ──────────────────────────────────────────────────────────────
export const tournaments = sqliteTable('tournaments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  sport: text('sport').notNull(),
  organizerId: text('organizer_id').notNull().references(() => users.id),
  description: text('description').default(''),
  venue: text('venue').default(''),
  scheduledAt: text('scheduled_at').notNull(),
  prize: integer('prize').notNull().default(0),
  maxParticipants: integer('max_participants').notNull().default(16),
  status: text('status').notNull().default('upcoming'), // upcoming | ongoing | completed
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Tournament Participants ──────────────────────────────────────────────────
export const tournamentParticipants = sqliteTable('tournament_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tournamentId: text('tournament_id').notNull().references(() => tournaments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: text('joined_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: text('admin_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').default(''),
  detail: text('detail').default(''),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── TypeScript Types ─────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Tournament = typeof tournaments.$inferSelect;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
