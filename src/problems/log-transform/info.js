/**
 * Problem: Log Transformation
 * Module: Linear Regression
 *
 * This file contains all metadata and configuration for this problem.
 * Structure is designed to be easily synced to database.
 */

export const info = {
  // Problem Identification (matches folder name)
  slug: 'log-transform',

  // Display Information
  title: 'Log Transformation Challenge',
  module: 'linear-regression',
  difficulty: 'beginner',

  // Problem Content
  prompt: {
    heading: 'Observe the Distribution',
    body: `You will get the best results if you know to read the distribution. Linear Regression works best if you can fit a standard mathematical function, even better if you can convert the distribution into some kind of linear distribution.

Hey, what do you think, can you do some operation on the target variable y to make it linear with respect to x?`,
  },

  // Visual Assets
  visualization: {
    type: 'image',
    path: '/assets/LinearRegression/plot1.png',
    alt: 'Distribution plot showing exponential relationship',
  },

  // Answer Configuration
  answer: {
    // Expert answer for semantic comparison
    expert: 'Use Log Transformation',

    // Alternative acceptable answers (for exact matching)
    alternatives: [
      'log transformation',
      'apply log transform',
      'logarithmic transformation',
      'use logarithm',
      'take the log',
      'log transform the target',
    ],

    // Semantic similarity threshold (0-1)
    similarityThreshold: 0.75,

    // Input constraints
    maxLength: 100,
    minLength: 3,
  },

  // Feedback
  feedback: {
    correct: {
      title: '🎉 Excellent!',
      message: 'You\'re absolutely right! Log transformation is the key here. When you see an exponential relationship between x and y, applying log(y) can linearize it, making it perfect for linear regression.',
      explanation: 'Mathematical intuition: If y = e^(ax + b), then log(y) = ax + b, which is linear!',
    },
    incorrect: {
      title: '🤔 Not Quite',
      message: 'Think about what mathematical operation could "straighten out" an exponential curve.',
      hint: 'Consider transformations that convert exponential growth into linear growth.',
    },
  },

  // Points & Rewards
  scoring: {
    basePoints: 100,
    timeBonusPoints: 50,
    maxTimeForBonus: 120, // seconds
  },

  // Hints System (progressive)
  hints: [
    'Look at how y grows as x increases. Does it look exponential?',
    'What mathematical operation is the inverse of exponentiation?',
    'The answer involves a mathematical transformation that starts with "Log"',
  ],

  // Database sync metadata
  meta: {
    displayOrder: 1,
    isPublished: true,
    version: '1.0.0',
    createdAt: '2025-01-03',
    tags: ['transformation', 'preprocessing', 'linear-regression'],
  },
};

export default info;
