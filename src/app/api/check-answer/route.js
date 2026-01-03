import { pipeline, cos_sim } from '@xenova/transformers';

/**
 * Semantic Answer Checker API
 *
 * Uses Transformers.js with MiniLM model for semantic similarity
 * Local inference - no external API calls needed!
 *
 * SCALABILITY: Runs on-device, handles concurrent requests
 * MODULARITY: Independent answer checking service
 * DEPLOYABILITY: Works in serverless/edge environments
 */

// Cache the model pipeline (loaded once, reused for all requests)
let extractor = null;

async function getExtractor() {
  if (!extractor) {
    // Use MiniLM model for semantic similarity
    // This model is small (~23MB) and fast
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return extractor;
}

/**
 * Calculate semantic similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Cosine similarity score (0-1)
 */
async function calculateSimilarity(text1, text2) {
  const model = await getExtractor();

  // Get embeddings for both texts
  const output1 = await model(text1, { pooling: 'mean', normalize: true });
  const output2 = await model(text2, { pooling: 'mean', normalize: true });

  // Calculate cosine similarity
  const similarity = cos_sim(output1.data, output2.data);

  return similarity;
}

/**
 * Check if answer is correct using multiple strategies
 */
function checkAnswer(userAnswer, expertAnswer, alternatives, threshold) {
  const userLower = userAnswer.toLowerCase().trim();
  const expertLower = expertAnswer.toLowerCase().trim();

  // Strategy 1: Exact match
  if (userLower === expertLower) {
    return { isCorrect: true, method: 'exact', similarity: 1.0 };
  }

  // Strategy 2: Check alternatives (if provided)
  if (alternatives && alternatives.length > 0) {
    const isInAlternatives = alternatives.some(
      alt => userLower === alt.toLowerCase().trim()
    );
    if (isInAlternatives) {
      return { isCorrect: true, method: 'alternative', similarity: 1.0 };
    }
  }

  // Strategy 3: Semantic similarity will be checked by caller
  return { isCorrect: false, method: 'pending-semantic', similarity: 0 };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      problemId,
      userAnswer,
      expertAnswer,
      threshold = 0.75,
      alternatives = [],
    } = body;

    // Validation
    if (!problemId || !userAnswer || !expertAnswer) {
      return Response.json(
        {
          error: 'Missing required fields: problemId, userAnswer, expertAnswer',
        },
        { status: 400 }
      );
    }

    if (userAnswer.trim().length === 0) {
      return Response.json(
        {
          error: 'Answer cannot be empty',
        },
        { status: 400 }
      );
    }

    // First, try exact/alternative matching (fast)
    const quickCheck = checkAnswer(userAnswer, expertAnswer, alternatives, threshold);

    if (quickCheck.isCorrect) {
      return Response.json({
        isCorrect: true,
        similarity: quickCheck.similarity,
        method: quickCheck.method,
        problemId,
      });
    }

    // If no exact match, use semantic similarity (slower but accurate)
    console.log(`[${problemId}] Performing semantic similarity check...`);

    const similarity = await calculateSimilarity(
      userAnswer.toLowerCase().trim(),
      expertAnswer.toLowerCase().trim()
    );

    console.log(`[${problemId}] Similarity: ${similarity.toFixed(3)} (threshold: ${threshold})`);

    const isCorrect = similarity >= threshold;

    return Response.json({
      isCorrect,
      similarity,
      method: 'semantic',
      problemId,
      threshold,
    });

  } catch (error) {
    console.error('Error checking answer:', error);

    return Response.json(
      {
        error: 'Failed to process answer',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
