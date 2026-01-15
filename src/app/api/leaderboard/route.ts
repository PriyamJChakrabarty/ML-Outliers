import { NextRequest } from 'next/server';
import {
  getGlobalLeaderboard,
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
  getUserRank,
} from '@/db/queries/leaderboard';
import { auth } from '@clerk/nextjs/server';

/**
 * LEADERBOARD API ROUTE
 *
 * Returns ranked user data based on time filter
 * Supports: all-time, monthly, weekly
 *
 * SCALABILITY: Efficient aggregation queries
 * PERFORMANCE: Uses database indexes
 * USER CONTEXT: Returns current user's rank if authenticated
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get('filter') || 'all-time';
    const limit = parseInt(searchParams.get('limit') || '100');

    let leaderboard;

    switch (timeFilter) {
      case 'monthly':
        leaderboard = await getMonthlyLeaderboard(limit);
        break;
      case 'weekly':
        leaderboard = await getWeeklyLeaderboard(limit);
        break;
      default:
        leaderboard = await getGlobalLeaderboard(limit);
    }

    // Get current user's rank if authenticated
    const { userId } = await auth();
    let currentUserRank = null;

    if (userId) {
      currentUserRank = await getUserRank(userId);
    }

    return Response.json({
      leaderboard,
      currentUserRank,
      filter: timeFilter,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return Response.json(
      {
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
