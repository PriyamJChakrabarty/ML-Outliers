# Supabase Setup Guide

This guide walks you through setting up Supabase for ML Outliers, including database configuration, authentication integration with Clerk, and deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Setup](#database-schema-setup)
4. [Environment Variables](#environment-variables)
5. [Clerk + Supabase Integration](#clerk--supabase-integration)
6. [Database Client Setup](#database-client-setup)
7. [Running Migrations](#running-migrations)
8. [Setting Up Cron Jobs](#setting-up-cron-jobs)
9. [Testing the Setup](#testing-the-setup)
10. [Development Workflow](#development-workflow)
11. [Production Deployment](#production-deployment)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ A Supabase account ([supabase.com](https://supabase.com))
- ✅ A Clerk account ([clerk.com](https://clerk.com))
- ✅ Git installed
- ✅ This project cloned locally

---

## Supabase Project Setup

### 1. Create a New Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Organization**: Select or create one
   - **Name**: `ml-outliers` (or any name you prefer)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

### 2. Get Your Project Credentials

Once the project is ready:

1. Go to **Settings** (gear icon) → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (for admin operations, keep this secret!)

3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

---

## Database Schema Setup

### Method 1: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open `db.md` in this repository
4. Copy each SQL block and execute them **in order**:

#### Step 1: Create Core Tables

```sql
-- Execute these in order:
-- 1. badges table (no dependencies)
-- 2. modules table
-- 3. problems table (depends on modules)
-- 4. users table (depends on badges)
-- 5. user_progress table (depends on users, problems)
-- 6. submissions table (depends on users, problems)
-- 7. user_achievements table
-- 8. daily_streaks table
```

Run each `CREATE TABLE` statement one by one from `db.md`.

#### Step 2: Insert Seed Data

```sql
-- Insert badge data
INSERT INTO badges (name, description, icon_emoji, required_points, required_exercises, rank_level) VALUES
('Beginner', 'Just getting started', '🌱', 0, 0, 1),
('Apprentice', 'Learning the ropes', '📚', 1000, 10, 2),
('Intermediate', 'Building expertise', '⚙️', 2500, 25, 3),
('Advanced', 'Strong understanding', '🎓', 5000, 40, 4),
('Expert', 'Mastered the fundamentals', '🥇', 8000, 60, 5),
('Master', 'Elite data scientist', '🏆', 12000, 80, 6);
```

```sql
-- Insert module data (example)
INSERT INTO modules (slug, name, description, display_order, is_published) VALUES
('linear-regression', 'Linear Regression', 'Master the fundamentals of linear regression', 1, true),
('logistic-regression', 'Logistic Regression', 'Learn classification with logistic regression', 2, false),
('decision-trees', 'Decision Trees', 'Understand tree-based models', 3, false);
```

#### Step 3: Create Functions & Triggers

Copy and execute all functions and triggers from `db.md`:
- `update_user_stats_after_submission()`
- `update_user_badge()`
- `calculate_current_streak()`
- `refresh_all_leaderboards()`

#### Step 4: Create Materialized Views

```sql
-- Execute materialized view creation statements
-- 1. leaderboard_global
-- 2. leaderboard_monthly
-- 3. leaderboard_weekly
```

#### Step 5: Enable Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (copy from db.md)
```

### Method 2: Using Migration Files (Alternative)

If you prefer migration-based approach:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create migration file
supabase migration new initial_schema

# Copy SQL from db.md into the migration file
# migrations/TIMESTAMP_initial_schema.sql

# Apply migration
supabase db push
```

---

## Environment Variables

### 1. Create `.env.local` file

In your project root, create `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...  # Keep this secret!

# Gemini API (for AI Judge)
GEMINI_API_KEY=your_gemini_api_key

# Database Connection (for server-side operations)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 2. Add to `.gitignore`

Ensure `.env.local` is in your `.gitignore`:

```gitignore
# Environment variables
.env*.local
.env.production
```

---

## Clerk + Supabase Integration

### 1. Create Clerk Webhook for User Sync

We need to sync users from Clerk to Supabase.

#### Step 1: Create Webhook Endpoint

Create `app/api/webhooks/clerk/route.js`:

```javascript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase-admin';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle the event
  const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Insert user into Supabase
    const { error } = await supabase.from('users').insert({
      clerk_id: id,
      email: email_addresses[0].email_address,
      username: username,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar_url: image_url,
    });

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    // Update user in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        email: email_addresses[0].email_address,
        username: username,
        full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', id);

    if (error) {
      console.error('Error updating user in Supabase:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
```

#### Step 2: Configure Webhook in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** → **Add Endpoint**
4. Set **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
5. Subscribe to events: `user.created`, `user.updated`
6. Copy the **Signing Secret** and add to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   ```

#### Step 3: Test Locally with Ngrok

```bash
# Install ngrok
npm install -g ngrok

# Run your Next.js app
npm run dev

# In another terminal, expose localhost
ngrok http 3000

# Use the ngrok URL in Clerk webhook settings
# https://xxxxx.ngrok.io/api/webhooks/clerk
```

---

## Database Client Setup

### 1. Create Supabase Client for Browser

Create `lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Create Supabase Admin Client (Server-Side)

Create `lib/supabase-admin.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

### 3. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Running Migrations

### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in project (if not done)
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create a new migration
supabase migration new add_new_feature

# Edit the migration file in supabase/migrations/

# Apply migrations locally (Docker required)
supabase db reset

# Push to remote
supabase db push
```

---

## Setting Up Cron Jobs

Supabase supports scheduled tasks using `pg_cron`.

### 1. Enable pg_cron Extension

In Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 2. Schedule Leaderboard Refresh

```sql
-- Refresh leaderboards every 5 minutes
SELECT cron.schedule(
  'refresh-leaderboards',
  '*/5 * * * *',
  $$SELECT refresh_all_leaderboards()$$
);
```

### 3. View Scheduled Jobs

```sql
-- List all cron jobs
SELECT * FROM cron.job;

-- Unschedule a job
SELECT cron.unschedule('refresh-leaderboards');
```

---

## Testing the Setup

### 1. Test Database Connection

Create `scripts/test-db.js`:

```javascript
import { supabase } from '../lib/supabase-admin.js';

async function testConnection() {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Database connection failed:', error);
  } else {
    console.log('✅ Database connection successful!');
    console.log('Badges:', data);
  }
}

testConnection();
```

Run:

```bash
node scripts/test-db.js
```

### 2. Test User Creation

Sign up through your app and verify:

1. User appears in Clerk Dashboard
2. User is synced to Supabase `users` table
3. Check Supabase dashboard → Table Editor → users

### 3. Test Submission Flow

1. Navigate to a problem page
2. Submit an answer
3. Verify in Supabase:
   - `submissions` table has new row
   - `user_progress` table updated
   - `users.total_points` incremented
   - `daily_streaks` table has entry

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000
```

### Syncing Problems to Database

Create `scripts/sync-problems.js`:

```javascript
import { supabase } from '../lib/supabase-admin.js';

async function syncProblems() {
  // Example: Sync problems from registry
  const problems = [
    {
      slug: 'log-transform',
      title: 'Log Transform Challenge',
      description: 'Identify when to use log transformation',
      difficulty: 'beginner',
      module_id: 1, // Linear Regression
      base_points: 100,
      display_order: 1,
      is_published: true,
    },
    // Add more problems...
  ];

  for (const problem of problems) {
    const { error } = await supabase
      .from('problems')
      .upsert(problem, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Error syncing ${problem.slug}:`, error);
    } else {
      console.log(`✅ Synced ${problem.slug}`);
    }
  }
}

syncProblems();
```

Run:

```bash
node scripts/sync-problems.js
```

### Database Backups

```bash
# Using Supabase CLI
supabase db dump --file backup.sql

# Restore
supabase db restore --file backup.sql
```

---

## Production Deployment

### 1. Set Environment Variables on Vercel

If deploying to Vercel:

1. Go to your project settings
2. **Environment Variables** tab
3. Add all variables from `.env.local`
4. Make sure to use **Production** environment

### 2. Update Clerk Webhook URL

Change webhook URL from `ngrok` to your production domain:
```
https://your-domain.com/api/webhooks/clerk
```

### 3. Enable Database Connection Pooling

For production, use Supabase's connection pooler:

```bash
# Use this connection string for server-side operations
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

Note the port change: `6543` instead of `5432` for pooled connections.

### 4. Set Up Monitoring

1. Enable **Database Logs** in Supabase Dashboard
2. Monitor slow queries
3. Set up alerts for errors

---

## Troubleshooting

### Common Issues

#### 1. RLS Blocking Queries

**Symptom**: Queries return empty results even though data exists.

**Solution**: Check RLS policies. Temporarily disable RLS for testing:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

Remember to re-enable after testing!

#### 2. Webhook Not Firing

**Symptom**: Users not syncing from Clerk to Supabase.

**Solution**:
- Check webhook URL is correct
- Verify `CLERK_WEBHOOK_SECRET` is set
- Test webhook locally with ngrok
- Check Clerk Dashboard → Webhooks → Logs

#### 3. Materialized Views Not Updating

**Symptom**: Leaderboard shows stale data.

**Solution**: Manually refresh:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
```

Check if cron job is running:

```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

#### 4. Connection Pool Exhausted

**Symptom**: `remaining connection slots reserved for non-replication superuser connections`

**Solution**: Use connection pooler (port 6543) or reduce connection count.

---

## Useful Commands

### Supabase CLI

```bash
# Check status
supabase status

# View logs
supabase logs

# Reset database (local only)
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.types.ts
```

### SQL Queries

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Top 10 leaderboard
SELECT * FROM leaderboard_global LIMIT 10;

-- User progress summary
SELECT
  u.username,
  COUNT(up.id) FILTER (WHERE up.status = 'completed') AS completed,
  u.total_points
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id;
```

---

## Next Steps

After setup:

1. ✅ Test user registration flow
2. ✅ Create a test problem and submission
3. ✅ Verify leaderboard updates
4. ✅ Set up automated backups
5. ✅ Configure monitoring and alerts

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review Supabase logs in dashboard
3. Check Clerk webhook logs
4. Review application logs in Vercel/hosting platform
