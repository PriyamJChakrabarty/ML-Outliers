import { db } from '../src/db/index.js';
import { problems } from '../src/db/schema.js';
import { getAllProblems } from '../src/problems/index.js';
import * as dotenv from 'dotenv';

/**
 * SEED SCRIPT: Problems
 *
 * Syncs problems from the Registry to the database
 * Ensures database is always in sync with codebase
 *
 * Run with: npm run db:seed
 */

dotenv.config({ path: '.env.local' });

async function seedProblems() {
  console.log('🌱 Seeding problems from registry to database...\n');

  try {
    const problemsFromRegistry = getAllProblems();

    console.log(`Found ${problemsFromRegistry.length} problems in registry\n`);

    for (const problem of problemsFromRegistry) {
      try {
        // Extract data from problem info
        const problemData = {
          slug: problem.slug,
          title: problem.title,
          module: problem.module,
          difficulty: problem.difficulty,
          basePoints: problem.scoring?.basePoints || 100,
          displayOrder: problem.meta?.displayOrder || 999,
          isPublished: problem.meta?.isPublished !== false,
        };

        // Upsert (insert or update if exists)
        await db
          .insert(problems)
          .values(problemData)
          .onConflictDoUpdate({
            target: problems.slug,
            set: {
              title: problemData.title,
              module: problemData.module,
              difficulty: problemData.difficulty,
              basePoints: problemData.basePoints,
              displayOrder: problemData.displayOrder,
              isPublished: problemData.isPublished,
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
