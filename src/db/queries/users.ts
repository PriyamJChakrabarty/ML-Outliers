import { db } from '@/db';
import { users, userProgress, problems } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * USER PROFILE QUERIES
 *
 * Handles user profile data retrieval
 * Returns user info + completed problems + stats
 *
 * SCALABILITY: Efficient joins for user data
 * MODULARITY: Isolated user profile logic
 * PERFORMANCE: Single query for complete profile
 */

export async function getUserProfile(userId: string) {
  // userId is UUID from URL, not clerkId
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) return null;

  // Get completed problems with details
  const completedProblems = await db
    .select({
      problemId: problems.id,
      slug: problems.slug,
      title: problems.title,
      module: problems.module,
      difficulty: problems.difficulty,
      basePoints: problems.basePoints,
      completedAt: userProgress.completedAt,
      fastestTimeSeconds: userProgress.fastestTimeSeconds,
      attemptsCount: userProgress.attemptsCount,
      pointsEarned: userProgress.pointsEarned,
    })
    .from(userProgress)
    .innerJoin(problems, eq(userProgress.problemId, problems.id))
    .where(and(eq(userProgress.userId, userId), eq(userProgress.status, 'completed')))
    .orderBy(desc(userProgress.completedAt));

  return {
    user,
    completedProblems,
    stats: {
      exercisesCompleted: completedProblems.length,
      totalPoints: user.totalPoints,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    },
  };
}
