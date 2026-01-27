import * as dotenv from 'dotenv';

// Load env vars FIRST
dotenv.config({ path: '.env.local' });

/**
 * SEED SCRIPT: Problems
 *
 * Syncs problems to the database
 * Run with: npm run db:seed
 */

// Problem data - inline to avoid CSS import issues
const allProblems = [
  {
    slug: 'log-transform',
    title: 'Transform, Transform!',
    module: 'LinearRegression',
    difficulty: 'beginner' as const,
    basePoints: 100,
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: 'dropping-the-junk',
    title: 'Dropping the Junk',
    module: 'LinearRegression',
    difficulty: 'beginner' as const,
    basePoints: 100,
    displayOrder: 2,
    isPublished: true,
  },
  {
    slug: 'categorical-features',
    title: 'Categorical Features',
    module: 'LinearRegression',
    difficulty: 'beginner' as const,
    basePoints: 100,
    displayOrder: 3,
    isPublished: true,
  },
  {
    slug: 'residual-plot',
    title: 'Residual Plot Analysis',
    module: 'LinearRegression',
    difficulty: 'intermediate' as const,
    basePoints: 100,
    displayOrder: 4,
    isPublished: true,
  },
  {
    slug: 'more-residuals',
    title: 'More Residuals',
    module: 'LinearRegression',
    difficulty: 'intermediate' as const,
    basePoints: 100,
    displayOrder: 5,
    isPublished: true,
  },
  {
    slug: 'autocorrelation',
    title: 'Autocorrelation',
    module: 'LinearRegression',
    difficulty: 'advanced' as const,
    basePoints: 100,
    displayOrder: 6,
    isPublished: true,
  },
];

async function seedProblems() {
  // Dynamic import AFTER env vars are loaded
  const { db } = await import('../src/db/index.js');
  const { problems } = await import('../src/db/schema.js');

  console.log('🌱 Seeding problems to database...\n');

  try {
    console.log(`Found ${allProblems.length} problems to seed\n`);

    for (const problem of allProblems) {
      try {
        await db
          .insert(problems)
          .values(problem)
          .onConflictDoUpdate({
            target: problems.slug,
            set: {
              title: problem.title,
              module: problem.module,
              difficulty: problem.difficulty,
              basePoints: problem.basePoints,
              displayOrder: problem.displayOrder,
              isPublished: problem.isPublished,
              updatedAt: new Date(),
            },
          });

        console.log(`✅ Synced: ${problem.slug} (${problem.title})`);
      } catch (error) {
        console.error(`❌ Failed to sync ${problem.slug}:`, error);
      }
    }

    console.log('\n🎉 Problem seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

seedProblems();
