import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkUsernameProfanity, validateStructuredUsername, generateStructuredUsername } from '@/lib/geminiProfanityCheck';

/**
 * USERNAME CHECK API
 *
 * Checks if a username contains profanity using Gemini API
 * Falls back to structured username if API fails
 *
 * OBSCENE ATTEMPT TRACKING:
 * - Tracks obscene attempts per user in database (refresh-proof)
 * - After 3 obscene attempts, forces fallback to roll number format
 * - Counter resets when username is successfully changed
 */

const MAX_OBSCENE_ATTEMPTS = 3;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, isStructured, prefix, year, number } = body;

    // Get auth context to track obscene attempts per user
    const { userId: clerkId } = await auth();

    // Handle structured username (fallback mode)
    if (isStructured) {
      const validationError = validateStructuredUsername(prefix, year, number);

      if (validationError) {
        return Response.json({
          status: 'invalid',
          message: validationError,
        }, { status: 400 });
      }

      const structuredUsername = generateStructuredUsername(prefix, year, number);

      return Response.json({
        status: 'valid',
        username: structuredUsername,
        isStructured: true,
      });
    }

    // Regular username check
    if (!username || typeof username !== 'string') {
      return Response.json({
        status: 'invalid',
        message: 'Username is required',
      }, { status: 400 });
    }

    const trimmedUsername = username.trim();

    // Basic validation
    if (trimmedUsername.length < 3) {
      return Response.json({
        status: 'invalid',
        message: 'Username must be at least 3 characters',
      }, { status: 400 });
    }

    if (trimmedUsername.length > 20) {
      return Response.json({
        status: 'invalid',
        message: 'Username must be 20 characters or less',
      }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return Response.json({
        status: 'invalid',
        message: 'Username can only contain letters, numbers, and underscores',
      }, { status: 400 });
    }

    // Check if user is authenticated and get their obscene attempts count
    if (clerkId) {
      const existingUser = await db
        .select({ obsceneAttempts: users.obsceneAttempts })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (existingUser.length > 0) {
        const currentAttempts = existingUser[0].obsceneAttempts || 0;

        // If already at or over max attempts, force fallback immediately
        if (currentAttempts >= MAX_OBSCENE_ATTEMPTS) {
          console.log(`[check-username] User ${clerkId} has ${currentAttempts} obscene attempts - forcing fallback`);
          return Response.json({
            status: 'force_fallback',
            message: 'Too many inappropriate username attempts. Please use the structured format.',
            obsceneAttempts: currentAttempts,
          });
        }
      }
    }

    // Check for profanity using Gemini
    console.log(`[check-username] Checking: "${trimmedUsername}"`);
    const profanityResult = await checkUsernameProfanity(trimmedUsername);
    console.log(`[check-username] Result:`, profanityResult);

    if (profanityResult.fallbackRequired) {
      // API failed - tell frontend to show structured input
      console.log(`[check-username] Fallback required - Gemini API failed`);
      return Response.json({
        status: 'fallback_required',
        message: 'Please use the structured username format',
      });
    }

    if (profanityResult.isObscene) {
      console.log(`[check-username] Username is OBSCENE`);

      // If user is authenticated, increment their obscene attempts counter
      if (clerkId) {
        const existingUser = await db
          .select({ obsceneAttempts: users.obsceneAttempts })
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (existingUser.length > 0) {
          const newAttempts = (existingUser[0].obsceneAttempts || 0) + 1;

          await db
            .update(users)
            .set({
              obsceneAttempts: newAttempts,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkId, clerkId));

          console.log(`[check-username] User ${clerkId} obscene attempts updated to: ${newAttempts}`);

          // If this was the 3rd attempt, return force_fallback
          if (newAttempts >= MAX_OBSCENE_ATTEMPTS) {
            return Response.json({
              status: 'force_fallback',
              message: 'Too many inappropriate username attempts. Please use the structured format.',
              obsceneAttempts: newAttempts,
            });
          }

          // Return obscene with remaining attempts info
          return Response.json({
            status: 'obscene',
            message: 'Please choose a different username',
            obsceneAttempts: newAttempts,
            remainingAttempts: MAX_OBSCENE_ATTEMPTS - newAttempts,
          }, { status: 400 });
        }
      }

      // User not found or not authenticated - just return obscene
      return Response.json({
        status: 'obscene',
        message: 'Please choose a different username',
      }, { status: 400 });
    }

    // Username is clean
    console.log(`[check-username] Username is CLEAN`);
    return Response.json({
      status: 'valid',
      username: trimmedUsername,
    });
  } catch (error) {
    console.error('Check username API error:', error);
    return Response.json({
      status: 'error',
      message: 'Failed to check username',
    }, { status: 500 });
  }
}
