/**
 * PROBLEMS REGISTRY
 *
 * This is the single source of truth for all problems.
 * Problems are now organized by MODULE for better scalability.
 *
 * Structure: problems/[MODULE]/[problem-slug]/
 *
 * SCALABILITY: Adding a new problem = Add one entry here
 * MODULARITY: Each problem is completely independent
 * DATABASE SYNC: This structure maps 1:1 with database schema
 */

import { info as logTransformInfo } from './LinearRegression/log-transform/info.js';
import LogTransformVisual from './LinearRegression/log-transform/Visual.jsx';
import { info as droppingJunkInfo } from './LinearRegression/dropping-the-junk/info.js';
import DroppingJunkVisual from './LinearRegression/dropping-the-junk/Visual.jsx';

// Registry object: Maps problem slug to problem module
const problemsRegistry = {
  'log-transform': {
    info: logTransformInfo,
    Visual: LogTransformVisual,
  },

  'dropping-the-junk': {
    info: droppingJunkInfo,
    Visual: DroppingJunkVisual,
  },

  // Add more problems here as you create them
  // 'outlier-detection': {
  //   info: outlierDetectionInfo,
  //   Visual: OutlierDetectionVisual,
  // },
};

/**
 * Get a problem by its slug
 * @param {string} slug - Problem identifier
 * @returns {Object|null} Problem module or null if not found
 */
export function getProblem(slug) {
  return problemsRegistry[slug] || null;
}

/**
 * Get all problems (for listing, syncing to DB, etc.)
 * @returns {Array} Array of problem objects with slug
 */
export function getAllProblems() {
  return Object.entries(problemsRegistry).map(([slug, problem]) => ({
    slug,
    ...problem.info,
  }));
}

/**
 * Get problems by module
 * @param {string} moduleName - Module identifier (e.g., 'LinearRegression')
 * @returns {Array} Array of problems in this module
 */
export function getProblemsByModule(moduleName) {
  return Object.entries(problemsRegistry)
    .filter(([_, problem]) => problem.info.module === moduleName)
    .map(([slug, problem]) => ({
      slug,
      ...problem.info,
    }))
    .sort((a, b) => a.meta.displayOrder - b.meta.displayOrder);
}

/**
 * Get problems by difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {Array} Array of problems with this difficulty
 */
export function getProblemsByDifficulty(difficulty) {
  return Object.entries(problemsRegistry)
    .filter(([_, problem]) => problem.info.difficulty === difficulty)
    .map(([slug, problem]) => ({
      slug,
      ...problem.info,
    }));
}

/**
 * Check if a problem exists
 * @param {string} slug - Problem identifier
 * @returns {boolean} True if problem exists
 */
export function problemExists(slug) {
  return slug in problemsRegistry;
}

// Default export
export default problemsRegistry;
