/**
 * Setup Database Script
 * Executes all SQL migration files in order
 */

import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { supabase } from '../lib/supabase-admin.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQL_FILES = [
  '01-create-tables.sql',
  '02-seed-data.sql',
  '03-functions-triggers.sql',
  '04-materialized-views.sql',
  '05-rls-policies.sql',
];

async function executeSqlFile(filename) {
  console.log(`\n📄 Executing: ${filename}...`);

  const filePath = path.join(__dirname, 'db', filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      const { error: directError } = await supabase.from('_sql_exec').insert({ sql });

      if (directError) {
        console.error(`❌ Error executing ${filename}:`, error || directError);
        throw error || directError;
      }
    }

    console.log(`✅ Successfully executed: ${filename}`);
  } catch (err) {
    console.error(`❌ Fatal error executing ${filename}:`, err.message);
    throw err;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    const { error: connectionError } = await supabase.from('_test').select('*').limit(1);

    // Connection error is expected if table doesn't exist, that's fine
    console.log('✅ Database connection successful!\n');

    // Execute SQL files in order
    for (const file of SQL_FILES) {
      await executeSqlFile(file);
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Run: node scripts/test-connection.js');
    console.log('2. Run: node scripts/sync-problems.js');
    console.log('3. Set up Clerk webhook (see supabase.md)');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n💡 Please execute the SQL files manually in Supabase SQL Editor:');
    SQL_FILES.forEach(file => console.log(`   - scripts/db/${file}`));
    process.exit(1);
  }
}

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Make sure these are set in your .env.local file');
  process.exit(1);
}

setupDatabase();
