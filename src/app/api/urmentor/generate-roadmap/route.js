const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const AVAILABLE_TOPICS = [
  'python_basics',
  'numpy_pandas_matplotlib',
  'eda_data_analysis',
  'feature_engineering',
  'linear_regression',
  'logistic_regression',
  'decision_trees',
  'random_forest',
  'ensemble_boosting',
  'knn_svm_naive_bayes',
  'clustering',
  'dimensionality_reduction',
  'cross_validation',
  'math_for_ml',
  'deep_learning_basics',
  'cnn_computer_vision',
  'rnn_lstm',
  'transformers',
  'nlp',
  'llms_genai',
  'reinforcement_learning',
  'mlops',
  'projects_competitions',
];

function buildPrompt(answers) {
  const { background, goal, hours, language, interests } = answers;

  return `You are an expert ML curriculum designer. Generate a personalized ML learning roadmap for a student.

MANDATORY TOPICS — these MUST appear somewhere in the roadmap:
- eda_data_analysis
- linear_regression
- logistic_regression

AVAILABLE TOPIC KEYS (only use keys from this list):
${AVAILABLE_TOPICS.join(', ')}

STUDENT PROFILE:
- Background: ${background}
- Goal: ${goal}
- Hours per week: ${hours}
- Language preference: ${language}
- Areas of interest: ${interests.length > 0 ? interests.join(', ') : 'General ML'}

RULES:
1. eda_data_analysis, linear_regression, logistic_regression MUST be included — no exceptions.
2. If background is "Complete Beginner" or "Beginner (can code)", always start with python_basics and numpy_pandas_matplotlib.
3. If background is "Advanced", skip python_basics and numpy_pandas_matplotlib.
4. If hours < 10/week, create a focused roadmap with fewer topics (5-8 topics max).
5. If hours >= 10/week, create a comprehensive roadmap.
6. Match interest areas to topics: NLP → nlp; Computer Vision → cnn_computer_vision; LLMs/GenAI → transformers + llms_genai; MLOps → mlops; Reinforcement Learning → reinforcement_learning + deep_learning_basics; Deep Learning → deep_learning_basics.
7. For Data Scientist goal: emphasize eda, feature_engineering, clustering, cross_validation.
8. For ML Engineer goal: emphasize mlops, ensemble_boosting, cross_validation.
9. Always end with projects_competitions.
10. Keep phases between 3–5. Each phase should flow logically from the previous.
11. The "why" field should be 1 concise sentence tailored to THIS student's goal.

Return ONLY valid JSON matching this schema exactly — no markdown, no backticks, no explanation:
{
  "roadmapTitle": "string",
  "estimatedDuration": "e.g. 3-4 months",
  "personalizedMessage": "2 sentences max — why this roadmap is right for this specific student",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseTitle": "string",
      "weekEstimate": "e.g. Weeks 1-2",
      "description": "1 sentence describing the phase goal",
      "topics": [
        {
          "topicKey": "one key from AVAILABLE TOPIC KEYS",
          "topicTitle": "human-readable display name",
          "why": "1 sentence: why this topic matters for this student's specific goal"
        }
      ]
    }
  ]
}`;
}

export async function POST(request) {
  const apiKey = process.env.URMENTOR_GEMINI_API_KEY;
  const model = process.env.URMENTOR_GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey || apiKey === 'your_urmentor_gemini_api_key_here') {
    return Response.json(
      { error: 'UrMentor Gemini API key is not configured. Set URMENTOR_GEMINI_API_KEY in .env.local.' },
      { status: 503 }
    );
  }

  let answers;
  try {
    answers = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { background, goal, hours, language, interests } = answers;
  if (!background || !goal || !hours || !language) {
    return Response.json({ error: 'Missing required answer fields.' }, { status: 400 });
  }

  const prompt = buildPrompt({ background, goal, hours, language, interests: interests || [] });

  try {
    const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[UrMentor] Gemini API error:', response.status, errText);
      return Response.json(
        { error: `Gemini API returned ${response.status}. Check your URMENTOR_GEMINI_API_KEY.` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return Response.json({ error: 'Gemini returned an empty response.' }, { status: 502 });
    }

    let roadmap;
    try {
      roadmap = JSON.parse(rawText);
    } catch {
      console.error('[UrMentor] Failed to parse Gemini JSON:', rawText);
      return Response.json({ error: 'Gemini returned malformed JSON. Try again.' }, { status: 502 });
    }

    return Response.json({ roadmap });
  } catch (err) {
    console.error('[UrMentor] Network error calling Gemini:', err);
    return Response.json({ error: 'Failed to reach Gemini API. Check your connection.' }, { status: 500 });
  }
}
