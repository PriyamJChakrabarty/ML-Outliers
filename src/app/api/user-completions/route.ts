import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, userProgress, problems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * USER COMPLETIONS API
 *
 * Returns the list of completed problem slugs for the authenticated user
 * Used by the home page to display progress
 */

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return Response.json({
        status: 'not_authenticated',
        completedSlugs: [],
      });
    }

    // Get user from clerkId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return Response.json({
        status: 'user_not_found',
        completedSlugs: [],
      });
    }

    // Get completed problem slugs
    const completedProblems = await db
      .select({
        slug: problems.slug,
      })
      .from(userProgress)
      .innerJoin(problems, eq(userProgress.problemId, problems.id))
      .where(
        and(
          eq(userProgress.userId, user.id),
          eq(userProgress.status, 'completed')
        )
      );

    const completedSlugs = completedProblems.map((p) => p.slug);

    return Response.json({
      status: 'success',
      completedSlugs,
      exercisesCompleted: completedSlugs.length,
      totalPoints: user.totalPoints,
    });
  } catch (error) {
    console.error('User completions API error:', error);
    return Response.json(
      {
        status: 'error',
        completedSlugs: [],
        message: 'Failed to fetch completions',
      },
      { status: 500 }
    );
  }
}
