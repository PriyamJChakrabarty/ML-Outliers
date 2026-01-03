/**
 * Sync Problems to Database
 * Syncs problem definitions from the registry to Supabase
 */

import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { supabase } from '../lib/supabase-admin.js';

// Example problems - replace with actual registry import when available
const EXAMPLE_PROBLEMS = [
  {
    slug: 'log-transform',
    title: 'Log Transform Challenge',
    description: 'Identify when log transformation is needed for your data',
    difficulty: 'beginner',
    module_id: 1, // Linear Regression
    base_points: 100,
    time_bonus_points: 50,
    display_order: 1,
    is_published: true,
  },
  {
    slug: 'outlier-detection',
    title: 'Outlier Detection',
    description: 'Learn to identify and handle outliers in your dataset',
    difficulty: 'beginner',
    module_id: 1,
    base_points: 100,
    time_bonus_points: 50,
    display_order: 2,
    is_published: true,
  },
  {
    slug: 'feature-scaling',
    title: 'Feature Scaling',
    description: 'Understand when and how to scale features',
    difficulty: 'intermediate',
    module_id: 1,
    base_points: 150,
    time_bonus_points: 75,
    display_order: 3,
    is_published: false,
  },
];

async function syncProblems() {
  console.log('🔄 Syncing problems to database...\n');

  let synced = 0;
  let errors = 0;

  for (const problem of EXAMPLE_PROBLEMS) {
    try {
      const { error } = await supabase
        .from('problems')
        .upsert(problem, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Error syncing ${problem.slug}:`, error.message);
        errors++;
      } else {
        console.log(`✅ Synced: ${problem.slug}`);
        synced++;
      }
    } catch (err) {
      console.error(`❌ Exception syncing ${problem.slug}:`, err.message);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Synced: ${synced}/${EXAMPLE_PROBLEMS.length}`);
  console.log(`Errors: ${errors}/${EXAMPLE_PROBLEMS.length}`);
  console.log('='.repeat(50));

  if (errors === 0) {
    console.log('\n🎉 All problems synced successfully!');
    console.log('\n💡 To sync from your actual problem registry:');
    console.log('   1. Import your problems from src/problems/index.js');
    console.log('   2. Replace EXAMPLE_PROBLEMS with your registry');
    console.log('   3. Run this script again');
  } else {
    console.log('\n⚠️  Some problems failed to sync');
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

syncProblems().catch(error => {
  console.error('\n❌ Sync failed:', error.message);
  process.exit(1);
});
