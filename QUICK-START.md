# 🚀 Quick Start - Automated Database Setup

Since you have Supabase CLI installed, you can set up the entire database with **ONE COMMAND**!

## The Super Simple Way

```bash
npm run db:setup
```

That's it! This script will:
1. ✅ Check Supabase CLI is installed
2. ✅ Verify environment variables
3. ✅ Link to your Supabase project
4. ✅ Execute all migrations automatically
5. ✅ Verify setup worked

## What to Expect

### First Time Running

```bash
npm run db:setup
```

You'll see:

```
🚀 Supabase CLI Database Setup
Automated database migration using Supabase CLI

============================================================
Step 1: Checking Supabase CLI
============================================================

✅ Supabase CLI installed: 2.x.x

============================================================
Step 2: Checking Environment Variables
============================================================

✅ All required environment variables found

============================================================
Step 3: Linking to Supabase Project
============================================================

⚠️  You will be prompted to login to Supabase CLI
   Follow the instructions in your browser

[Browser will open for authentication]

✅ Successfully linked to Supabase project

============================================================
Step 4: Executing Database Migration
============================================================

📄 Executing combined-migration.sql...
✅ Migration executed successfully!

============================================================
Step 5: Verifying Setup
============================================================

🔍 Running connection test...
✅ Connection Test
✅ Badges Table (Found 6 badges)
✅ Modules Table (Found 8 modules)
✅ Problems Table
✅ Users Table
✅ Submissions Table
✅ User Progress Table
✅ Leaderboard Views

==================================================
Tests Passed: 8/8
Tests Failed: 0/8
==================================================

============================================================
🎉 Setup Complete!
============================================================

Your database is ready to use!

📋 Next steps:
1. Run: npm run db:sync-problems
2. Start your app: npm run dev
3. Test the application
```

## Alternative: Even Faster (If Already Linked)

If you've already linked your project:

```bash
npm run db:setup-direct
```

This skips the linking step and directly executes the migration.

## After Setup

1. **Sync Problems to Database**
   ```bash
   npm run db:sync-problems
   ```

2. **Start Your App**
   ```bash
   npm run dev
   ```

3. **Test Everything**
   - Visit: http://localhost:3000
   - Sign up with a test account
   - Check Supabase Dashboard to see user created
   - Navigate to /home
   - Click the 🏅 LEADERBOARD badge

## Troubleshooting

### "Supabase CLI not found"

Install it:
```bash
# Using npm
npm install -g supabase

# Or Windows (Scoop)
scoop install supabase

# Or macOS (Homebrew)
brew install supabase/tap/supabase
```

### "Failed to link to Supabase project"

Make sure your `.env.local` has the correct URL:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

### "Migration failed"

The script will try multiple methods. If all fail, it will show:
```
💡 Manual execution required:
   1. Go to Supabase Dashboard → SQL Editor
   2. Copy contents of scripts/combined-migration.sql
   3. Paste and execute in SQL Editor
```

Just follow those instructions as a fallback.

## What Gets Created

### Tables (8)
- ✅ `badges` - Achievement badges
- ✅ `modules` - Learning modules
- ✅ `problems` - Challenge problems
- ✅ `users` - User profiles
- ✅ `submissions` - User submissions
- ✅ `user_progress` - Completion tracking
- ✅ `user_achievements` - Achievements earned
- ✅ `daily_streaks` - Daily activity

### Views (3)
- ✅ `leaderboard_global` - All-time rankings
- ✅ `leaderboard_monthly` - Monthly rankings
- ✅ `leaderboard_weekly` - Weekly rankings

### Functions (5)
- ✅ `update_user_stats_after_submission()` - Auto-update on submission
- ✅ `update_user_badge()` - Auto-upgrade badges
- ✅ `calculate_current_streak()` - Calculate user streaks
- ✅ `update_all_user_streaks()` - Batch update streaks
- ✅ `refresh_all_leaderboards()` - Refresh leaderboard views

### Seed Data
- ✅ 6 badges (Beginner → Master)
- ✅ 8 learning modules

### Security
- ✅ Row-Level Security (RLS) enabled
- ✅ Policies for user data protection

## Complete Workflow

```bash
# 1. Setup database (ONE TIME)
npm run db:setup

# 2. Sync problems (AFTER ADDING NEW PROBLEMS)
npm run db:sync-problems

# 3. Test connection (ANYTIME)
npm run db:test

# 4. Start app (DAILY)
npm run dev
```

## Success Indicators

After `npm run db:setup`, you should see:
- ✅ All 8 tests pass
- ✅ "Setup Complete!" message
- ✅ No error messages in red

Then check Supabase Dashboard:
- Go to Table Editor
- See 8 tables listed
- Click on `badges` → should see 6 rows
- Click on `modules` → should see 8 rows

## You're Done! 🎉

Database is fully set up and ready. Now just:

```bash
npm run dev
```

And start building! 🚀
