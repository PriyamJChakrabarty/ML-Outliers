import { auth } from '@clerk/nextjs/server';
import { markProblemComplete } from '@/db/queries/submissions';

/**
 * MARK COMPLETE API ROUTE
 *
 * Marks a problem as complete when user clicks "Continue Learning"
 * This ensures problems are marked complete regardless of answer correctness
 * No points are awarded for this type of completion (points only for correct answers)
 *
 * POST /api/mark-complete
 * Body: { problemSlug: string }
 *
 * Returns:
 * - status: 'success' | 'not_authenticated' | 'error'
 */

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({
        status: 'not_authenticated',
        message: 'You must be signed in to mark a problem as complete',
      }, { status: 401 });
    }

    const body = await request.json();
    const { problemSlug } = body;

    if (!problemSlug || typeof problemSlug !== 'string') {
      return Response.json({
        status: 'error',
        message: 'Problem slug is required',
      }, { status: 400 });
    }

    await markProblemComplete({
      userId,
      problemSlug,
    });

    console.log(`[MARK-COMPLETE] Problem ${problemSlug} marked complete for user ${userId}`);

    return Response.json({
      status: 'success',
      message: 'Problem marked as complete',
      problemSlug,
    });
  } catch (error) {
    console.error('Mark complete API error:', error);
    return Response.json({
      status: 'error',
      message: 'Failed to mark problem as complete',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
