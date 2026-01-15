import { db } from '@/db';
import { users, userProgress } from '@/db/schema';
import { sql, eq, desc, and, gte } from 'drizzle-orm';
import { startOfMonth, startOfWeek } from 'date-fns';

/**
 * LEADERBOARD QUERIES
 *
 * Handles ranking and leaderboard generation
 * Ranking algorithm: Problems completed DESC → Fastest avg time ASC
 *
 * SCALABILITY: Uses aggregations for efficient queries
 * PERFORMANCE: Proper indexes on leaderboard columns
 * FLEXIBILITY: Time-based filters (all-time, monthly, weekly)
 */

export async function getGlobalLeaderboard(limit = 100) {
  const result = await db
    .select({
      userId: users.id,
      clerkId: users.clerkId,
      username: users.username,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      totalPoints: users.totalPoints,
      currentStreak: users.currentStreak,
      exercisesCompleted: sql<number>`count(distinct case when ${userProgress.status} = 'completed' then ${userProgress.problemId} end)`.as('exercises_completed'),
      averageFastestTime: sql<number>`avg(${userProgress.fastestTimeSeconds})`.as('avg_fastest_time'),
    })
    .from(users)
    .leftJoin(userProgress, eq(users.id, userProgress.userId))
    .groupBy(users.id)
    .orderBy(
      desc(sql`count(distinct case when ${userProgress.status} = 'completed' then ${userProgress.problemId} end)`),
      sql`avg(${userProgress.fastestTimeSeconds}) ASC NULLS LAST`
    )
    .limit(limit);

  // Add rank (1-indexed)
  return result.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

export async function getMonthlyLeaderboard(limit = 100) {
  const monthStart = startOfMonth(new Date());

  const result = await db
    .select({
      userId: users.id,
      clerkId: users.clerkId,
      username: users.username,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      currentStreak: users.currentStreak,
      exercisesCompletedThisMonth: sql<number>`count(distinct ${userProgress.problemId})`.as('exercises_this_month'),
      pointsThisMonth: sql<number>`sum(${userProgress.pointsEarned})`.as('points_this_month'),
      averageFastestTime: sql<number>`avg(${userProgress.fastestTimeSeconds})`.as('avg_fastest_time'),
    })
    .from(users)
    .leftJoin(
      userProgress,
      and(
        eq(users.id, userProgress.userId),
        eq(userProgress.status, 'completed'),
        gte(userProgress.completedAt, monthStart)
      )
    )
    .groupBy(users.id)
    .orderBy(
      desc(sql`count(distinct ${userProgress.problemId})`),
      sql`avg(${userProgress.fastestTimeSeconds}) ASC NULLS LAST`
    )
    .limit(limit);

  return result.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

export async function getWeeklyLeaderboard(limit = 100) {
  const weekStart = startOfWeek(new Date());

  const result = await db
    .select({
      userId: users.id,
      clerkId: users.clerkId,
      username: users.username,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      currentStreak: users.currentStreak,
      exercisesCompletedThisWeek: sql<number>`count(distinct ${userProgress.problemId})`.as('exercises_this_week'),
      pointsThisWeek: sql<number>`sum(${userProgress.pointsEarned})`.as('points_this_week'),
      averageFastestTime: sql<number>`avg(${userProgress.fastestTimeSeconds})`.as('avg_fastest_time'),
    })
    .from(users)
    .leftJoin(
      userProgress,
      and(
        eq(users.id, userProgress.userId),
        eq(userProgress.status, 'completed'),
        gte(userProgress.completedAt, weekStart)
      )
    )
    .groupBy(users.id)
    .orderBy(
      desc(sql`count(distinct ${userProgress.problemId})`),
      sql`avg(${userProgress.fastestTimeSeconds}) ASC NULLS LAST`
    )
    .limit(limit);

  return result.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

export async function getUserRank(clerkId: string) {
  // Get global leaderboard (limited to reasonable size)
  const leaderboard = await getGlobalLeaderboard(1000);

  // Find user in leaderboard
  const userEntry = leaderboard.find((entry) => entry.clerkId === clerkId);

  return userEntry || null;
}
