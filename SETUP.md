# ML Outliers - Complete Setup Guide

This guide will help you set up the ML Outliers platform from scratch.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- ✅ Next.js 16
- ✅ React 19
- ✅ Clerk (authentication)
- ✅ Supabase (database)
- ✅ Svix (webhooks)

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# Clerk Webhook (add after webhook setup)
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Gemini API (for AI judge)
GEMINI_API_KEY=your_gemini_api_key
```

**Where to get these:**
- **Clerk keys**: [dashboard.clerk.com](https://dashboard.clerk.com) → Your App → API Keys
- **Supabase keys**: [app.supabase.com](https://app.supabase.com) → Your Project → Settings → API
- **Gemini API**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 3. Set Up Database

**Option A: Automated Setup**

```bash
npm run setup:all
```

This runs the master setup script that will guide you through all steps.

**Option B: Manual Setup**

```bash
# 1. Generate SQL to copy
npm run db:manual

# 2. Copy output and paste into Supabase SQL Editor
# (Go to Supabase Dashboard → SQL Editor)

# 3. Test connection
npm run db:test

# 4. Sync problems
npm run db:sync-problems
```

### 4. Set Up Clerk Webhook

#### For Production:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks
2. Click "Add Endpoint"
3. Set URL: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copy the **Signing Secret**
6. Add to `.env.local`: `CLERK_WEBHOOK_SECRET=whsec_xxxxx`

#### For Local Development:

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
npx ngrok http 3000

# Use the ngrok URL in Clerk webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/clerk
```

### 5. Run the Application

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📋 NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run setup:all` | **Master setup script** - runs all setup steps |
| `npm run db:setup` | Set up database automatically |
| `npm run db:manual` | Generate SQL for manual execution |
| `npm run db:test` | Test database connection |
| `npm run db:sync-problems` | Sync problems to database |

---

## 🔧 Detailed Setup Steps

### Step 1: Clerk Setup (Authentication)

1. Create account at [clerk.com](https://clerk.com)
2. Create a new application
3. Choose authentication methods (Email, Google, GitHub, etc.)
4. Copy API keys to `.env.local`
5. Follow webhook setup (Step 4 above)

### Step 2: Supabase Setup (Database)

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait 2-3 minutes for provisioning
4. Go to Settings → API
5. Copy URL and keys to `.env.local`
6. Go to SQL Editor
7. Run the SQL migrations (use `npm run db:manual` to get SQL)

### Step 3: Database Schema

The database includes:

**Tables:**
- `users` - User profiles (synced from Clerk)
- `modules` - Learning modules (Linear Regression, etc.)
- `problems` - Challenge problems
- `submissions` - User submissions with AI feedback
- `user_progress` - Completion tracking
- `badges` - Achievement badges
- `user_achievements` - Earned achievements
- `daily_streaks` - Daily activity tracking

**Materialized Views:**
- `leaderboard_global` - All-time rankings
- `leaderboard_monthly` - Current month rankings
- `leaderboard_weekly` - Current week rankings

**Functions & Triggers:**
- Auto-update user stats after submission
- Auto-update badges based on points
- Calculate streaks
- Refresh leaderboards

See `db.md` for complete schema documentation.

### Step 4: Problem Registry

Problems are defined in `/src/problems/` (when implemented).

Each problem is a folder with:
- `info.js` - Metadata (title, description, expert answer)
- `Visual.jsx` - Interactive visualization
- `data.json` - Rigged dataset

To sync problems to the database:

```bash
npm run db:sync-problems
```

---

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
npm run db:test
```

Expected output:
```
✅ Connection Test
✅ Badges Table (Found 6 badges)
✅ Modules Table (Found 8 modules)
✅ Problems Table
✅ Users Table
✅ Submissions Table
✅ User Progress Table
✅ Leaderboard Views
```

### 2. Test User Signup

