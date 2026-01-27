import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, roadmapProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * ROADMAP PROGRESS API
 *
 * GET: Returns the roadmap progress for the authenticated user
 * POST: Saves the roadmap progress for the authenticated user
 */

// ML topics count per language
const ML_TOPICS = {
  english: 20,
  hindi: 19,
};

// DL topics count per language
const DL_TOPICS = {
  english: 14,
  hindi: 11,
};

// Calculate topic counts from completions
function calculateStats(completions: Record<string, boolean>, language: string) {
  let mlCompleted = 0;
  let dlCompleted = 0;

  for (const [topicId, isCompleted] of Object.entries(completions)) {
    if (!isCompleted) continue;

    // Check if it matches the current language prefix
    const langPrefix = language === 'english' ? 'en-' : 'hi-';
    if (!topicId.startsWith(langPrefix)) continue;

    if (topicId.includes('-ml-')) {
      mlCompleted++;
    } else if (topicId.includes('-dl-')) {
      dlCompleted++;
    }
  }

  return {
    mlTopicsCompleted: mlCompleted,
    mlTopicsTotal: ML_TOPICS[language as keyof typeof ML_TOPICS] || 20,
    dlTopicsCompleted: dlCompleted,
    dlTopicsTotal: DL_TOPICS[language as keyof typeof DL_TOPICS] || 14,
  };
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return Response.json({
        status: 'not_authenticated',
        completions: {},
        language: 'english',
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
        completions: {},
        language: 'english',
      });
    }

    // Get roadmap progress
    const [progress] = await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      return Response.json({
        status: 'success',
        completions: {},
        language: 'english',
        mlTopicsCompleted: 0,
        mlTopicsTotal: ML_TOPICS.english,
        dlTopicsCompleted: 0,
        dlTopicsTotal: DL_TOPICS.english,
      });
    }

    let completions = {};
    try {
      completions = JSON.parse(progress.completions);
    } catch (e) {
      completions = {};
    }

    return Response.json({
      status: 'success',
      completions,
      language: progress.language,
      mlTopicsCompleted: progress.mlTopicsCompleted,
      mlTopicsTotal: progress.mlTopicsTotal,
      dlTopicsCompleted: progress.dlTopicsCompleted,
      dlTopicsTotal: progress.dlTopicsTotal,
    });
  } catch (error) {
    console.error('Roadmap progress GET error:', error);
    return Response.json(
      {
        status: 'error',
        completions: {},
        language: 'english',
        message: 'Failed to fetch roadmap progress',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return Response.json(
        { status: 'not_authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { completions, language } = body;

    if (!completions || !language) {
      return Response.json(
        { status: 'invalid_request', message: 'Missing completions or language' },
        { status: 400 }
      );
    }

    // Get user from clerkId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return Response.json(
        { status: 'user_not_found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const stats = calculateStats(completions, language);

    // Check if progress record exists
    const [existingProgress] = await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.userId, user.id))
      .limit(1);

    if (existingProgress) {
      // Update existing record
      await db
        .update(roadmapProgress)
        .set({
          completions: JSON.stringify(completions),
          language,
          mlTopicsCompleted: stats.mlTopicsCompleted,
          mlTopicsTotal: stats.mlTopicsTotal,
          dlTopicsCompleted: stats.dlTopicsCompleted,
          dlTopicsTotal: stats.dlTopicsTotal,
          updatedAt: new Date(),
        })
        .where(eq(roadmapProgress.userId, user.id));
    } else {
      // Create new record
      await db.insert(roadmapProgress).values({
        userId: user.id,
        completions: JSON.stringify(completions),
        language,
        mlTopicsCompleted: stats.mlTopicsCompleted,
        mlTopicsTotal: stats.mlTopicsTotal,
        dlTopicsCompleted: stats.dlTopicsCompleted,
        dlTopicsTotal: stats.dlTopicsTotal,
      });
    }

    return Response.json({
      status: 'success',
      ...stats,
    });
  } catch (error) {
    console.error('Roadmap progress POST error:', error);
    return Response.json(
      {
        status: 'error',
        message: 'Failed to save roadmap progress',
      },
      { status: 500 }
    );
  }
}
