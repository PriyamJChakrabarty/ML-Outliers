import * as dotenv from 'dotenv';

// Load env vars first
dotenv.config({ path: '.env.local' });

const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1 || '',
  process.env.GEMINI_API_KEY_2 || '',
  process.env.GEMINI_API_KEY_3 || '',
];

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function checkProfanity(username: string) {
  const prompt = `You are a content moderation system. Analyze the following username and determine if it contains any obscene, offensive, inappropriate, or profane content. Consider:
- Profanity in any language (English, Hindi, Spanish, etc.)
- Leetspeak or symbol substitutions (e.g., @ss, sh1t, f*ck)
- Hidden offensive words within the text
- Offensive slurs or hate speech
- Sexual or explicit references
- Drug references

Username to check: "${username}"

Especially check for - Hindi, Hinglish, Telugu, Marathi cuss and obscene words in local scripts or latin alphabets

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{"isObscene": true/false, "reason": "brief explanation if obscene, or 'clean' if not"}`;

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];

    if (!apiKey) {
      console.log(`[API ${i + 1}] No key configured, skipping...`);
      continue;
    }

    console.log(`[API ${i + 1}] Trying...`);

    try {
      const response = await fetch(
        `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              temperature: 0.1, 
              maxOutputTokens: 500, // Increased to give it breathing room
              responseMimeType: "application/json" // This is the magic line
            },
            // Adding safety settings prevents the model from "freezing" on bad words
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.log(`[API ${i + 1}] Failed with status ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.error) {
        console.log(`[API ${i + 1}] Error: ${data.error.message}`);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.log(`[API ${i + 1}] Empty response`);
        continue;
      }

      console.log(`[API ${i + 1}] Raw response: ${text}`);

      // Parse JSON
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleanedText);

      console.log('\n========== RESULT ==========');
      console.log(`Username: "${username}"`);
      console.log(`Is Obscene: ${result.isObscene}`);
      console.log(`Reason: ${result.reason}`);
      console.log('============================\n');

      return result;
    } catch (error) {
      console.log(`[API ${i + 1}] Error:`, error);
      continue;
    }
  }

  // console.log(`[API 1] Raw response length: ${text.length}`);
  // console.log(`[API 1] Raw response: ${text}`);

  console.log('\n❌ All API keys failed!');
  return null;
}

// Get username from command line
const username = process.argv[2];

if (!username) {
  console.log('Usage: npx tsx scripts/test-profanity.ts <username>');
  console.log('Example: npx tsx scripts/test-profanity.ts fucku247');
  process.exit(1);
}

console.log(`\n🔍 Testing profanity check for: "${username}"\n`);
checkProfanity(username).then(() => process.exit(0));
