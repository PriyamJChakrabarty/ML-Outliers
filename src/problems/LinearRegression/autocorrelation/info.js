/**
 * Problem: Autocorrelation
 * Module: Linear Regression
 *
 * A multi-page problem teaching autocorrelation in time series residual plots
 */

export const info = {
  // Problem Identification
  slug: 'autocorrelation',

  // Display Information
  title: 'Autocorrelation',
  module: 'LinearRegression',
  difficulty: 'intermediate',

  // Multi-page configuration
  multiPage: true,
  totalPages: 15,

  // Page-specific content
  pages: [
    // Page 1: Introduction to Time Series Analysis
    {
      pageNumber: 1,
      type: 'introduction',
      prompt: {
        heading: 'Time Series Analysis',
        body: `Time Series Analysis is a crucial task in Machine Learning.

It's all about understanding data that changes over time—stock prices, temperature, sales, you name it.

The goal is Forecasting. Predicting what comes next based on what's already happened.`,
      },
      hasNextButton: true,
    },

    // Page 2: Time Series as Regression
    {
      pageNumber: 2,
      type: 'explanation-with-image',
      prompt: {
        heading: 'Time Series as Regression',
        body: `You can treat it like a regression problem. Instead of predicting a target from random features, you're predicting the next value using previous values as your input.

To fit the best line for forecasting, residual plots help us to get credible insights`,
      },
      image: {
        path: '/assets/LinearRegression/TimeSeries/tseries.png',
        alt: 'Time Series Regression',
        caption: 'Treating time series as a regression problem',
      },
      hasNextButton: true,
    },

    // Page 3: Learning about Autocorrelation
    {
      pageNumber: 3,
      type: 'explanation-with-dropdown',
      prompt: {
        heading: 'Understanding Autocorrelation',
        body: `First let us learn about autocorrelation.

Autocorrelation means that the "errors" your model makes are not independent—they are following a sequence. If your model overestimates today, it is likely to overestimate tomorrow.

This usually occurs in Time Series data (or any Sequential Data)`,
      },
      dropdown: {
        title: 'Learn about autocorrelation',
        url: 'https://www.geeksforgeeks.org/machine-learning/autocorrelation/',
      },
      images: [
        {
          path: '/assets/LinearRegression/TimeSeries/ideal.png',
          alt: 'Ideal Residual Plot',
          label: 'Ideal Residual Plot',
        },
        {
          path: '/assets/LinearRegression/TimeSeries/periodic.png',
          alt: 'Time Series Residual Plot',
          label: 'Time Series Residual Plot',
        },
      ],
      hasNextButton: true,
    },

    // Page 4: Patterns in Time Series
    {
      pageNumber: 4,
      type: 'explanation-with-images-plain',
      prompt: {
        heading: 'Patterns in Time Series',
        body: `When multiple linear regression is applied to a time series data, it will usually give rise to a residual plot that has clear and distinctive patterns.

We can divide correlation as positive or negative based on whether the residuals follow the same trend as before or change continuously`,
      },
      images: [
        {
          path: '/assets/LinearRegression/TimeSeries/pos.png',
          alt: 'Autocorrelation Pattern 1',
        },
        {
          path: '/assets/LinearRegression/TimeSeries/neg.png',
          alt: 'Autocorrelation Pattern 2',
        },
      ],
      hasNextButton: true,
    },

    // Page 5: Question - Identify Positive Autocorrelation
    {
      pageNumber: 5,
      type: 'single-choice-question',
      prompt: {
        heading: 'Identify the Pattern',
        body: 'Observe and say whether this plot contains positive or negative autocorrelation',
      },
      image: {
        path: '/assets/LinearRegression/TimeSeries/pos.png',
        alt: 'Residual plot to analyze',
      },
      options: [
        { id: 'positive', text: 'Positive' },
        { id: 'negative', text: 'Negative' },
      ],
      correctAnswer: 'positive',
      feedback: {
        correct: {
          title: 'Correct! 🎯',
          message: 'You correctly identified positive autocorrelation!',
          remark: 'Since large sections are either continuously positive or continuously negative deviation from mean 0 line, the trend of the previous error is followed',
        },
        incorrect: {
          title: 'Not Quite! 🤔',
          message: 'Look at how the residuals cluster together in the same regions.',
          hint: 'Notice how large sections stay either above or below the zero line continuously.',
        },
      },
    },

    // Page 6: Question - Identify Negative Autocorrelation
    {
      pageNumber: 6,
      type: 'single-choice-question',
      prompt: {
        heading: 'Identify the Pattern',
        body: 'Observe and say whether this plot contains positive or negative autocorrelation',
      },
      image: {
        path: '/assets/LinearRegression/TimeSeries/neg.png',
        alt: 'Residual plot to analyze',
      },
      options: [
        { id: 'positive', text: 'Positive' },
        { id: 'negative', text: 'Negative' },
      ],
      correctAnswer: 'negative',
      feedback: {
        correct: {
          title: 'Correct! 🎯',
          message: 'You correctly identified negative autocorrelation!',
          remark: 'Error trends change continuously!',
        },
        incorrect: {
          title: 'Not Quite! 🤔',
          message: 'Look at how the residuals alternate rapidly.',
          hint: 'Notice how the residuals quickly switch between positive and negative values.',
        },
      },
    },

    // Page 7: Lag Plots Introduction
    {
      pageNumber: 7,
      type: 'lag-plots-intro',
      prompt: {
        heading: 'Lag Plots',
        body: `While residual plots are mostly fine, sometimes it might be more clear to use **Lag Plots!**

Lag Plots - A lag plot is a special type of scatter plot in which the X-axis represents the dataset with some time units behind or ahead as compared to the Y-axis. The difference between these time units is called lag or lagged and it is represented by k.`,
      },
      styledBox: {
        content: `The lag plot contains the following axes:

Vertical axis: Yi for all i
Horizontal axis: Yi-k for all i, where k is lag value`,
      },
      explanation: `So you can think of iterating over all i from i = k to ∞

Plot the corresponding Yi-k in x axis and the corresponding Yi in y axis`,
      hasNextButton: true,
    },

    // Page 8: MCQ - Ordering Correlation Strength
    {
      pageNumber: 8,
      type: 'correlation-ordering-question',
      prompt: {
        heading: 'Understanding Correlation Strength',
        body: `Remember that for autocorrelation to occur et should follow some kind of trend with respect to et-1

Observe the below and tell in which order the strength of correlation increases`,
      },
      images: [
        {
          id: '1',
          path: '/assets/LinearRegression/TimeSeries/poscorr.png',
          alt: 'Plot 1',
        },
        {
          id: '2',
          path: '/assets/LinearRegression/TimeSeries/nocorr.png',
          alt: 'Plot 2',
        },
        {
          id: '3',
          path: '/assets/LinearRegression/TimeSeries/modposcorr.png',
          alt: 'Plot 3',
        },
        {
          id: '4',
          path: '/assets/LinearRegression/TimeSeries/modcorr.png',
          alt: 'Plot 4',
        },
      ],
      options: [
        { id: 'opt1', text: '1 < 3 < 4 < 2' },
        { id: 'opt2', text: '4 < 3 < 2 < 1' },
        { id: 'opt3', text: '2 < 4 < 3 < 1' },
        { id: 'opt4', text: '2 < 3 < 4 < 1' },
      ],
      correctAnswer: 'opt3',
      feedback: {
        correct: {
          title: 'Excellent! 🎯',
          message: 'You correctly ordered the correlation strength!',
          remark: 'Plot 2 shows no correlation (random scatter), Plot 4 shows moderate correlation, Plot 3 shows stronger correlation, and Plot 1 shows the strongest correlation pattern.',
        },
        incorrect: {
          title: 'Not Quite! 🤔',
          message: 'Look carefully at how tight the pattern is in each plot.',
          hint: 'The tighter the lag plot clusters around a line, the stronger the autocorrelation.',
        },
      },
    },

    // Page 9: MCQ - Identify Positive/Negative Autocorrelation (Lag Plot)
    {
      pageNumber: 9,
      type: 'single-choice-question',
      prompt: {
        heading: 'Identify the Pattern',
        body: 'Observe and say whether this plot contains positive or negative autocorrelation',
      },
      image: {
        path: '/assets/LinearRegression/TimeSeries/poscorr.png',
        alt: 'Lag plot to analyze',
      },
      options: [
        { id: 'positive', text: 'Positive' },
        { id: 'negative', text: 'Negative' },
      ],
      correctAnswer: 'positive',
      feedback: {
        correct: {
          title: 'Correct! 🎯',
          message: 'You correctly identified positive autocorrelation!',
          remark: 'Since large sections are either continuously positive or continuously negative deviation from mean 0 line, the trend of the previous error is followed',
        },
        incorrect: {
          title: 'Not Quite! 🤔',
          message: 'Look at the direction of the pattern in the lag plot.',
          hint: 'Positive autocorrelation shows an upward trending pattern, while negative shows a downward trend.',
        },
      },
    },

    // Page 10: Thinking About Solutions
    {
      pageNumber: 10,
      type: 'thinking-page',
      prompt: {
        heading: 'How to Make Regression Fit Better?',
        body: `Great now that we know how to see the correlation, how to make the regression fit better`,
        emoji: '🤔',
      },
      hasNextButton: true,
    },

    // Page 11: Equation with Lagged Variable
    {
      pageNumber: 11,
      type: 'equation-page',
      prompt: {
        heading: 'Using Lagged Variables',
        body: `One way to use a simple linear regression with a lagged variable`,
      },
      equation: {
        content: `H(t) = w₀ + Σwᵢ Xtᵢ + φYt₋₁`,
      },
      explanation: `The Yt-1 predicts the next value on the basis of the previous value!`,
      hasNextButton: true,
    },

    // Page 12: Predict the Change
    {
      pageNumber: 12,
      type: 'predict-change-page',
      prompt: {
        heading: 'Predict the Change!!',
        body: `The undoubtedly best way is to **predict the difference** and not the exact value`,
        dramaticText: 'Predict the Change!!',
      },
      explanation: {
        part1: `So turn the target value as Dt = Yt-Yt-1 and then run a linear regression on it!`,
        part2: `Now you can use all the tricks that you have learnt for the standard linear regression on it.

Simplifying it a lot!`,
      },
      hasNextButton: true,
    },

    // Page 13: MCQ - Drawbacks
    {
      pageNumber: 13,
      type: 'single-choice-question',
      prompt: {
        heading: 'Understanding the Drawbacks',
        body: `While "Predicting the Change" solves autocorrelation, you must be aware of a few drawbacks

Can you identify what is the biggest drawback here`,
      },
      options: [
        { id: 'opt1', text: 'Ordinary least square wont be applicable' },
        { id: 'opt2', text: 'It significantly increases the computational complexity of the training phase.' },
        { id: 'opt3', text: 'It causes the model to ignore short-term fluctuations.' },
        { id: 'opt4', text: 'The Loss of Long-Term Memory and understanding' },
      ],
      correctAnswer: 'opt4',
      feedback: {
        correct: {
          title: 'Correct! 🎯',
          message: 'You identified the key drawback!',
          remark: 'By predicting only the change (difference), the model focuses on short-term variations but loses track of long-term trends and the overall trajectory of the data.',
        },
        incorrect: {
          title: 'Not Quite! 🤔',
          message: 'Think about what information is lost when you only predict differences.',
          hint: 'When you predict Yt - Yt-1 instead of Yt, what aspect of the data do you lose sight of?',
        },
      },
    },

    // Page 14: Summary
    {
      pageNumber: 14,
      type: 'summary',
      prompt: {
        heading: 'Key Takeaways',
        body: `Understanding autocorrelation is essential for time series analysis:

**Lag Plots:** Visualize correlation between values and their lagged versions. The tighter the pattern, the stronger the autocorrelation.

**Positive Autocorrelation:** Errors follow the same trend - upward pattern in lag plots.

**Negative Autocorrelation:** Errors alternate - downward pattern in lag plots.

**Solution Approaches:** Use lagged variables or predict the change (difference) instead of the actual value.

**Trade-offs:** Predicting changes solves autocorrelation but sacrifices long-term memory of trends.`,
      },
      hasNextButton: true,
    },

    // Page 15: Completion
    {
      pageNumber: 15,
      type: 'completion',
      prompt: {
        heading: 'Hurray! You\'ve Mastered Autocorrelation! 🎉',
        body: `You've successfully learned how to identify autocorrelation patterns in time series residual plots!

This skill is crucial for building reliable forecasting models. By recognizing autocorrelation, you can identify when your time series model needs adjustments to handle sequential dependencies.

Remember: **Independent errors are random. Autocorrelated errors follow patterns!**`,
      },
    },
  ],

  // Problem Content (for backward compatibility)
  prompt: {
    heading: 'Autocorrelation',
    body: 'A multi-page interactive problem about detecting autocorrelation in time series residual plots.',
  },

  // Visual placeholder
  visualization: {
    type: 'interactive',
    path: null,
    alt: 'Interactive multi-page autocorrelation detection challenge',
  },

  // Answer Configuration
  answer: {
    expert: 'Identify positive and negative autocorrelation in time series residual plots',
    alternatives: [
      'autocorrelation detection',
      'time series autocorrelation',
      'sequential error patterns',
      'residual autocorrelation',
    ],
    similarityThreshold: 0.70,
    maxLength: 200,
    minLength: 5,
  },

  // Feedback
  feedback: {
    correct: {
      title: 'Perfect Analysis!',
      message: 'You correctly identified the autocorrelation patterns in the residual plots!',
      explanation: 'Understanding autocorrelation helps you detect when model errors are not independent in time series data.',
    },
    incorrect: {
      title: 'Think Again',
      message: 'Look at how the residuals are distributed over time.',
      hint: 'Positive autocorrelation shows clustering, while negative shows rapid alternation.',
    },
  },

  // Points & Rewards
  scoring: {
    basePoints: 200,
    timeBonusPoints: 100,
    maxTimeForBonus: 300, // seconds
  },

  // Hints System
  hints: [
    'Positive autocorrelation: errors cluster together in the same regions',
    'Negative autocorrelation: errors alternate rapidly between positive and negative',
    'Look for continuous sections vs rapid switching patterns',
  ],

  // Database sync metadata
  meta: {
    displayOrder: 5,
    isPublished: true,
    version: '1.0.0',
    createdAt: '2025-01-05',
    tags: ['autocorrelation', 'time-series', 'residual-plots', 'linear-regression', 'forecasting'],
  },
};

export default info;
