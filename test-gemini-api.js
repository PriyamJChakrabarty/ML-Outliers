/**
 * TEST GEMINI API KEYS
 *
 * Run with: node test-gemini-api.js
 *
 * Tests each Gemini API key by asking "What is the capital of India?"
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

const GEMINI_API_KEYS = [
  { name: 'GEMINI_API_KEY_1', key: process.env.GEMINI_API_KEY_1 },
  { name: 'GEMINI_API_KEY_2', key: process.env.GEMINI_API_KEY_2 },
  { name: 'GEMINI_API_KEY_3', key: process.env.GEMINI_API_KEY_3 },
];

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function testApiKey(name, apiKey) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing: ${name}`);
  console.log('='.repeat(50));

  if (!apiKey) {
    console.log('❌ NOT SET - Key is empty or undefined');
    return { name, success: false, error: 'NOT SET' };
  }

  console.log(`Key (first 10 chars): ${apiKey.substring(0, 10)}...`);

  const prompt = 'What is the capital of India? Reply in one word only.';

  try {
    console.log('\n📤 Sending request...');

    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50,
          },
        }),
      }
    );

    console.log(`📥 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ FAILED - HTTP ${response.status}`);
      console.log(`Error: ${errorText}`);
      return { name, success: false, error: `HTTP ${response.status}`, details: errorText };
    }

    const data = await response.json();

    if (data.error) {
      console.log(`❌ FAILED - API Error`);
      console.log(`Error: ${data.error.message}`);
      return { name, success: false, error: 'API Error', details: data.error.message };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.log(`❌ FAILED - Empty response`);
      console.log(`Full response: ${JSON.stringify(data, null, 2)}`);
      return { name, success: false, error: 'Empty response' };
    }

    console.log(`\n✅ SUCCESS!`);
    console.log(`Question: ${prompt}`);
    console.log(`Answer: ${text.trim()}`);

    return { name, success: true, answer: text.trim() };

  } catch (error) {
    console.log(`❌ FAILED - Network error`);
    console.log(`Error: ${error.message}`);
    return { name, success: false, error: 'Network error', details: error.message };
  }
}

async function main() {
  console.log('\n' + '🔑'.repeat(25));
  console.log('    GEMINI API KEY TESTER');
  console.log('🔑'.repeat(25));
  console.log(`\nModel: ${GEMINI_MODEL}`);
  console.log(`Test Question: "What is the capital of India?"`);

  const results = [];

  for (const { name, key } of GEMINI_API_KEYS) {
    const result = await testApiKey(name, key);
    results.push(result);
  }

  // Summary
  console.log('\n\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));

  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Working keys: ${working.length}/${results.length}`);
  working.forEach(r => console.log(`   - ${r.name}: "${r.answer}"`));

  if (failed.length > 0) {
    console.log(`\n❌ Failed keys: ${failed.length}/${results.length}`);
    failed.forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  }

  console.log('\n');
}

main().catch(console.error);
