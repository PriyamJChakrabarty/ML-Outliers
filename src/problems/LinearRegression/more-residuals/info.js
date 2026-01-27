/**
 * Problem: More about Residuals!
 * Module: Linear Regression
 *
 * A multi-page problem teaching interaction detection using residual plots
 */

export const info = {
  // Problem Identification
  slug: 'more-residuals',

  // Display Information
  title: 'More about Residuals!',
  module: 'LinearRegression',
  difficulty: 'intermediate',

  // Multi-page configuration
  multiPage: true,
  totalPages: 11,

  // Page-specific content
  pages: [
    // Page 1: John W. Tukey Quote
    {
      pageNumber: 1,
      type: 'dramatic-quote-large',
      quote: '"If one technique of data analysis were to be exalted above all others for its ability to be revealing to the mind… the simple graph has brought more information to the data analyst\'s mind than any other device."',
      author: 'John W. Tukey, father of Exploratory Data Analysis (EDA)',
      hasNextButton: true,
    },

    // Page 2: Introduction to residual plots
    {
      pageNumber: 2,
      type: 'introduction',
      prompt: {
        heading: 'Residual Plots: Diagnostic Powerhouses',
        body: `Residual plots are diagnostic powerhouses.

In the next few examples, you'll see residual plots expose different issues—each time showing you exactly where there are scope for improvement.

They can tell you when your model is lying to you, when it's missing something important, and when your assumptions are falling apart.`,
      },
      hasNextButton: true,
    },

    // Page 3: Missing interaction between terms
    {
      pageNumber: 3,
      type: 'explanation',
      prompt: {
        heading: 'Missing Interaction Between Terms',
        body: `In linear regression, we assume each predictor affects the "Signal" independently. However, a missing interaction occurs when the effect of one predictor depends on the value of another—like how the impact of "Heat" on "Comfort" changes based on "Humidity."

When an interaction is missing, the model fails to capture this joint behavior, causing predictive information to "leak" into the residuals.

To solve this, first we need to find out which features have an interaction!

Residual plots actually help us find those.`,
      },
      hasNextButton: true,
    },

    // Page 4: Interaction Plot explanation
    {
      pageNumber: 4,
      type: 'explanation-with-links',
      prompt: {
        heading: 'Interaction Plots',
        body: `A simple 2D plot between independent feature X1 and the target variable Y, but also "color coding" the data points based on their values of another independent feature X2, and see if there is any pattern!`,
      },
      resources: [
        {
          text: 'To learn more about Interaction Plots -',
          links: [
            {
              url: 'https://interactions.jacob-long.com/articles/interactions',
              description: 'Note that this is R library, but gives conceptual understanding about interaction plot'
            },
            {
              url: 'https://seaborn.pydata.org/tutorial/regression.html',
              description: 'official documentation of Seaborn, use the hue parameter to visualize how the "Signal" changes across different categories.'
            }
          ]
        }
      ],
      hasNextButton: true,
    },

    // Page 5: Distinct feature X2 (categorical)
    {
      pageNumber: 5,
      type: 'image-with-explanation',
      prompt: {
        heading: 'For Distinct Feature X2',
        body: `For distinct feature X2, we colour code the data points based on different categories

Here Y = Petal Length, X1 = Petal Width, X2 = Species`,
      },
      image: '/assets/LinearRegression/MoreResiduals/intcategory.png',
      explanation: [
        'Look how the three different categories are represented by three colours',
        'The three lines show the best fit lines across each category'
      ],
      hasNextButton: true,
    },

    // Page 6: Continuous feature X2
    {
      pageNumber: 6,
      type: 'image-with-explanation',
      prompt: {
        heading: 'For Continuous Feature X2',
        body: `For continuous feature X2, we colour code based on some threshold - like z

More like one colour for all X2 values < mean(X2) - z, one for all X2 values > mean(X2) + z, and another for all values in between

See the below image, Murder is the X2 chosen and the Standard Deviation (SD) of it is the value of z`,
      },
      image: '/assets/LinearRegression/MoreResiduals/intregression.png',
      hasNextButton: true,
    },

    // Page 7: Identifying interaction using residual plots
    {
      pageNumber: 7,
      type: 'explanation-with-whisper',
      prompt: {
        heading: 'Identifying Interaction Using Residual Plots',
        body: `Now that we know about Interaction Plots, let us look into identifying interaction between features using residual plots.

But we do not need to check for all the feature combinations, we just need to check for the features which do not fit into the regression assumptions of the current model

I hope you remember how to do it!`,
        whisper: 'Just see if the residual plot follows a pattern, or is a random cloud!'
      },
      hasNextButton: true,
    },

    // Page 8: Interaction visualization example
    {
      pageNumber: 8,
      type: 'image-with-explanation',
      prompt: {
        heading: 'Visualizing Interactions',
        body: `To see the interaction, we take the residual plot of Y vs X1 feature, and generate an interaction plot with another feature X2`,
      },
      image: '/assets/LinearRegression/MoreResiduals/intploteg.png',
      hasNextButton: true,
    },

    // Page 9: Quiz - Jake Sully interaction detection
    {
      pageNumber: 9,
      type: 'multi-select-quiz',
      prompt: {
        heading: 'Jake Sully\'s Farm',
        body: `Jake Sully is now living a peaceful life after the 2nd Pandorian War. He has now become a farmer. His son Lo'ak has collected data related to previous crop yields. Jake wants to find out if some features interact and determine crop yield together? He has created several Residual Interaction Plots. Observe and flag the possible interactions (We are not concerned if the residual plots show any pattern like parabolic profile etc, we are more concerned if the colours form distinct groups or appear together - indicating interaction)`,
        remark: 'See if the color coding is not random, but instead kind of divides the cloud in groups or follow some distinct patterns (the color follows a pattern - not the overall graph)'
      },
      options: [
        { label: 'Soil pH - Nitrogen Levels', value: 'option1', image: '/assets/LinearRegression/MoreResiduals/plot1.png' },
        { label: 'Precipitation - Average Temp', value: 'option2', image: '/assets/LinearRegression/MoreResiduals/plot2.png' },
        { label: 'Seed Quantity - Irrigation Type', value: 'option3', image: '/assets/LinearRegression/MoreResiduals/plot3.png' },
        { label: 'Pest Density - Sunlight Hours', value: 'option4', image: '/assets/LinearRegression/MoreResiduals/plot4.png' },
        { label: 'Fertilizer Brand - Planting Date', value: 'option5', image: '/assets/LinearRegression/MoreResiduals/plot5.png' },
      ],
      correctAnswers: ['option2', 'option5'],
    },

    // Page 10: Solution - Adding interaction term
    {
      pageNumber: 10,
      type: 'summary-with-equation',
      prompt: {
        heading: 'Adding Interaction Terms',
        body: `Once you have flagged the interactions between variables like X1 and X2, the next step is to incorporate their joint influence into your model.

You simply add a new "Interaction Term" (X1 * X2) into your hypothesis.`,
        equation: 'y = β₀ + β₁(X1) + β₂(X2) + β₃(X1 × X2) + ε'
      },
      hasNextButton: true,
    },

    // Page 11: Completion/Hurray Page
    {
      pageNumber: 11,
      type: 'completion',
      prompt: {
        heading: 'Hurray! 🎉',
        body: 'You have finished the exercise!',
      },
    },
  ],

  // Problem Content (for backward compatibility)
  prompt: {
    heading: 'More about Residuals!',
    body: 'A multi-page interactive problem about detecting interactions using residual plots.',
  },

  // Visual placeholder
  visualization: {
    type: 'interactive',
    path: null,
    alt: 'Interactive multi-page residual plots and interaction detection challenge',
  },

  // Answer Configuration
  answer: {
    expert: 'Residual plots help identify missing interactions between features',
    alternatives: [
      'interaction detection',
      'residual interaction plots',
      'missing interactions',
    ],
    similarityThreshold: 0.70,
    maxLength: 200,
    minLength: 5,
  },

  // Feedback
  feedback: {
    correct: {
      title: 'Perfect Analysis!',
      message: 'You correctly identified the interactions using residual plots!',
      explanation: 'When residual plots show distinct patterns based on color coding, it indicates missing interactions.',
    },
    incorrect: {
      title: 'Think Again',
      message: 'Look at how the residuals are distributed based on different feature values.',
      hint: 'Look for patterns where different colors form distinct groups rather than random clouds.',
    },
  },

  // Points & Rewards
  scoring: {
    basePoints: 250,
    timeBonusPoints: 150,
    maxTimeForBonus: 480, // seconds
  },

  // Hints System
  hints: [
    'Look for residual plots where colors form distinct groups or patterns',
    'Random clouds indicate no interaction, while structured patterns suggest interaction',
    'The correct answers show clear separation or grouping based on color coding',
  ],

  // Database sync metadata
  meta: {
    displayOrder: 4,
    isPublished: true,
    version: '1.0.0',
    createdAt: '2025-01-04',
    tags: ['residual-plots', 'interaction-detection', 'linear-regression', 'diagnostics'],
  },
};

export default info;
