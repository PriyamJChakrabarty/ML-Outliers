/**
 * Problem: Dropping the Junk
 * Module: Linear Regression
 *
 * A multi-page problem teaching feature selection based on correlation
 * and common sense reasoning.
 */

export const info = {
  // Problem Identification
  slug: 'dropping-the-junk',

  // Display Information
  title: 'Dropping the Junk',
  module: 'LinearRegression',
  difficulty: 'beginner',

  // Multi-page configuration
  multiPage: true,
  totalPages: 5,

  // Page-specific content
  pages: [
    // Page 1: Introduction
    {
      pageNumber: 1,
      prompt: {
        heading: 'Clean Out the Clutter',
        body: `Before you can build something great, you need to clean out the clutter.

Not every feature deserves a seat at the table. Some are redundant. Some are noise. Some are just... junk.

In this challenge, you'll learn to spot the features that are secretly sabotaging your model—the ones that add nothing but confusion.`,
      },
      type: 'introduction',
      hasNextButton: true,
    },

    // Page 2: Zombie Survival Scenario
    {
      pageNumber: 2,
      prompt: {
        heading: 'Common Sense Feature Selection',
        body: `Sometimes you can just see which features aren't important—no fancy math needed. Just common sense.

**The year is 2050.** A zombie virus has taken over the world. You are the Chief Data Scientist for the last human sanctuary. You have a historical dataset of survivors from the "Outlands," and your job is to build a Linear Regression model to predict how many **Days** a new survivor will last outside the walls based on their attributes.

**Which of the following features do you think are worthy of dropping?** (We are not concerned with features that are similar, but more with **Features that do not have much influence on the No. of Days Survived (the target variable)**)`,
      },
      type: 'multiple-choice',
      features: [
        { name: 'Cardio_Score', category: 'relevant' },
        { name: 'Instagram_Followers', category: 'irrelevant' },
        { name: 'Weapon_Mastery', category: 'relevant' },
        { name: 'Lucky_Number', category: 'irrelevant' },
        { name: 'Backpack_Weight', category: 'relevant' },
        { name: 'Sprint_Speed_kmh', category: 'relevant' },
        { name: 'IQ_Score', category: 'relevant' },
        { name: 'Shoe_Brand', category: 'irrelevant' },
        { name: 'Food_Rations_Days', category: 'relevant' },
        { name: 'Age_Years', category: 'relevant' },
        { name: 'Height_cm', category: 'relevant' },
      ],
      correctAnswers: ['Instagram_Followers', 'Lucky_Number', 'Shoe_Brand'],
    },

    // Page 3: Correlation Explanation
    {
      pageNumber: 3,
      prompt: {
        heading: 'When Common Sense Isn\'t Enough',
        body: `But it's not always so easy to see the data and find out the redundant features!

It's better to rely on **Math**!

This is where **correlation** comes in!

Two variables are said to be **correlated** if a change in one causes a corresponding change in the other variable.`,
      },
      type: 'explanation',
      hasNextButton: true,
      resource: {
        text: 'Learn more about correlation',
        url: 'https://www.geeksforgeeks.org/data-science/correlation-meaning-significance-types-and-degree-of-correlation/',
      },
      keyPoint: 'If a column is very less correlated with the target variable (usually ~ 0), there are high chances of it being redundant.',
    },

    // Page 4: Car Price Problem with Selection
    {
      pageNumber: 4,
      prompt: {
        heading: 'Calculate Correlation to Find Junk',
        body: `Consider the following problem: You're helping a used car dealer predict selling prices. They've been tracking everything—odometer readings, car age, horsepower, even the owner's age and highway driving habits.

**Features:**
- **Odometer (1k km)** - How much the car's been driven
- **Car Age** - Years since it rolled off the factory
- **Horsepower** - Engine power, the vroom factor
- **Owner Age** - How old the previous owner was
- **Highway Miles (%)** - Percentage that the owner claims to have driven on highways vs rough roads
- **Selling Price (INR Lakhs)** - What it actually sold for (target)

But here's the thing: not all of this matters. Some features are just noise. **Find the features that are unnecessary!** (You will see that it is difficult to see the data and find out features which are not necessary, thus we will rely on math! Scroll down to find out - Use the button below to see the visualisation of the correlation values, you can try doing the maths when you have time!)`,
      },
      type: 'data-analysis',
      dataSource: '/assets/LinearRegression/Correlation/data.csv',
      hasCodeBox: true,
      hasPlot: true,
      selectionQuestion: {
        heading: 'Now which features do you think are redundant?',
        body: 'Based on the correlation values you just saw, identify the features that should be dropped.',
        features: [
          { name: 'Odometer (1k km)', category: 'relevant' },
          { name: 'Car Age', category: 'relevant' },
          { name: 'Horsepower', category: 'relevant' },
          { name: 'Owner Age', category: 'irrelevant' },
          { name: 'Highway Miles (%)', category: 'irrelevant' },
        ],
        correctAnswers: ['Owner Age', 'Highway Miles (%)'],
        explanations: {
          'Owner Age': "Generally doesn't have to do much with the condition of the car",
          'Highway Miles (%)': "Well it seems important, but mind it - it is not verified and only claimed by the owner!",
        },
      },
    },

    // Page 5: Completion page
    {
      pageNumber: 5,
      type: 'completion',
      prompt: {
        heading: 'Hurray! 🎉',
        body: 'You have finished the exercise!',
      },
    },
  ],

  // Problem Content (for backward compatibility with single-page system)
  prompt: {
    heading: 'Dropping the Junk',
    body: 'A multi-page interactive problem about feature selection.',
  },

  // Visual placeholder (actual visual is multi-page)
  visualization: {
    type: 'interactive',
    path: null,
    alt: 'Interactive multi-page feature selection challenge',
  },

  // Answer Configuration (for the final page)
  answer: {
    expert: 'Owner Age should be dropped as it has very low or no correlation with the selling price',
    alternatives: [
      'owner age',
      'drop owner age',
      'owner age has no correlation',
      'owner age is not correlated',
      'remove owner age',
    ],
    similarityThreshold: 0.70,
    maxLength: 200,
    minLength: 5,
  },

  // Feedback
  feedback: {
    correct: {
      title: 'Excellent Analysis!',
      message: 'You\'re absolutely right! Owner Age has negligible correlation with the selling price. It\'s just noise in the dataset.',
      explanation: 'When a feature has correlation close to 0 with the target, it means changes in that feature don\'t meaningfully affect the prediction. Including such features can actually hurt model performance by adding noise.',
    },
    incorrect: {
      title: 'Not Quite',
      message: 'Look at the correlation values carefully. Which feature has a correlation closest to 0?',
      hint: 'Calculate the correlation coefficient between each feature and the target variable (Selling Price).',
    },
  },

  // Points & Rewards
  scoring: {
    basePoints: 150,
    timeBonusPoints: 75,
    maxTimeForBonus: 300, // seconds
  },

  // Hints System
  hints: [
    'Calculate the correlation coefficient between each feature and Selling Price',
    'Look for the feature with correlation closest to 0',
    'Owner Age is the answer - it has almost no correlation with car price',
  ],

  // Database sync metadata
  meta: {
    displayOrder: 2,
    isPublished: true,
    version: '1.0.0',
    createdAt: '2025-01-03',
    tags: ['feature-selection', 'correlation', 'preprocessing', 'linear-regression'],
  },
};

export default info;
