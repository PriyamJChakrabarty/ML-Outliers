import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, problems, userProgress } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * LOCALSTORAGE MIGRATION API
 *
 * Migrates localStorage completions to database
 * One-time operation per user during rollout
 *
 * SCALABILITY: Batch processing, skip duplicates
 * DATA INTEGRITY: No overwrites, preserves existing data
 * IDEMPOTENT: Safe to run multiple times
 */

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { completedSlugs } = await request.json();

    if (!Array.isArray(completedSlugs) || completedSlugs.length === 0) {
      return Response.json({ success: true, migrated: 0 });
    }

    // Get user UUID from clerk_id
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

    if (!user) {
      return Response.json({ error: 'User not found in database' }, { status: 404 });
    }

    let migratedCount = 0;
    let totalPoints = 0;

    for (const slug of completedSlugs) {
      try {
        // Get problem ID and points
        const [problem] = await db
          .select()
          .from(problems)
          .where(eq(problems.slug, slug))
          .limit(1);

        if (!problem) {
          console.warn(`Problem not found: ${slug}`);
          continue;
        }

        // Check if already exists in database
        const existing = await db
          .select()
          .from(userProgress)
          .where(and(eq(userProgress.userId, user.id), eq(userProgress.problemId, problem.id)))
          .limit(1);

        if (existing.length > 0) {
          console.log(`Skipping duplicate: ${slug}`);
          continue; // Skip if already in database
        }

        // Create progress record (migration: no time data, just completion)
        await db.insert(userProgress).values({
          userId: user.id,
          problemId: problem.id,
          status: 'completed',
          attemptsCount: 1,
          completedAt: new Date(),
          pointsEarned: problem.basePoints,
        });

        totalPoints += problem.basePoints;
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate ${slug}:`, error);
      }
    }

    // Update user total points
    if (totalPoints > 0) {
      await db
        .update(users)
        .set({
          totalPoints: sql`${users.totalPoints} + ${totalPoints}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    return Response.json({ success: true, migrated: migratedCount });
  } catch (error) {
    console.error('Migration API error:', error);
    return Response.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
