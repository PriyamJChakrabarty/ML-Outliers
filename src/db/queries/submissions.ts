import { db } from '@/db';
import { submissions, userProgress, users, problems } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * SUBMISSION QUERIES
 *
 * Handles submission tracking and user progress updates
 *
 * SCALABILITY: Efficient queries with proper indexes
 * MODULARITY: Isolated submission logic
 * CONCURRENCY: Handles multiple submissions safely
 */

export async function createSubmission({
  userId,
  problemSlug,
  userAnswer,
  isCorrect,
  submissionTimeSeconds,
  pointsAwarded,
}: {
  userId: string; // Clerk ID
  problemSlug: string;
  userAnswer: string;
  isCorrect: boolean;
  submissionTimeSeconds?: number;
  pointsAwarded: number;
}) {
  // Get user UUID from clerk_id
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user.length) {
    throw new Error('User not found in database. Please ensure Clerk webhook is configured.');
  }

  // Get problem ID from slug
  const problem = await db
    .select()
    .from(problems)
    .where(eq(problems.slug, problemSlug))
    .limit(1);

  if (!problem.length) {
    throw new Error(`Problem not found: ${problemSlug}. Please run npm run db:seed`);
  }

  const userUuid = user[0].id;
  const problemId = problem[0].id;

  // Insert submission
  const [submission] = await db
    .insert(submissions)
    .values({
      userId: userUuid,
      problemId,
      userAnswer,
      isCorrect,
      submissionTimeSeconds,
      pointsAwarded,
    })
    .returning();

  // Update user progress
  if (isCorrect) {
    await updateUserProgressOnCorrectSubmission({
      userUuid,
      problemId,
      submissionTimeSeconds,
      pointsAwarded,
    });
  } else {
    // Increment attempt count even on failure
    await incrementAttemptCount(userUuid, problemId);
  }

  return submission;
}

async function updateUserProgressOnCorrectSubmission({
  userUuid,
  problemId,
  submissionTimeSeconds,
  pointsAwarded,
}: {
  userUuid: string;
  problemId: number;
  submissionTimeSeconds?: number;
  pointsAwarded: number;
}) {
  // Check if progress record exists
  const existing = await db
    .select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, userUuid), eq(userProgress.problemId, problemId)))
    .limit(1);

  if (!existing.length) {
    // Create new progress record
    await db.insert(userProgress).values({
      userId: userUuid,
      problemId,
      status: 'completed',
      attemptsCount: 1,
      firstAttemptAt: new Date(),
      completedAt: new Date(),
      fastestTimeSeconds: submissionTimeSeconds || null,
      pointsEarned: pointsAwarded,
    });

    // Award points to user (first completion)
    await db
      .update(users)
      .set({
        totalPoints: sql`${users.totalPoints} + ${pointsAwarded}`,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userUuid));
  } else {
    // Update existing record
    const current = existing[0];

    // Only update fastest time if this submission is faster
    const newFastestTime =
      submissionTimeSeconds && current.fastestTimeSeconds
        ? Math.min(submissionTimeSeconds, current.fastestTimeSeconds)
        : submissionTimeSeconds || current.fastestTimeSeconds;

    await db
      .update(userProgress)
      .set({
        status: 'completed',
        attemptsCount: current.attemptsCount + 1,
        completedAt: new Date(),
        fastestTimeSeconds: newFastestTime,
        // Don't update pointsEarned - keep the original points from first completion
        updatedAt: new Date(),
      })
      .where(eq(userProgress.id, current.id));

    // Update last activity date (but don't award more points for re-solving)
    await db
      .update(users)
      .set({
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userUuid));
  }
}

async function incrementAttemptCount(userUuid: string, problemId: number) {
  const existing = await db
    .select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, userUuid), eq(userProgress.problemId, problemId)))
    .limit(1);

  if (!existing.length) {
    // First attempt (incorrect)
    await db.insert(userProgress).values({
      userId: userUuid,
      problemId,
      status: 'in_progress',
      attemptsCount: 1,
      firstAttemptAt: new Date(),
    });
  } else {
    // Increment attempt count
    await db
      .update(userProgress)
      .set({
        status: 'in_progress',
        attemptsCount: existing[0].attemptsCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.id, existing[0].id));
  }

  // Update last activity date
  await db
    .update(users)
    .set({
      lastActivityDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userUuid));
}

/**
 * Mark a problem as complete regardless of answer correctness
 * Used when user clicks "Continue Learning" after any answer
 * FULL POINTS are awarded for completion (same as correct answer)
 */
export async function markProblemComplete({
  userId,
  problemSlug,
}: {
  userId: string; // Clerk ID
  problemSlug: string;
}) {
  // Get user UUID from clerk_id
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user.length) {
    throw new Error('User not found in database.');
  }

  // Get problem ID and basePoints from slug
  const problem = await db
    .select()
    .from(problems)
    .where(eq(problems.slug, problemSlug))
    .limit(1);

  if (!problem.length) {
    throw new Error(`Problem not found: ${problemSlug}`);
  }

  const userUuid = user[0].id;
  const problemId = problem[0].id;
  const pointsToAward = problem[0].basePoints || 100; // Default 100 if not set

  // Check if progress record exists
  const existing = await db
    .select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, userUuid), eq(userProgress.problemId, problemId)))
    .limit(1);

  if (!existing.length) {
    // Create new progress record as completed with full points
    await db.insert(userProgress).values({
      userId: userUuid,
      problemId,
      status: 'completed',
      attemptsCount: 1,
      completedAt: new Date(),
      pointsEarned: pointsToAward,
    });

    // Award points to user (first completion)
    await db
      .update(users)
      .set({
        totalPoints: sql`${users.totalPoints} + ${pointsToAward}`,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userUuid));
  } else if (existing[0].status !== 'completed') {
    // Not yet completed - mark complete and award points
    await db
      .update(userProgress)
      .set({
        status: 'completed',
        completedAt: new Date(),
        pointsEarned: pointsToAward,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.id, existing[0].id));

    // Award points to user
    await db
      .update(users)
      .set({
        totalPoints: sql`${users.totalPoints} + ${pointsToAward}`,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userUuid));
  } else {
    // Already completed - just update activity date, no duplicate points
    await db
      .update(users)
      .set({
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userUuid));
  }

  return { success: true, problemSlug };
}
