import { auth } from '@clerk/nextjs/server';
import { createSubmission } from '@/db/queries/submissions';

/**
 * Answer Checker API
 *
 * Simple exact match / alternatives checking for MCQ-style problems
 * No ML model needed - fast and serverless-friendly
 */

/**
 * Check if answer is correct
 */
function checkAnswer(userAnswer, expertAnswer, alternatives) {
  const userLower = userAnswer.toLowerCase().trim();
  const expertLower = expertAnswer.toLowerCase().trim();

  // Strategy 1: Exact match
  if (userLower === expertLower) {
    return { isCorrect: true, method: 'exact' };
  }

  // Strategy 2: Check alternatives (if provided)
  if (alternatives && alternatives.length > 0) {
    const isInAlternatives = alternatives.some(
      alt => userLower === alt.toLowerCase().trim()
    );
    if (isInAlternatives) {
      return { isCorrect: true, method: 'alternative' };
    }
  }

  // No match
  return { isCorrect: false, method: 'no_match' };
}

export async function POST(request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      problemId,
      userAnswer,
      expertAnswer,
      alternatives = [],
      submissionTimeSeconds,
    } = body;

    // Validation
    if (!problemId || !userAnswer || !expertAnswer) {
      return Response.json(
        {
          error: 'Missing required fields: problemId, userAnswer, expertAnswer',
        },
        { status: 400 }
      );
    }

    if (userAnswer.trim().length === 0) {
      return Response.json(
        {
          error: 'Answer cannot be empty',
        },
        { status: 400 }
      );
    }

    // Check answer
    const result = checkAnswer(userAnswer, expertAnswer, alternatives);
    const isCorrect = result.isCorrect;
    const method = result.method;

    // Calculate points
    const basePoints = 100;
    const pointsAwarded = isCorrect ? basePoints : 0;

    // Save submission to database
    try {
      await createSubmission({
        userId,
        problemSlug: problemId,
        userAnswer,
        isCorrect,
        submissionTimeSeconds,
        pointsAwarded,
      });
    } catch (dbError) {
      console.error('Failed to save submission to database:', dbError);
      // Continue anyway - don't fail the request if DB save fails
    }

    return Response.json({
      isCorrect,
      method,
      problemId,
      pointsAwarded,
    });

  } catch (error) {
    console.error('Error checking answer:', error);

    return Response.json(
      {
        error: 'Failed to process answer',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
