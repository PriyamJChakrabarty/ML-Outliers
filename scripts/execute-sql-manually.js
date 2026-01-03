/**
 * Manual SQL Executor
 * Use this when Supabase RPC doesn't work
 * Copy-paste the output into Supabase SQL Editor
 */

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

console.log('📋 SQL Migration Files Ready for Manual Execution\n');
console.log('=' .repeat(60));
console.log('\n📍 Instructions:');
console.log('1. Go to Supabase Dashboard → SQL Editor');
console.log('2. Click "New Query"');
console.log('3. Copy each SQL block below and execute in order\n');
console.log('=' .repeat(60));

SQL_FILES.forEach((file, index) => {
  const filePath = path.join(__dirname, 'db', file);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`STEP ${index + 1}: ${file}`);
  console.log('='.repeat(60));
  console.log(sql);
});

console.log('\n\n' + '='.repeat(60));
console.log('✅ All SQL files displayed above');
console.log('=' .repeat(60));
console.log('\n📌 After executing all files, run:');
console.log('   node scripts/test-connection.js\n');
