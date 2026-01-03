/**
 * Test Database Connection
 * Verifies that the database is set up correctly
 */

import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { supabase } from '../lib/supabase-admin.js';

async function testConnection() {
  console.log('🔍 Testing database connection and setup...\n');

  const tests = [
    {
      name: 'Connection Test',
      test: async () => {
        const { error } = await supabase.from('badges').select('count').limit(1);
        if (error) throw error;
      },
    },
    {
      name: 'Badges Table',
      test: async () => {
        const { data, error } = await supabase.from('badges').select('*');
        if (error) throw error;
        console.log(`   Found ${data.length} badges`);
        return data.length >= 6;
      },
    },
    {
      name: 'Modules Table',
      test: async () => {
        const { data, error } = await supabase.from('modules').select('*');
        if (error) throw error;
        console.log(`   Found ${data.length} modules`);
        return data.length > 0;
      },
    },
    {
      name: 'Problems Table',
      test: async () => {
        const { data, error } = await supabase.from('problems').select('count');
        if (error) throw error;
        console.log(`   Problems table ready`);
        return true;
      },
    },
    {
      name: 'Users Table',
      test: async () => {
        const { data, error } = await supabase.from('users').select('count');
        if (error) throw error;
        console.log(`   Users table ready`);
        return true;
      },
    },
    {
      name: 'Submissions Table',
      test: async () => {
        const { data, error } = await supabase.from('submissions').select('count');
        if (error) throw error;
        console.log(`   Submissions table ready`);
        return true;
      },
    },
    {
      name: 'User Progress Table',
      test: async () => {
        const { data, error } = await supabase.from('user_progress').select('count');
        if (error) throw error;
        console.log(`   User progress table ready`);
        return true;
      },
    },
    {
      name: 'Leaderboard Views',
      test: async () => {
        const { error: globalError } = await supabase.from('leaderboard_global').select('count').limit(1);
        const { error: monthlyError } = await supabase.from('leaderboard_monthly').select('count').limit(1);
        const { error: weeklyError } = await supabase.from('leaderboard_weekly').select('count').limit(1);

        if (globalError || monthlyError || weeklyError) {
          throw new Error('Leaderboard views not found');
        }
        console.log(`   All leaderboard views ready`);
        return true;
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      await test();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests Passed: ${passed}/${tests.length}`);
  console.log(`Tests Failed: ${failed}/${tests.length}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your database is ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Set up Clerk webhook (if not done)');
    console.log('2. Run: node scripts/sync-problems.js');
    console.log('3. Start your app: npm run dev');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('💡 You may need to run: node scripts/setup-database.js');
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

testConnection().catch(error => {
  console.error('\n❌ Connection test failed:', error.message);
  process.exit(1);
});