1. Run `npm run dev`
2. Go to [http://localhost:3000](http://localhost:3000)
3. Click "Sign Up"
4. Create a test account
5. Check Supabase Dashboard → Table Editor → `users`
6. Verify new user appears in database

### 3. Test Leaderboard

1. Navigate to `/home`
2. Click the trophy icon (🏆) in the tracker box
3. Verify leaderboard page loads
4. Check all three tabs: All Time, Monthly, Weekly

---

## 📁 Project Structure

```
ML-Outliers/
├── src/
│   ├── app/
│   │   ├── api/webhooks/clerk/  # Clerk webhook endpoint
│   │   ├── home/                # Home page (dashboard)
│   │   ├── leaderboard/         # Leaderboard page
│   │   └── ...
│   ├── assets/
│   │   └── tracker_animation/   # Boy-Tracker-1 through 4
│   └── problems/                # Problem registry (when implemented)
├── lib/
│   ├── supabase.js              # Browser client
│   └── supabase-admin.js        # Server-side admin client
├── scripts/
│   ├── db/                      # SQL migration files
│   ├── setup-all.js             # Master setup script
│   ├── setup-database.js        # Automated DB setup
│   ├── execute-sql-manually.js  # Manual SQL generator
│   ├── test-connection.js       # Connection tester
│   ├── sync-problems.js         # Problem sync script
│   └── README.md                # Scripts documentation
├── public/
│   └── assets/tracker_animation/ # Public tracker images
├── .env.local                   # Environment variables (create this)
├── db.md                        # Database schema documentation
├── supabase.md                  # Supabase setup guide
├── CLAUDE.md                    # Project architecture
└── SETUP.md                     # This file
```

---

## 🐛 Troubleshooting

### Issue: Tracker animation not showing

**Cause**: Images not in public folder

**Solution**: Images have been copied to `public/assets/tracker_animation/`

### Issue: Database connection fails

**Causes**:
1. Wrong environment variables
2. Supabase project not provisioned
3. RLS blocking queries

**Solutions**:
1. Double-check `.env.local` values
2. Wait for Supabase provisioning (2-3 minutes)
3. Temporarily disable RLS for testing

### Issue: Webhook not working

**Causes**:
1. Wrong webhook URL
2. Missing signing secret
3. Events not subscribed

**Solutions**:
1. Verify URL in Clerk Dashboard
2. Check `CLERK_WEBHOOK_SECRET` in `.env.local`
3. Subscribe to all three user events

### Issue: Leaderboard shows no data

**Cause**: Materialized views not created or not refreshed

**Solution**:
```sql
-- In Supabase SQL Editor
SELECT refresh_all_leaderboards();
```

### Issue: npm run db:setup fails

**Cause**: Supabase RPC not available for automated execution

**Solution**: Use manual setup instead:
```bash
npm run db:manual
```
Then copy-paste SQL into Supabase SQL Editor.

---

## 🚢 Deployment (Production)

### Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (from `.env.local`)
5. Deploy

### Post-Deployment Steps

1. Update Clerk webhook URL to production domain
2. Test user signup on production
3. Verify database connection
4. Enable cron jobs for leaderboard refresh (in Supabase)

### Production Checklist

- [ ] All environment variables set
- [ ] Database migrations executed
- [ ] Clerk webhook configured with production URL
- [ ] Test user signup flow
- [ ] Verify leaderboard updates
- [ ] Check materialized view refresh
- [ ] Monitor error logs

---

## 📚 Additional Documentation

- **Database Schema**: `db.md`
- **Supabase Guide**: `supabase.md`
- **Architecture**: `CLAUDE.md`
- **Scripts**: `scripts/README.md`

---

## 🆘 Getting Help

1. Check error messages in console
2. Review relevant documentation file
3. Check Supabase logs (Dashboard → Logs)
4. Check Clerk logs (Dashboard → Logs)
5. Verify environment variables

---

## 🎉 You're All Set!

Once setup is complete:

1. Start development: `npm run dev`
2. Visit: [http://localhost:3000](http://localhost:3000)
3. Sign up and explore!

**Happy coding!** 🚀
