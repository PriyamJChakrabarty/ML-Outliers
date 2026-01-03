/**
 * Supabase CLI Setup Script
 * Automatically executes database migrations using Supabase CLI
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors
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

function checkSupabaseCLI() {
  header('Step 1: Checking Supabase CLI');

  try {
    const version = execSync('supabase --version', { encoding: 'utf8' });
    log(`✅ Supabase CLI installed: ${version.trim()}`, 'green');
    return true;
  } catch (error) {
    log('❌ Supabase CLI not found', 'red');
    log('\n💡 Install it with:', 'yellow');
    log('   npm install -g supabase', 'cyan');
    log('   OR');
    log('   brew install supabase/tap/supabase (macOS)', 'cyan');
    log('   OR');
    log('   scoop install supabase (Windows)', 'cyan');
    return false;
  }
}

function checkEnvironmentVariables() {
  header('Step 2: Checking Environment Variables');

  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    log('❌ Missing environment variables:', 'red');
    missing.forEach(key => console.log(`   - ${key}`));
    log('\n💡 Add these to your .env.local file', 'yellow');
    return false;
  }

  log('✅ All required environment variables found', 'green');
  return true;
}

function linkToSupabase() {
  header('Step 3: Linking to Supabase Project');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];

  log(`🔗 Linking to project: ${projectRef}`, 'cyan');

  try {
    // Check if already linked
    try {
      const status = execSync('supabase status', { encoding: 'utf8', stdio: 'pipe' });
      log('✅ Already linked to Supabase project', 'green');
      return true;
    } catch {
      // Not linked, continue to link
    }

    // Link to project
    log('\n⚠️  You will be prompted to login to Supabase CLI', 'yellow');
    log('   Follow the instructions in your browser\n', 'yellow');

    // First, login
    try {
      execSync('supabase login', { stdio: 'inherit' });
    } catch (error) {
      // User might already be logged in
    }

    // Then link
    execSync(`supabase link --project-ref ${projectRef}`, { stdio: 'inherit' });

    log('\n✅ Successfully linked to Supabase project', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to link to Supabase project', 'red');
    log(`\n💡 Error: ${error.message}`, 'yellow');
    return false;
  }
}

function executeMigration() {
  header('Step 4: Executing Database Migration');

  const migrationFile = path.join(__dirname, 'combined-migration.sql');

  if (!fs.existsSync(migrationFile)) {
    log('❌ Migration file not found', 'red');
    log(`   Expected: ${migrationFile}`, 'yellow');
    return false;
  }

  log('📄 Executing combined-migration.sql...', 'cyan');

  try {
    // Read the SQL file
    const sql = fs.readFileSync(migrationFile, 'utf8');

    // Execute using supabase db execute
    // We need to use db password from connection string or service role key
    const dbUrl = process.env.DATABASE_URL || buildDatabaseUrl();

    if (!dbUrl) {
      log('⚠️  DATABASE_URL not found, using alternative method...', 'yellow');

      // Write SQL to temp file and execute
      const tempFile = path.join(__dirname, 'temp-migration.sql');
      fs.writeFileSync(tempFile, sql);

      execSync(`supabase db execute --file ${tempFile}`, {
        stdio: 'inherit',
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });

      // Clean up
      fs.unlinkSync(tempFile);
    } else {
      // Execute with psql
      const tempFile = path.join(__dirname, 'temp-migration.sql');
      fs.writeFileSync(tempFile, sql);

      execSync(`supabase db execute --file ${tempFile}`, { stdio: 'inherit' });

      fs.unlinkSync(tempFile);
    }

    log('\n✅ Migration executed successfully!', 'green');
    return true;
  } catch (error) {
    log('❌ Migration failed', 'red');
    log(`\n💡 Error: ${error.message}`, 'yellow');
    log('\n🔍 Trying alternative method...', 'cyan');

    // Try using psql directly
    return executeMigrationDirectly();
  }
}

function executeMigrationDirectly() {
  try {
    const migrationFile = path.join(__dirname, 'combined-migration.sql');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];

    log('📡 Executing via direct database connection...', 'cyan');

    execSync(`supabase db push --linked`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    log('✅ Migration executed successfully!', 'green');
    return true;
  } catch (error) {
    log('❌ Direct execution also failed', 'red');
    log('\n💡 Manual execution required:', 'yellow');
    log('   1. Go to Supabase Dashboard → SQL Editor', 'cyan');
    log('   2. Copy contents of scripts/combined-migration.sql', 'cyan');
    log('   3. Paste and execute in SQL Editor', 'cyan');
    return false;
  }
}

function buildDatabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  const projectRef = url.split('//')[1].split('.')[0];
  return `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;
}

function verifySetup() {
  header('Step 5: Verifying Setup');

  log('🔍 Running connection test...', 'cyan');

  try {
    execSync('node scripts/test-connection.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    log('⚠️  Verification had warnings', 'yellow');
    return false;
  }
}

async function main() {
  log('🚀 Supabase CLI Database Setup', 'bright');
  log('Automated database migration using Supabase CLI\n', 'cyan');

  const steps = [
    { name: 'Supabase CLI Check', fn: checkSupabaseCLI, required: true },
    { name: 'Environment Variables', fn: checkEnvironmentVariables, required: true },
    { name: 'Link to Supabase', fn: linkToSupabase, required: true },
    { name: 'Execute Migration', fn: executeMigration, required: true },
    { name: 'Verify Setup', fn: verifySetup, required: false },
  ];

  let allPassed = true;

  for (const step of steps) {
    const success = step.fn();
    if (!success && step.required) {
      log(`\n❌ Required step failed: ${step.name}`, 'red');
      log('Please fix the errors above and run again', 'yellow');
      process.exit(1);
    }
    if (!success) {
      allPassed = false;
    }
  }

  if (allPassed) {
    header('🎉 Setup Complete!');
    log('Your database is ready to use!', 'green');
    log('\n📋 Next steps:', 'bright');
    log('1. Run: npm run db:sync-problems', 'cyan');
    log('2. Start your app: npm run dev', 'cyan');
    log('3. Test the application', 'cyan');
  } else {
    log('\n⚠️  Setup completed with warnings', 'yellow');
    log('Some steps may require manual intervention', 'yellow');
  }
}

main().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
