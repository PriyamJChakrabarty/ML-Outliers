import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * USER SYNC API ROUTE
 *
 * Ensures the current user exists in the database
 * Called on page load to sync users who may have signed up
 * before the webhook was configured
 *
 * Returns:
 * - status: 'already_registered' | 'newly_registered' | 'needs_username' | 'not_authenticated'
 * - user: user data if authenticated
 */

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return Response.json({
        status: 'not_authenticated',
        message: 'User is not signed in',
      });
    }

    // Check if request body has a username (for setting username)
    let providedUsername: string | null = null;
    try {
      const body = await request.json();
      providedUsername = body.username;
    } catch {
      // No body provided, continue with sync
    }

    // Check if user already exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      // User exists - check if they need to set username
      if (!existingUser[0].username && providedUsername) {
        // Check if username is already taken
        const usernameExists = await db
          .select()
          .from(users)
          .where(eq(users.username, providedUsername))
          .limit(1);

        if (usernameExists.length > 0) {
          return Response.json({
            status: 'username_taken',
            message: 'This username is already taken. Please choose another.',
          });
        }

        // Update the username
        await db
          .update(users)
          .set({ username: providedUsername, updatedAt: new Date() })
          .where(eq(users.clerkId, clerkId));

        console.log(`[SYNC-USER] Username set for user: ${providedUsername}`);

        return Response.json({
          status: 'username_set',
          message: `Username set successfully! Welcome, ${providedUsername}!`,
          user: {
            username: providedUsername,
            email: existingUser[0].email,
          },
        });
      }

      // User exists and has username (or no username provided to set)
      if (!existingUser[0].username) {
        return Response.json({
          status: 'needs_username',
          message: 'Please choose a unique username to complete your registration.',
          user: {
            email: existingUser[0].email,
          },
        });
      }

      return Response.json({
        status: 'already_registered',
        message: 'User already exists in database',
        user: {
          username: existingUser[0].username,
          email: existingUser[0].email,
        },
      });
    }

    // User doesn't exist, get their info from Clerk and add them
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return Response.json({
        status: 'error',
        message: 'Could not fetch user data from Clerk',
      }, { status: 500 });
    }

    // Check if username is provided or if Clerk has one
    const usernameToUse = providedUsername || clerkUser.username || null;

    // If username provided, check if it's taken
    if (usernameToUse) {
      const usernameExists = await db
        .select()
        .from(users)
        .where(eq(users.username, usernameToUse))
        .limit(1);

      if (usernameExists.length > 0 && providedUsername) {
        return Response.json({
          status: 'username_taken',
          message: 'This username is already taken. Please choose another.',
        });
      }
    }

    // Insert new user into database
    await db.insert(users).values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      username: usernameToUse,
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      avatarUrl: clerkUser.imageUrl || null,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
    });

    console.log(`[SYNC-USER] New user registered: ${usernameToUse || clerkUser.emailAddresses[0]?.emailAddress}`);

    // If no username, prompt user to set one
    if (!usernameToUse) {
      return Response.json({
        status: 'needs_username',
        message: 'Please choose a unique username to complete your registration.',
        user: {
          email: clerkUser.emailAddresses[0]?.emailAddress,
        },
      });
    }

    return Response.json({
      status: 'newly_registered',
      message: `Registration successful! Welcome, ${usernameToUse}!`,
      user: {
        username: usernameToUse,
        email: clerkUser.emailAddresses[0]?.emailAddress,
      },
    });
  } catch (error) {
    console.error('Sync user API error:', error);
    return Response.json(
      {
        status: 'error',
        message: 'Failed to sync user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
