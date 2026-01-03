/**
 * Master Setup Script
 * Runs all setup steps in sequence
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60) + '\n');
}

function checkEnvVariables() {
  header('Step 1: Checking Environment Variables');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    log('❌ Missing required environment variables:', 'red');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n💡 Please add these to your .env.local file');
    return false;
  }

  log('✅ All required environment variables found', 'green');
  return true;
}

function checkDependencies() {
  header('Step 2: Checking Dependencies');

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    );

    const requiredDeps = ['@supabase/supabase-js', '@clerk/nextjs', 'svix'];
    const missingDeps = requiredDeps.filter(
      dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );

    if (missingDeps.length > 0) {
      log('⚠️  Missing dependencies:', 'yellow');
      missingDeps.forEach(dep => console.log(`   - ${dep}`));
      log('\n📦 Installing missing dependencies...', 'cyan');
      execSync('npm install @supabase/supabase-js @clerk/nextjs svix', { stdio: 'inherit' });
    } else {
      log('✅ All dependencies installed', 'green');
    }

    return true;
  } catch (error) {
    log(`❌ Error checking dependencies: ${error.message}`, 'red');
    return false;
  }
}

function setupDatabase() {
  header('Step 3: Setting Up Database (Manual)');

  log('⚠️  Database setup requires manual execution in Supabase', 'yellow');
  console.log('\n📋 Instructions:');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Run: node scripts/execute-sql-manually.js');
  console.log('3. Copy and execute each SQL block in order\n');

  log('Would you like to see the SQL files now? (y/n)', 'cyan');
  log('For now, assuming manual setup. Continue with next steps...', 'yellow');

  return true;
}

function testConnection() {
  header('Step 4: Testing Database Connection');

  try {
    log('🔍 Running connection test...', 'cyan');
    execSync('node scripts/test-connection.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    log('❌ Connection test failed', 'red');
    log('💡 Make sure you have run the SQL migrations manually', 'yellow');
    return false;
  }
}

function syncProblems() {
  header('Step 5: Syncing Problems');

  try {
    log('🔄 Syncing problems to database...', 'cyan');
    execSync('node scripts/sync-problems.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    log('❌ Problem sync failed', 'red');
    return false;
  }
}

function setupWebhook() {
  header('Step 6: Clerk Webhook Setup');

  log('📋 Manual webhook setup required:', 'yellow');
  console.log('\n1. Go to Clerk Dashboard → Webhooks');
  console.log('2. Click "Add Endpoint"');
  console.log('3. Set URL: https://your-domain.com/api/webhooks/clerk');
  console.log('4. Subscribe to events: user.created, user.updated, user.deleted');
  console.log('5. Copy the Signing Secret');
  console.log('6. Add to .env.local: CLERK_WEBHOOK_SECRET=whsec_xxxxx');
  console.log('\n💡 For local testing, use ngrok:');
  console.log('   npx ngrok http 3000');
  console.log('   Use the ngrok URL for the webhook endpoint\n');

  return true;
}

function showNextSteps() {
  header('🎉 Setup Complete!');

  log('Next steps:', 'bright');
  console.log('1. Set up Clerk webhook (see instructions above)');
  console.log('2. Start your development server: npm run dev');
  console.log('3. Test the application:');
  console.log('   - Sign up a new user');
  console.log('   - Check Supabase to verify user creation');
  console.log('   - Navigate to /home');
  console.log('   - Click the leaderboard trophy icon');
  console.log('\n📚 Documentation:');
  console.log('   - Database schema: db.md');
  console.log('   - Supabase setup: supabase.md');
  console.log('   - Architecture: CLAUDE.md\n');
}

async function main() {
  log('🚀 ML Outliers - Complete Setup', 'bright');
  log('This script will guide you through the setup process\n', 'cyan');

  const steps = [
    { name: 'Environment Variables', fn: checkEnvVariables, required: true },
    { name: 'Dependencies', fn: checkDependencies, required: true },
    { name: 'Database Setup', fn: setupDatabase, required: false },
    { name: 'Connection Test', fn: testConnection, required: false },
    { name: 'Sync Problems', fn: syncProblems, required: false },
    { name: 'Webhook Setup', fn: setupWebhook, required: false },
  ];

  let allPassed = true;

  for (const step of steps) {
    const success = step.fn();
    if (!success && step.required) {
      log(`\n❌ Required step failed: ${step.name}`, 'red');
      log('Please fix the errors above and run the script again', 'yellow');
      process.exit(1);
    }
    if (!success) {
      allPassed = false;
    }
  }

  if (allPassed) {
    showNextSteps();
  } else {
    log('\n⚠️  Setup completed with warnings', 'yellow');
    log('Some manual steps may be required', 'yellow');
    showNextSteps();
  }
}

main().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
