import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

/**
 * UPDATE USERNAME API ROUTE
 *
 * Allows authenticated users to change their username
 * Enforces uniqueness constraint at application level
 *
 * SECURITY: Validates user authentication via Clerk
 * SCALABILITY: Uses database unique constraint + app-level validation
 * INDUSTRY STANDARD: Rate limiting should be added via middleware in production
 *
 * Returns:
 * - status: 'success' | 'username_taken' | 'invalid_username' | 'not_authenticated' | 'error'
 */

// Username validation constants
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'system', 'support',
  'help', 'moderator', 'mod', 'staff', 'official',
  'mloutliers', 'ml_outliers', 'api', 'null', 'undefined',
];

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return Response.json({
        status: 'not_authenticated',
        message: 'You must be signed in to change your username',
      }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({
        status: 'error',
        message: 'Invalid request body',
      }, { status: 400 });
    }

    const { username } = body;

    // Validate username format
    if (!username || typeof username !== 'string') {
      return Response.json({
        status: 'invalid_username',
        message: 'Username is required',
      }, { status: 400 });
    }

    const trimmedUsername = username.trim();

    // Length validation
    if (trimmedUsername.length < USERNAME_MIN_LENGTH) {
      return Response.json({
        status: 'invalid_username',
        message: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
      }, { status: 400 });
    }

    if (trimmedUsername.length > USERNAME_MAX_LENGTH) {
      return Response.json({
        status: 'invalid_username',
        message: `Username must be ${USERNAME_MAX_LENGTH} characters or less`,
      }, { status: 400 });
    }

    // Pattern validation
    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      return Response.json({
        status: 'invalid_username',
        message: 'Username can only contain letters, numbers, and underscores',
      }, { status: 400 });
    }

    // Reserved username check
    if (RESERVED_USERNAMES.includes(trimmedUsername.toLowerCase())) {
      return Response.json({
        status: 'username_taken',
        message: 'This username is reserved and cannot be used',
      }, { status: 400 });
    }

    // Get current user
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (currentUser.length === 0) {
      return Response.json({
        status: 'error',
        message: 'User not found in database',
      }, { status: 404 });
    }

    // Check if username is same as current
    if (currentUser[0].username === trimmedUsername) {
      return Response.json({
        status: 'invalid_username',
        message: 'This is already your current username',
      }, { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUser = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, trimmedUsername),
          ne(users.clerkId, clerkId)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      return Response.json({
        status: 'username_taken',
        message: 'This username is already taken. Please choose another.',
      }, { status: 409 });
    }

    // Update username
    await db
      .update(users)
      .set({
        username: trimmedUsername,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkId));

    console.log(`[UPDATE-USERNAME] User ${clerkId} changed username to: ${trimmedUsername}`);

    return Response.json({
      status: 'success',
      message: 'Username updated successfully',
      username: trimmedUsername,
    });
  } catch (error) {
    console.error('Update username API error:', error);
    return Response.json({
      status: 'error',
      message: 'Failed to update username',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
