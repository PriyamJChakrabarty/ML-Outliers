# Setup Scripts

Automated scripts to set up and manage your ML Outliers database and integrations.


  📚 Documentation Created

  - SETUP.md - Complete quick start guide        
  - scripts/README.md - Detailed scripts documentation
  - db.md - Full database schema (already existed)
  - supabase.md - Supabase setup guide (already existed)

  ---
  💡 Pro Tips

  1. For first-time setup: Use npm run setup:all 
  2. For troubleshooting: Use npm run db:test    
  3. For manual control: Use npm run db:manual   
  4. Check all docs: Read SETUP.md for complete guide


## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the master setup script
node scripts/setup-all.js
```

This will:
1. ✅ Check environment variables
2. ✅ Install missing dependencies
3. ⚠️ Guide you through manual database setup
4. ✅ Test database connection
5. ✅ Sync problems to database
6. ⚠️ Guide you through webhook setup

### Option 2: Manual Step-by-Step

#### 1. Set up Database

**Using Supabase SQL Editor (Recommended):**

```bash
# Generate SQL to copy-paste
node scripts/execute-sql-manually.js
```

Then:
1. Go to Supabase Dashboard → SQL Editor
2. Copy each SQL block from the output
3. Execute in order (01 → 05)

**Using the script (if RPC is available):**

```bash
node scripts/setup-database.js
```

#### 2. Test Connection

```bash
node scripts/test-connection.js
```

This verifies:
- ✅ Database connection
- ✅ Tables created
- ✅ Seed data inserted
- ✅ Materialized views created

#### 3. Sync Problems

```bash
node scripts/sync-problems.js
```

This syncs problem definitions from your registry to the database.

#### 4. Set Up Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks
2. Click "Add Endpoint"
3. Set URL: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the Signing Secret
6. Add to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   ```

**For local testing with ngrok:**

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
npx ngrok http 3000

# Use the ngrok URL for webhook endpoint
# Example: https://abc123.ngrok.io/api/webhooks/clerk
```

## Scripts Reference

### `setup-all.js`
**Purpose**: Master setup script that runs all steps in sequence.

**Usage**:
```bash
node scripts/setup-all.js
```

**What it does**:
- Checks environment variables
- Installs dependencies
- Guides through database setup
- Tests connections
- Syncs problems
- Shows webhook setup instructions

---

### `execute-sql-manually.js`
**Purpose**: Outputs all SQL migration files for manual execution.

**Usage**:
```bash
node scripts/execute-sql-manually.js
```

**What it does**:
- Reads all SQL files from `scripts/db/`
- Outputs formatted SQL for copy-paste
- Provides step-by-step instructions

**When to use**: When automated database setup fails or when you prefer manual control.

---

### `setup-database.js`
**Purpose**: Automatically executes SQL migrations via Supabase.

**Usage**:
```bash
node scripts/setup-database.js
```

**What it does**:
- Connects to Supabase
- Executes SQL files in order:
  1. `01-create-tables.sql`
  2. `02-seed-data.sql`
  3. `03-functions-triggers.sql`
  4. `04-materialized-views.sql`
  5. `05-rls-policies.sql`

**Note**: May fail if Supabase RPC is not available. Use `execute-sql-manually.js` instead.

---

### `test-connection.js`
**Purpose**: Verifies database setup.

**Usage**:
```bash
node scripts/test-connection.js
```

**What it tests**:
- ✅ Database connection
- ✅ All tables exist
- ✅ Seed data present
- ✅ Materialized views created
- ✅ Functions and triggers working

**Output**: Pass/fail report for each component.

---

### `sync-problems.js`
**Purpose**: Syncs problem definitions to database.

**Usage**:
```bash
node scripts/sync-problems.js
```

**What it does**:
- Reads problem definitions (currently using examples)
- Upserts to `problems` table
- Preserves existing data (uses `onConflict: 'slug'`)

**Customization**: Replace `EXAMPLE_PROBLEMS` with your registry import.

---

## SQL Migration Files

Located in `scripts/db/`:

### `01-create-tables.sql`
Creates all database tables:
- `badges`
- `modules`
- `problems`
- `users`
- `submissions`
- `user_progress`
- `user_achievements`
- `daily_streaks`

### `02-seed-data.sql`
Inserts initial data:
- 6 badge levels (Beginner → Master)
- 8 learning modules

### `03-functions-triggers.sql`
Creates database functions and triggers:
- `update_user_stats_after_submission()`
- `update_user_badge()`
- `calculate_current_streak()`
- `update_all_user_streaks()`
- `refresh_all_leaderboards()`

### `04-materialized-views.sql`
Creates leaderboard views:
- `leaderboard_global` (all-time rankings)
- `leaderboard_monthly` (current month)
- `leaderboard_weekly` (current week)

### `05-rls-policies.sql`
Sets up Row-Level Security:
- Users can only access their own data
- Public read access for published content
- Protects sensitive user information

---

## Environment Variables Required

Add these to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx  # Add after webhook setup

# Gemini API (for AI judge)
GEMINI_API_KEY=your_gemini_api_key
```

---

## Troubleshooting

### Database setup fails
**Solution**: Use manual setup:
```bash
node scripts/execute-sql-manually.js
```
Copy-paste SQL into Supabase SQL Editor.

### Connection test fails
**Causes**:
1. Wrong environment variables
2. Database not set up
3. RLS blocking queries

**Solution**:
1. Check `.env.local` values
2. Run database setup
3. Temporarily disable RLS for testing

### Webhook not working
**Causes**:
1. Wrong webhook URL
2. Missing signing secret
3. Events not subscribed

**Solution**:
1. Verify URL in Clerk Dashboard
2. Check `CLERK_WEBHOOK_SECRET` in `.env.local`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`

### Problems not syncing
**Causes**:
1. Database connection issues
2. Wrong module IDs

**Solution**:
1. Run `test-connection.js` first
2. Verify module IDs match database

---

## Development Workflow

### Daily Development
```bash
# Start app
npm run dev
```

### Adding New Problems
```bash
# 1. Add problem to registry
# 2. Sync to database
node scripts/sync-problems.js
```

### Testing Changes
```bash
# Run connection test
node scripts/test-connection.js
```

### Refreshing Leaderboards
Leaderboards auto-refresh every 5 minutes via cron.

**Manual refresh**:
```sql
-- In Supabase SQL Editor
SELECT refresh_all_leaderboards();
```

---

## Production Deployment

### Pre-deployment Checklist
- [ ] All SQL migrations executed in production database
- [ ] Environment variables set in hosting platform (Vercel)
- [ ] Clerk webhook URL updated to production domain
- [ ] Materialized view refresh cron job enabled
- [ ] Test user signup flow
- [ ] Verify leaderboard updates

### Post-deployment
```bash
# Test production database
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=prod_key \
node scripts/test-connection.js
```

---

## Getting Help

1. Check error messages in script output
2. Review `db.md` for schema details
3. Review `supabase.md` for setup guide
4. Check Supabase logs in dashboard
5. Verify environment variables

---

## Quick Reference

```bash
# Complete automated setup
node scripts/setup-all.js

# Manual database setup
node scripts/execute-sql-manually.js

# Test everything
node scripts/test-connection.js

# Sync problems
node scripts/sync-problems.js

# Start development
npm run dev
```
