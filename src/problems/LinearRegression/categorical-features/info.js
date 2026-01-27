/**
 * Problem: Categorical Features - Which categories are Important?
 * Module: Linear Regression
 *
 * A multi-page problem teaching ANOVA and T-tests for categorical features
 */

export const info = {
  // Problem Identification
  slug: 'categorical-features',

  // Display Information
  title: 'Which Categories are Important?',
  module: 'LinearRegression',
  difficulty: 'beginner',

  // Multi-page configuration
  multiPage: true,
  totalPages: 9,

  // Page-specific content
  pages: [
    // Page 1: Introduction to categorical features
    {
      pageNumber: 1,
      type: 'introduction',
      prompt: {
        heading: 'What About Categorical Features?',
        body: `We now know which features we can root out as not playing a big role in the answer! Correlation helped us spot the weak links among numerical features.

But what if features are categorical?

Things like car brand (Toyota, Honda, BMW), fuel type (Petrol, Diesel, Electric), or transmission (Manual, Automatic)—you can't just "correlate" these. They're categories, not numbers.

So how do you figure out if they actually matter?`,
      },
      hasNextButton: true,
    },

    // Page 2: Restaurant chef salary example + Selection question (MERGED)
    {
      pageNumber: 2,
      type: 'data-with-question',
      prompt: {
        heading: 'A Real-World Example',
        body: `Consider the below:

A restaurant chain is trying to figure out what drives chef salaries. They've got data on years of experience, critic reviews, cuisine specialization, and what each chef actually earns. (Use your common sense, and observe the data carefully, you can just see it without using maths! - We are focussed on the categorical features, not the Experience!)`,
      },
      dataSource: '/assets/LinearRegression/Anova/data.csv',
      categoricalNote: `Two of these features are categorical—they're not numbers, they're labels.

**Critic Review:** Excellent or Poor
**Cuisine:** French or Italian`,
      question: {
        text: 'Your task is simple: Look at the data and tell - the salary does NOT seem to depend heavily on which one of these categories?',
        options: [
          { label: 'Critic Review', value: 'critic_review' },
          { label: 'Cuisine', value: 'cuisine' },
        ],
        correctAnswer: 'cuisine',
        feedback: {
          correct: {
            title: 'Correct Answer! 🎯',
            remark: 'No matter if you make French or Italian food, if you have experience and critical acclaim, you tend to earn more!',
          },
          incorrect: {
            title: 'Wrong Answer! ❌',
            remark: 'Look at the data again - the cuisine type doesn\'t seem to affect salary as much as other factors.',
          },
        },
      },
    },

    // Page 3: T-test and ANOVA explanation
    {
      pageNumber: 3,
      type: 'explanation-with-resources',
      prompt: {
        heading: 'Mathematical Ways to Decide',
        body: `When the patterns are subtle, mathematical ways for deciding whether a categorical feature actually matters.

For binary categories (like Excellent vs Poor), we use **T-Tests**.
For categories with more than two groups (like Maharashtra, Karnataka, Tamil Nadu—the state you belong to), we use **ANOVA**.`,
      },
      sections: [
        {
          title: 'T-test',
          description: 'The t-test is used to compare the averages of two groups to see if they are significantly different from each other',
          image: '/assets/LinearRegression/Anova/ttest.png',
          resources: [
            'https://www.geeksforgeeks.org/data-science/t-test/',
            'https://youtu.be/FGyKfh3kh9M?si=bZm4j_MrDrBP5qqf',
          ],
        },
        {
          title: 'ANOVA',
          description: 'ANOVA is useful when we need to compare more than two groups and determine whether their means are significantly different.',
          resources: [
            'https://www.geeksforgeeks.org/data-science/anova-for-data-science-and-data-analytics/',
            'https://youtu.be/tRqUNwEY63Y?si=ddYRNQFI-5x4y7MY',
            'https://youtu.be/Am141TRmdhQ?si=MWzR8Kh7Q2t3JoKz',
          ],
        },
      ],
      hasNextButton: true,
    },

    // Page 4: Ideal case for categorical features
    {
      pageNumber: 4,
      type: 'dramatic-quote',
      prompt: {
        heading: 'The Ideal Case',
        body: 'For a categorical feature to be valuable:',
      },
      quotes: [
        'All target values that fall in one category should be similar to each other.',
        'The mean of the target values in each category should be very different than each other (basically saying that the groups are different)',
      ],
      hasNextButton: true,
    },

    // Page 5: Box plot introduction
    {
      pageNumber: 5,
      type: 'box-plot-intro',
      prompt: {
        heading: 'The Easy Way: Box Plots',
        body: `Luckily for us, one easy way is to look at the Box Plot!

A Box Plot first represents various categories as blocks and then represents the range of target values they cover`,
      },
      image: '/assets/LinearRegression/Anova/plot1.png',
      explanation: [
        'The height of each box shows the range of values covered by that category - a bigger height meaning that the category covers very different target values',
        'The position of each box suggests the difference in target values covered by the categories - overlapping categories essentially meaning that two different groups are covering the same targets',
      ],
      hasNextButton: true,
    },

    // Page 6: Box plot question 1
    {
      pageNumber: 6,
      type: 'yes-no',
      prompt: {
        heading: 'Box Plot Analysis',
        body: 'Looking at the box plot, do you think this feature heavily determines the target value?',
      },
      image: '/assets/LinearRegression/Anova/plot2.png',
      correctAnswer: 'yes',
      remark: 'Wide boxes with overlapping target values are more redundant features',
    },

    // Page 7: Box plot question 2
    {
      pageNumber: 7,
      type: 'yes-no',
      prompt: {
        heading: 'Box Plot Analysis',
        body: 'Looking at the box plot, do you think this feature heavily determines the target value?',
      },
      image: '/assets/LinearRegression/Anova/plot4.png',
      correctAnswer: 'no',
      remark: 'Wide boxes with overlapping target values are more redundant features',
    },

    // Page 8: Box plot question 3
    {
      pageNumber: 8,
      type: 'yes-no',
      prompt: {
        heading: 'Box Plot Analysis',
        body: 'Looking at the box plot, do you think this feature heavily determines the target value?',
      },
      image: '/assets/LinearRegression/Anova/plot3.png',
      correctAnswer: 'yes',
      remark: 'Wide boxes with overlapping target values are more redundant features',
    },

    // Page 9: Completion page
    {
      pageNumber: 9,
      type: 'completion',
      prompt: {
        heading: 'Hurray! 🎉',
        body: 'You have finished the exercise!',
      },
    },
  ],

  // Problem Content (for backward compatibility)
  prompt: {
    heading: 'Which Categories are Important?',
    body: 'A multi-page interactive problem about categorical feature analysis using ANOVA and T-tests.',
  },

  // Visual placeholder
  visualization: {
    type: 'interactive',
    path: null,
    alt: 'Interactive multi-page categorical features challenge',
  },

  // Answer Configuration
  answer: {
    expert: 'Cuisine does not heavily affect salary compared to experience and critic reviews',
    alternatives: [
      'cuisine',
      'cuisine does not matter',
      'cuisine is not important',
    ],
    similarityThreshold: 0.70,
    maxLength: 200,
    minLength: 5,
  },

  // Feedback
  feedback: {
    correct: {
      title: 'Perfect Analysis!',
      message: 'You correctly identified that cuisine type doesn\'t significantly impact salary!',
      explanation: 'When categories show overlapping target value ranges in box plots, they indicate redundant features.',
    },
    incorrect: {
      title: 'Think Again',
      message: 'Look at how the target values are distributed across different categories.',
      hint: 'Use box plots to visualize the distribution of target values for each category.',
    },
  },

  // Points & Rewards
  scoring: {
    basePoints: 200,
    timeBonusPoints: 100,
    maxTimeForBonus: 360, // seconds
  },

  // Hints System
  hints: [
    'Look at the salary distribution for French vs Italian cuisine',
    'Compare the impact of critic reviews on salary',
    'Use box plots to visualize categorical feature importance',
  ],

  // Database sync metadata
  meta: {
    displayOrder: 3,
    isPublished: true,
    version: '1.0.0',
    createdAt: '2025-01-04',
    tags: ['categorical-features', 'anova', 't-test', 'box-plots', 'linear-regression'],
  },
};

export default info;
