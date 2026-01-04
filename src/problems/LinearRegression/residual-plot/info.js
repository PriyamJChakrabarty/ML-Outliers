/**
 * Problem: To Err is Human!
 * Module: Linear Regression
 *
 * A multi-page problem teaching residual plot analysis for linear regression
 * and hypothesis modification based on residual patterns.
 */

export const info = {
  // Problem Identification
  slug: 'residual-plot',

  // Display Information
  title: 'To Err is Human!',
  module: 'LinearRegression',
  difficulty: 'intermediate',

  // Multi-page configuration
  multiPage: true,
  totalPages: 10,

  // Page-specific content
  pages: [
    // Page 1: Dramatic Quote Introduction
    {
      pageNumber: 1,
      type: 'quote',
      prompt: {
        heading: 'To Err is Human!',
        quote: 'To Err is Human, To Err Randomly is Statistically Divine',
      },
      hasNextButton: true,
    },

    // Page 2: Normal Distribution Explanation
    {
      pageNumber: 2,
      type: 'explanation',
      prompt: {
        heading: 'The Bell Curve: Nature\'s Favorite Shape',
        body: `Normal distribution is a continuous probability distribution that is **symmetric about the mean**, depicting that **data near the mean are more frequent in occurrence than data far from the mean**.

This is the famous **Bell Curve**!`,
      },
      image: {
        path: '/assets/LinearRegression/ResidualPlot/normal.png',
        alt: 'Normal Distribution Bell Curve',
        caption: 'The Normal Distribution - Nature\'s most beautiful pattern',
      },
      formulaImage: {
        path: '/assets/LinearRegression/ResidualPlot/formula.png',
        alt: 'Normal Distribution Formula',
      },
      formulaExplanation: `where,

**x** is Random Variable (or data point)
**μ** is Mean
**σ** is Standard Deviation

If we replace μ as 0 and σ as 1, the resultant distribution is called **Standard Normal Distribution**, symmetric about x = 0`,
      credit: 'https://www.geeksforgeeks.org/maths/normal-distribution/',
      note: 'Please remember this formula and the graph, it will help you throughout your B.Tech',
      hasNextButton: true,
    },

    // Page 3: Sir Francis Galton Quote
    {
      pageNumber: 3,
      type: 'galton-quote',
      prompt: {
        heading: 'The Supreme Law',
      },
      image: {
        path: '/assets/LinearRegression/ResidualPlot/sirgalton.png',
        alt: 'Sir Francis Galton',
      },
      body: `Sir Francis Galton, a renowned statistician in his 1889 work, Natural Inheritance called the Normal Distribution as **"Supreme Law"**, awestruck by the distribution that he described the way large groups of "unfiltered" data points spontaneously organize themselves into the **Bell curve**`,
      hasNextButton: true,
    },

    // Page 4: Linear Regression Assumptions
    {
      pageNumber: 4,
      type: 'explanation',
      prompt: {
        heading: 'The Foundation of Linear Regression',
        body: `In Linear Regression, the fundamental assumption is that:

- Data distribution is a combination of a **signal** and **noise**
- The noise is **normally distributed**`,
      },
      image: {
        path: '/assets/LinearRegression/ResidualPlot/linregform.png',
        alt: 'Linear Regression Formula',
        caption: 'Y = f(X) + ε (Signal + Noise)',
      },
      explanation: `Here **Y** is the target variable

For each independent variable **X** (basically the features upon which the target variable is dependent)

- we have **f(X)**, a deterministic signal (basically a mathematically well defined function like quadratic, line, cubic, etc)
- A **random noise**, or deviation that follows normal distribution`,
      hasNextButton: true,
    },

    // Page 5: Residual Plot Introduction
    {
      pageNumber: 5,
      type: 'explanation',
      prompt: {
        heading: 'The Residual Plot: Our Gold Standard',
        body: `The problem boils down to finding the "Signal Pattern", such that the remaining noise is normally distributed.

If we can crack the **Deterministic Signal**, we have won the game!

For identifying the underlying pattern, we have a "Gold Standard"!

**The Residual Plot**`,
      },
      definition: `Residual plots are graphical representations of the residuals against the predictor variables in a regression analysis.

**X-Axis:** Fitted Values (Predicted Values)
**Y-Axis:** Residual (Residual = Observed Value - Predicted Value)`,
      resources: [
        {
          text: 'Residual Analysis - GeeksforGeeks',
          url: 'https://www.geeksforgeeks.org/maths/residual-analysis/',
        },
        {
          text: 'Residual Plots Explained - YouTube (StatQuest)',
          url: 'https://youtu.be/iMdtTCX2Q70?si=gC2UBrzzVsvO6m4l',
        },
        {
          text: 'How to Read Residual Plots - YouTube',
          url: 'https://youtu.be/_IlAuhLPi30?si=qSj9Sugx29J3pl_B',
        },
      ],
      hasNextButton: true,
    },

    // Page 6: Ideal Residual Plot
    {
      pageNumber: 6,
      type: 'explanation',
      prompt: {
        heading: 'The Ideal Residual Plot',
        body: `This is an ideal residual plot:`,
      },
      image: {
        path: '/assets/LinearRegression/ResidualPlot/idealresidual.png',
        alt: 'Ideal Residual Plot',
        caption: 'A perfect residual plot - random cloud around zero',
      },
      explanation: `See how the residuals form a **cloud** around the mean 0 line.

The cloud does not have any pattern! It looks completely random, and occupy almost the same region uniformly around the mean line (it is not thick or thin at any end).

This shows that our linear regression model has been able to **crack the signal function** and all that remains is the random (normally distributed) noise.

**We will be able to get very good predictions!**`,
      hasNextButton: true,
    },

    // Page 7: Bad Residual Plot (Red Flag)
    {
      pageNumber: 7,
      type: 'explanation',
      prompt: {
        heading: 'Red Flag Alert!',
        body: `This residual plot is a serious **Red Flag**:`,
      },
      image: {
        path: '/assets/LinearRegression/ResidualPlot/badresidual.png',
        alt: 'Bad Residual Plot showing pattern',
        caption: 'A problematic residual plot - clear pattern visible',
      },
      explanation: `Notice that we can clearly see a **pattern** in the residuals!

There is something that we are missing.

You can think as if our model is not yet able to determine what signal the data is following.

But! **It also gives us the hint, of how to tweak our model so that we can fit to the data better**`,
      hasNextButton: true,
    },

    // Page 8: Basic Approach
    {
      pageNumber: 8,
      type: 'explanation',
      prompt: {
        heading: 'The Diagnostic Workflow',
        body: `The basic way is that - We run a multiple linear regression after doing the feature selection and then analyse the residual plot

And then decide how to change the **hypothesis** (basically the prediction function which is h = w₀ + w₁x₁ + w₂x₂ + ......)`,
      },
      hasNextButton: true,
    },

    // Page 9: Multiple Choice Question
    {
      pageNumber: 9,
      type: 'multiple-choice',
      prompt: {
        heading: 'Hypothesis Modification Challenge',
        body: `So this is the residual plot that you get with respect to **x₂**:`,
      },
      image: {
        path: '/assets/LinearRegression/ResidualPlot/badresidual.png',
        alt: 'Residual plot showing quadratic pattern',
      },
      question: 'What do you think the change should be in the hypothesis?',
      options: [
        {
          id: 'option1',
          text: 'h = w₀ + w₁x₁ + w₂x₂ + w₃x₃ + ....',
          isCorrect: false,
        },
        {
          id: 'option2',
          text: 'h = w₀ + w₁x₁ + w₂x₂² + w₃x₃ + ...',
          isCorrect: true,
        },
        {
          id: 'option3',
          text: 'h = w₀ + w₁x₁² + w₂x₂² + w₃x₃² + ....',
          isCorrect: false,
        },
        {
          id: 'option4',
          text: 'h = w₀ + w₁x₁² + w₂x₂³ + w₃x₃⁴ + ....',
          isCorrect: false,
        },
      ],
      correctAnswer: 'option2',
      feedback: {
        correct: {
          title: 'Brilliant Analysis! 🎯',
          message: 'You correctly identified that x₂ needs a quadratic transformation!',
          explanation: 'The pattern clearly shows that there is a non-linear relationship, likely on the basis of the plot, a **quadratic relationship** with respect to x₂.',
          remark: 'By adding x₂² to the hypothesis, we can capture the curved pattern in the residuals, making our model fit the data much better.',
        },
        incorrect: {
          title: 'Not Quite! 🤔',
          message: 'Look at the pattern more carefully. The residuals follow a curved shape.',
          hint: 'The pattern is symmetric and curved, suggesting a polynomial relationship. Which specific feature needs the transformation?',
        },
      },
      answerExplanation: {
        title: 'Understanding the Solution',
        body: `The pattern clearly shows that there is a **non-linear relationship**, likely on the basis of the plot, a **quadratic relationship** with respect to **x₂**.

**Why option 2 is correct:**

The residual plot shows a **parabolic (U-shaped) pattern** specifically with respect to x₂. This indicates that the relationship between x₂ and the target variable is quadratic, not linear.

By modifying only the x₂ term to x₂² while keeping other features linear, we can capture this specific non-linearity without over-complicating the model.

**Why other options are wrong:**

- **Option 1:** Keeps everything linear, won't fix the pattern
- **Option 3:** Transforms ALL features to quadratic, which is unnecessary and can lead to overfitting
- **Option 4:** Uses different powers for different features without justification from the residual plot`,
      },
    },

    // Page 10: Completion/Hurray Page
    {
      pageNumber: 10,
      type: 'completion',
      prompt: {
        heading: 'Hurray! You\'ve Mastered Residual Analysis! 🎉',
        body: `You've successfully learned how to read residual plots and modify your hypothesis to capture non-linear patterns!

This skill is fundamental to building better regression models. By analyzing residual plots, you can identify when your model is missing important patterns and know exactly how to fix it.

Remember: **A good residual plot is a random cloud. Any pattern is a clue for improvement!**`,
      },
    },
  ],

  // Problem Content (for backward compatibility)
  prompt: {
    heading: 'To Err is Human!',
    body: 'A multi-page interactive problem about residual plot analysis and hypothesis modification.',
  },

  // Visual placeholder
  visualization: {
    type: 'interactive',
    path: null,
    alt: 'Interactive multi-page residual plot analysis challenge',
  },

  // Answer Configuration
  answer: {
    expert: 'Add quadratic term for x2: h = w₀ + w₁x₁ + w₂x₂² + w₃x₃ + ...',
    alternatives: [
      'quadratic x2',
      'x2 squared',
      'add x2^2',
      'square x2',
      'polynomial feature for x2',
    ],
    similarityThreshold: 0.70,
    maxLength: 200,
    minLength: 5,
  },

  // Feedback
  feedback: {
    correct: {
      title: 'Brilliant Analysis!',
      message: 'You correctly identified that x₂ needs a quadratic transformation based on the residual plot pattern!',
      explanation: 'The curved pattern in the residuals indicated a polynomial relationship. By adding x₂² to the hypothesis, we can capture this non-linearity and improve model fit.',
    },
    incorrect: {
      title: 'Not Quite',
      message: 'Look at the residual plot pattern carefully. What kind of curve does it resemble?',
      hint: 'The U-shaped pattern suggests a quadratic relationship with one specific feature.',
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
    'Look at the shape of the residual pattern - is it linear or curved?',
    'The pattern is symmetric and U-shaped, suggesting a polynomial relationship',
    'Only x₂ shows the problematic pattern - other features can remain linear',
  ],

  // Database sync metadata
  meta: {
    displayOrder: 3,
    isPublished: true,
    version: '1.0.0',
    createdAt: '2025-01-04',
    tags: ['residual-analysis', 'hypothesis-modification', 'polynomial-features', 'linear-regression'],
  },
};

export default info;
