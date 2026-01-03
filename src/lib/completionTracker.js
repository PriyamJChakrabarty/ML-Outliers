/**
 * Completion Tracker Utility
 *
 * Manages problem completion state using localStorage
 * This is a client-side solution until database integration is ready
 *
 * SCALABILITY: Can be easily swapped with database calls later
 * MODULARITY: Centralized completion management
 */

const STORAGE_KEY = 'ml-outliers-completions';

/**
 * Get all completions for the current user
 * @returns {Set<string>} Set of completed problem slugs
 */
export function getCompletions() {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (error) {
    console.error('Error loading completions:', error);
    return new Set();
  }
}

/**
 * Mark a problem as completed
 * @param {string} problemSlug - The problem identifier
 * @returns {boolean} Success status
 */
export function markComplete(problemSlug) {
  if (typeof window === 'undefined') return false;

  try {
    const completions = getCompletions();
    completions.add(problemSlug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completions]));

    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent('completion-updated', {
      detail: { problemSlug }
    }));

    return true;
  } catch (error) {
    console.error('Error saving completion:', error);
    return false;
  }
}

/**
 * Check if a problem is completed
 * @param {string} problemSlug - The problem identifier
 * @returns {boolean} True if completed
 */
export function isCompleted(problemSlug) {
  const completions = getCompletions();
  return completions.has(problemSlug);
}

/**
 * Get completion count for a specific module
 * @param {string} moduleName - The module identifier
 * @param {Array<string>} problemSlugs - Array of problem slugs in the module
 * @returns {number} Number of completed problems
 */
export function getModuleCompletionCount(moduleName, problemSlugs) {
  const completions = getCompletions();
  return problemSlugs.filter(slug => completions.has(slug)).length;
}

/**
 * Clear all completions (for testing/reset)
 * @returns {boolean} Success status
 */
export function clearCompletions() {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('completion-updated'));
    return true;
  } catch (error) {
    console.error('Error clearing completions:', error);
    return false;
  }
}

/**
 * Get total completion stats
 * @param {Array} allProblems - Array of all problem objects
 * @returns {Object} Stats object
 */
export function getCompletionStats(allProblems) {
  const completions = getCompletions();

  return {
    totalCompleted: completions.size,
    totalProblems: allProblems.length,
    percentComplete: allProblems.length > 0
      ? Math.round((completions.size / allProblems.length) * 100)
      : 0,
    completedSlugs: [...completions]
  };
}

export default {
  getCompletions,
  markComplete,
  isCompleted,
  getModuleCompletionCount,
  clearCompletions,
  getCompletionStats
};
