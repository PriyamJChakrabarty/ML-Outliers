import { pgTable, uuid, text, integer, timestamp, boolean, serial, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * DATABASE SCHEMA - ML OUTLIERS
 *
 * Designed for scalability to 100+ problems and 10k+ users
 * Uses Neon DB (serverless PostgreSQL) + Drizzle ORM
 *
 * SCALABILITY: Strategic indexes on leaderboard columns
 * MODULARITY: Clean separation between user data, problems, and progress
 * DEPLOYABILITY: Foreign keys with cascade for data integrity
 */

// ============================================
// ENUMS
// ============================================

export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert']);
export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed']);

// ============================================
// TABLES
// ============================================

/**
 * Users Table
 * Synced from Clerk via webhook
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  username: text('username'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),

  // Gamification
  totalPoints: integer('total_points').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActivityDate: timestamp('last_activity_date'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: index('users_clerk_id_idx').on(table.clerkId),
  emailIdx: index('users_email_idx').on(table.email),
  pointsIdx: index('users_total_points_idx').on(table.totalPoints),
}));

/**
 * Problems Table
 * Synced from Registry
 */
export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  module: text('module').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  basePoints: integer('base_points').default(100).notNull(),
  displayOrder: integer('display_order').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('problems_slug_idx').on(table.slug),
  moduleIdx: index('problems_module_idx').on(table.module),
}));

/**
 * Submissions Table
 * Tracks ALL submissions (correct and incorrect)
 */
export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),

  // Submission content
  userAnswer: text('user_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),

  // Performance metrics
  submissionTimeSeconds: integer('submission_time_seconds'),
  pointsAwarded: integer('points_awarded').default(0).notNull(),

  // Metadata
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('submissions_user_id_idx').on(table.userId),
  problemIdIdx: index('submissions_problem_id_idx').on(table.problemId),
  userProblemIdx: index('submissions_user_problem_idx').on(table.userId, table.problemId),
  submittedAtIdx: index('submissions_submitted_at_idx').on(table.submittedAt),
}));

/**
 * User Progress Table
 * One record per user-problem pair
 */
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),

  status: progressStatusEnum('status').default('not_started').notNull(),
  attemptsCount: integer('attempts_count').default(0).notNull(),

  // Timing
  firstAttemptAt: timestamp('first_attempt_at'),
  completedAt: timestamp('completed_at'),
  fastestTimeSeconds: integer('fastest_time_seconds'),

  // Points
  pointsEarned: integer('points_earned').default(0).notNull(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userProblemUnique: uniqueIndex('user_progress_user_problem_idx').on(table.userId, table.problemId),
  userIdIdx: index('user_progress_user_id_idx').on(table.userId),
  statusIdx: index('user_progress_status_idx').on(table.status),
}));

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
  progress: many(userProgress),
}));

export const problemsRelations = relations(problems, ({ many }) => ({
  submissions: many(submissions),
  progress: many(userProgress),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [userProgress.problemId],
    references: [problems.id],
  }),
}));
