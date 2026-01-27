/**
 * Gemini API Profanity Checker
 *
 * Uses Gemini 2.5 Flash to detect obscene/inappropriate usernames
 * Supports multiple API keys with automatic fallback
 */

// API Keys - Replace with your actual keys
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1 || 'YOUR_GEMINI_API_KEY_1',
  process.env.GEMINI_API_KEY_2 || 'YOUR_GEMINI_API_KEY_2',
  process.env.GEMINI_API_KEY_3 || 'YOUR_GEMINI_API_KEY_3',
];

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
}

interface ProfanityCheckResult {
  isObscene: boolean;
  apiWorked: boolean;
  fallbackRequired: boolean;
}

/**
 * Check username for profanity using Gemini API
 * Tries multiple API keys with fallback
 */
export async function checkUsernameProfanity(username: string): Promise<ProfanityCheckResult> {
  const prompt = `You are a content moderation system. Analyze the following username and determine if it contains any obscene, offensive, inappropriate, or profane content. Consider:
- Profanity in any language (English, Hindi, Spanish, etc.)
- Leetspeak or symbol substitutions (e.g., @ss, sh1t, f*ck)
- Hidden offensive words within the text
- Offensive slurs or hate speech
- Sexual or explicit references
- Drug references

Username to check: "${username}"

Especially check for - Hindi, Hinglish, Telugu, Marathi cuss and obscene words in local scripts or latin alphabets

Respond with ONLY: {"isObscene": true} or {"isObscene": false}`;

  // Try each API key
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];

    // Skip placeholder keys
    if (apiKey.startsWith('YOUR_')) {
      console.log(`[Gemini] Skipping placeholder API key ${i + 1}`);
      continue;
    }

    try {
      const response = await fetch(
        `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 500,
              responseMimeType: 'application/json',
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error(`[Gemini] API key ${i + 1} failed with status ${response.status}`);
        continue;
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        console.error(`[Gemini] API key ${i + 1} error:`, data.error.message);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.error(`[Gemini] API key ${i + 1} returned empty response`);
        continue;
      }

      // Parse the JSON response
      try {
        const result = JSON.parse(text);

        console.log(`[Gemini] API key ${i + 1} succeeded: isObscene=${result.isObscene}`);

        return {
          isObscene: result.isObscene === true,
          apiWorked: true,
          fallbackRequired: false,
        };
      } catch (parseError) {
        console.error(`[Gemini] API key ${i + 1} returned invalid JSON:`, text);
        continue;
      }
    } catch (error) {
      console.error(`[Gemini] API key ${i + 1} network error:`, error);
      continue;
    }
  }

  // All API keys failed - require fallback to structured username
  console.log('[Gemini] All API keys failed, fallback required');
  return {
    isObscene: false,
    apiWorked: false,
    fallbackRequired: true,
  };
}

/**
 * Validate structured username format (fallback)
 * Format: [IIT|IIB|IEC][2023-2025][001-500]
 */
export function validateStructuredUsername(prefix: string, year: number, number: number): string | null {
  const validPrefixes = ['IIT', 'IIB', 'IEC'];
  const validYears = [2023, 2024, 2025];

  if (!validPrefixes.includes(prefix)) {
    return 'Invalid prefix. Must be IIT, IIB, or IEC';
  }

  if (!validYears.includes(year)) {
    return 'Invalid year. Must be 2023, 2024, or 2025';
  }

  if (number < 1 || number > 500) {
    return 'Invalid number. Must be between 1 and 500';
  }

  return null; // Valid
}

/**
 * Generate structured username
 */
export function generateStructuredUsername(prefix: string, year: number, number: number): string {
  const paddedNumber = number.toString().padStart(3, '0');
  return `${prefix}${year}${paddedNumber}`;
}

export default {
  checkUsernameProfanity,
  validateStructuredUsername,
  generateStructuredUsername,
};
