import { getUserProfile } from '@/db/queries/users';

/**
 * PROFILE API ROUTE
 *
 * Returns user profile data including completed problems and stats
 *
 * SCALABILITY: Efficient single-query profile fetch
 * PERFORMANCE: Leverages database joins
 * PUBLIC: Any authenticated user can view profiles
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(profile);
  } catch (error) {
    console.error('Profile API error:', error);
    return Response.json(
      {
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
