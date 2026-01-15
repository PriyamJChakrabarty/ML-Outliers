import { getCompletions } from './completionTracker';

/**
 * LOCALSTORAGE MIGRATION UTILITY
 *
 * Migrates localStorage completion data to database
 * Run once when user first authenticates after DB rollout
 *
 * SCALABILITY: Handles batch migration efficiently
 * DATA INTEGRITY: Skips duplicates, preserves existing data
 * USER EXPERIENCE: Seamless migration, no data loss
 */

export async function migrateLocalStorageToDatabase(userId: string): Promise<{
  success: boolean;
  migrated?: number;
  error?: string;
}> {
  try {
    const localCompletions = getCompletions();

    if (localCompletions.size === 0) {
      return { success: true, migrated: 0 };
    }

    // Call migration API endpoint
    const response = await fetch('/api/migrate-completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completedSlugs: Array.from(localCompletions),
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Clear localStorage after successful migration
      localStorage.removeItem('ml-outliers-completions');
      console.log(`✅ Migrated ${result.migrated} completions to database`);
    }

    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
