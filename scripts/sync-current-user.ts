import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import * as dotenv from 'dotenv';

/**
 * ONE-TIME SCRIPT: Sync Current User to Database
 *
 * Run this AFTER db:push to add yourself to the database
 * In production, the Clerk webhook will handle this automatically
 */

dotenv.config({ path: '.env.local' });

async function syncCurrentUser() {
  console.log('🔄 Syncing current user to database...\n');

  try {
    // TODO: Replace with YOUR actual Clerk user ID
    // Get it from: Clerk Dashboard → Users → Your Account → User ID
    const clerkId = 'YOUR_CLERK_USER_ID_HERE';
    const email = 'your-email@example.com';
    const username = 'YourUsername';

    if (clerkId === 'YOUR_CLERK_USER_ID_HERE') {
      console.error('❌ Please update this script with your actual Clerk user ID!');
      console.log('\nSteps:');
      console.log('1. Go to https://dashboard.clerk.com');
      console.log('2. Click on "Users" in the sidebar');
      console.log('3. Find your account and click on it');
      console.log('4. Copy your "User ID" (starts with "user_...")');
      console.log('5. Update this script with your details\n');
      process.exit(1);
    }

    await db.insert(users).values({
      clerkId,
      email,
      username,
      fullName: username,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
    });

    console.log(`✅ User synced successfully!`);
    console.log(`   Clerk ID: ${clerkId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Username: ${username}\n`);

    console.log('🎉 You can now solve problems and appear on the leaderboard!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncCurrentUser();
