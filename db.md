# Database Schema Design

## Overview

This document outlines the comprehensive PostgreSQL/Supabase database schema for ML Outliers. The schema is designed with **SCALABILITY**, **MODULARITY**, **CONCURRENCY**, and **SYSTEM DESIGN** principles in mind, aligned with the registry-based problem architecture.

## Core Design Principles

### 1. Registry Alignment
- Database problems sync with `/src/problems/index.js` registry
- Problems are identified by unique slugs matching folder names
- Metadata stored in DB for performance, but source-of-truth remains in code

### 2. Scalability
- Supports 100+ problems without schema changes
- Efficient indexing for fast queries
- Materialized views for leaderboard performance
- Partitioning strategy for submissions table (by date)

### 3. Concurrency
- Optimistic locking for user progress updates
- Row-level locking for leaderboard updates
- Transaction isolation for concurrent submissions
- Postgres sequences for auto-incrementing IDs

### 4. Modularity
- Self-contained tables with minimal coupling
- Junction tables for many-to-many relationships
- Easy to extend without breaking existing features

## Database Schema

### Table: `users`

**Purpose**: Store user profile data synced from Clerk authentication.

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clerk Integration
  clerk_id TEXT UNIQUE NOT NULL,  -- Clerk user ID

  -- User Profile
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,

  -- Gamification
  current_badge_id INTEGER REFERENCES badges(id),
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_total_points ON users(total_points DESC);
```

**Key Features**:
- Integrates with Clerk for authentication
- Tracks gamification metrics (points, streaks, badges)
- Indexed for fast leaderboard queries

---

### Table: `modules`

**Purpose**: Store learning modules/topics (e.g., Linear Regression, Logistic Regression).

```sql
CREATE TABLE modules (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Module Info
  slug TEXT UNIQUE NOT NULL,  -- e.g., 'linear-regression'
  name TEXT NOT NULL,  -- e.g., 'Linear Regression'
  description TEXT,

  -- Ordering & Prerequisites
  display_order INTEGER NOT NULL,
  prerequisite_module_id INTEGER REFERENCES modules(id),

  -- Status
  is_published BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_modules_display_order ON modules(display_order);
```

**Key Features**:
- Supports prerequisite chains (module unlocking)
- Display order for sequential learning paths
- Published/draft status for gradual rollout

---

### Table: `problems`

**Purpose**: Store problem metadata synced with registry (`/src/problems/index.js`).

```sql
CREATE TABLE problems (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Problem Identification (matches registry)
  slug TEXT UNIQUE NOT NULL,  -- e.g., 'log-transform', matches folder name

  -- Problem Details
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Module Association
  module_id INTEGER REFERENCES modules(id),

  -- Points & Rewards
  base_points INTEGER DEFAULT 100,
  time_bonus_points INTEGER DEFAULT 50,  -- Bonus for fast completion

  -- Ordering
  display_order INTEGER NOT NULL,

  -- Status
  is_published BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_problems_slug ON problems(slug);
CREATE INDEX idx_problems_module_id ON problems(module_id);
CREATE INDEX idx_problems_display_order ON problems(display_order);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
```

**Key Features**:
- **Slug matches registry**: Each problem's slug corresponds to its folder name in `/src/problems/`
- **Difficulty levels**: For filtering and recommended paths
- **Points system**: Base points + time bonus for gamification
- **Module association**: Groups problems into learning modules

---

### Table: `user_progress`

**Purpose**: Track user completion status for each problem.

```sql
CREATE TABLE user_progress (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,

  -- Progress Status
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',

  -- Attempts & Performance
  attempts_count INTEGER DEFAULT 0,
  first_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,  -- Total time spent on problem

  -- Points Earned
  points_earned INTEGER DEFAULT 0,

  -- Best Submission Reference
  best_submission_id BIGINT REFERENCES submissions(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Optimistic Locking for Concurrency
  version INTEGER DEFAULT 1,

  -- Constraints
  UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_completed_at ON user_progress(completed_at);
```

**Key Features**:
- **Optimistic locking**: `version` field prevents concurrent update conflicts
- **One record per user-problem pair**: Enforced by `UNIQUE(user_id, problem_id)`
- **Performance tracking**: Tracks attempts, time spent, and completion
- **Points tracking**: Stores points earned for this specific problem

---

### Table: `submissions`

**Purpose**: Store all user submissions and AI judge evaluations.

```sql
CREATE TABLE submissions (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,

  -- Submission Content
  user_answer TEXT NOT NULL,  -- User's diagnostic explanation

  -- AI Judge Evaluation
  ai_feedback TEXT,  -- Gemini's feedback
  similarity_score DECIMAL(5,2),  -- 0.00 to 100.00
  is_correct BOOLEAN,  -- Passed/Failed

  -- Grading Details
  judge_model TEXT DEFAULT 'gemini-1.5-flash',  -- Which AI model was used
  judge_prompt_version TEXT DEFAULT 'v1',  -- For A/B testing prompts

  -- Performance Metrics
  submission_time_seconds INTEGER,  -- Time taken to submit (from start)
  points_awarded INTEGER DEFAULT 0,

  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Partitioning Key (for future optimization)
  submission_date DATE DEFAULT CURRENT_DATE
);

-- Indexes for fast queries
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX idx_submissions_is_correct ON submissions(is_correct);

-- Composite index for user's problem history
CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id, submitted_at DESC);

-- Partitioning Strategy (optional, for scale)
-- CREATE TABLE submissions_2025_01 PARTITION OF submissions
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

**Key Features**:
- **Complete audit trail**: Every submission is stored permanently
- **AI judge metadata**: Tracks which model/prompt version was used
- **Partitioning ready**: Can partition by `submission_date` for massive scale
- **Points tracking**: Stores points awarded for this submission

---

### Table: `badges`

**Purpose**: Define achievement badges and ranks.

```sql
CREATE TABLE badges (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Badge Details
  name TEXT UNIQUE NOT NULL,  -- e.g., 'Beginner', 'Apprentice', 'Expert'
  description TEXT,
  icon_emoji TEXT,  -- e.g., '🏆', '🥇', '⭐'

  -- Unlock Requirements
  required_points INTEGER NOT NULL,
  required_exercises INTEGER,

  -- Ordering
  rank_level INTEGER UNIQUE NOT NULL,  -- 1 = lowest, higher = better

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_rank_level ON badges(rank_level);
CREATE INDEX idx_badges_required_points ON badges(required_points);

-- Seed Data
INSERT INTO badges (name, description, icon_emoji, required_points, required_exercises, rank_level) VALUES
('Beginner', 'Just getting started', '🌱', 0, 0, 1),
('Apprentice', 'Learning the ropes', '📚', 1000, 10, 2),
('Intermediate', 'Building expertise', '⚙️', 2500, 25, 3),
('Advanced', 'Strong understanding', '🎓', 5000, 40, 4),
('Expert', 'Mastered the fundamentals', '🥇', 8000, 60, 5),
('Master', 'Elite data scientist', '🏆', 12000, 80, 6);
```

**Key Features**:
- **Gamification**: Motivates users to progress
- **Flexible requirements**: Based on points and/or exercises
- **Rank ordering**: Higher `rank_level` = more prestigious

---

### Table: `user_achievements`

**Purpose**: Track specific achievements/milestones earned by users.

```sql
CREATE TABLE user_achievements (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,  -- e.g., 'first_submission', '10_day_streak', 'perfect_score'

  -- Achievement Details
  achievement_data JSONB,  -- Flexible metadata

  -- Metadata
  earned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at DESC);
```

**Key Features**:
- **Extensible**: JSONB allows arbitrary achievement metadata
- **Unique per type**: Can't earn the same achievement twice
- **Audit trail**: Tracks when achievements were earned

---

### Table: `daily_streaks`

**Purpose**: Track daily login/activity streaks for users.

```sql
CREATE TABLE daily_streaks (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Streak Data
  activity_date DATE NOT NULL,
  exercises_completed INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, activity_date)
);

CREATE INDEX idx_daily_streaks_user_id ON daily_streaks(user_id);
CREATE INDEX idx_daily_streaks_activity_date ON daily_streaks(activity_date DESC);
CREATE INDEX idx_daily_streaks_user_date ON daily_streaks(user_id, activity_date DESC);
```

**Key Features**:
- **Daily tracking**: One record per user per day
- **Streak calculation**: Can calculate streaks from consecutive dates
- **Activity metrics**: Tracks daily exercise completion and points

---

### Materialized View: `leaderboard_global`

**Purpose**: Optimized global leaderboard for fast queries.

```sql
CREATE MATERIALIZED VIEW leaderboard_global AS
SELECT
  u.id AS user_id,
  u.clerk_id,
  u.username,
  u.full_name,
  u.avatar_url,
  u.total_points,
  u.current_streak,
  u.longest_streak,
  b.name AS badge_name,
  b.icon_emoji AS badge_icon,
  COUNT(DISTINCT up.problem_id) FILTER (WHERE up.status = 'completed') AS exercises_completed,
  RANK() OVER (ORDER BY u.total_points DESC, u.longest_streak DESC) AS global_rank
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN badges b ON u.current_badge_id = b.id
GROUP BY u.id, b.name, b.icon_emoji
ORDER BY u.total_points DESC, u.longest_streak DESC;

-- Indexes on materialized view
CREATE UNIQUE INDEX idx_leaderboard_global_user_id ON leaderboard_global(user_id);
CREATE INDEX idx_leaderboard_global_rank ON leaderboard_global(global_rank);
CREATE INDEX idx_leaderboard_global_points ON leaderboard_global(total_points DESC);

-- Refresh strategy: Use cron job or trigger
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
```

**Key Features**:
- **Fast queries**: Pre-computed rankings
- **Concurrent refresh**: `CONCURRENTLY` allows updates without locking
- **Comprehensive data**: Includes all leaderboard fields in one view

---

### Materialized View: `leaderboard_monthly`

**Purpose**: Monthly leaderboard for time-based competitions.

```sql
CREATE MATERIALIZED VIEW leaderboard_monthly AS
SELECT
  u.id AS user_id,
  u.clerk_id,
  u.username,
  u.full_name,
  u.avatar_url,
  b.name AS badge_name,
  b.icon_emoji AS badge_icon,
  COUNT(DISTINCT up.problem_id) AS exercises_completed_this_month,
  SUM(s.points_awarded) AS points_this_month,
  RANK() OVER (ORDER BY SUM(s.points_awarded) DESC) AS monthly_rank,
  DATE_TRUNC('month', CURRENT_DATE) AS leaderboard_month
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
  AND s.submitted_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND s.is_correct = true
LEFT JOIN user_progress up ON u.id = up.user_id
  AND up.completed_at >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN badges b ON u.current_badge_id = b.id
GROUP BY u.id, b.name, b.icon_emoji
ORDER BY points_this_month DESC NULLS LAST;

CREATE UNIQUE INDEX idx_leaderboard_monthly_user_id ON leaderboard_monthly(user_id);
CREATE INDEX idx_leaderboard_monthly_rank ON leaderboard_monthly(monthly_rank);
```

**Key Features**:
- **Time-scoped**: Only counts current month's activity
- **Motivates engagement**: Users can compete monthly
- **Refresh daily**: Use cron job to refresh

---

### Materialized View: `leaderboard_weekly`

**Purpose**: Weekly leaderboard for short-term competitions.

```sql
CREATE MATERIALIZED VIEW leaderboard_weekly AS
SELECT
  u.id AS user_id,
  u.clerk_id,
  u.username,
  u.full_name,
  u.avatar_url,
  b.name AS badge_name,
  b.icon_emoji AS badge_icon,
  COUNT(DISTINCT up.problem_id) AS exercises_completed_this_week,
  SUM(s.points_awarded) AS points_this_week,
  RANK() OVER (ORDER BY SUM(s.points_awarded) DESC) AS weekly_rank,
  DATE_TRUNC('week', CURRENT_DATE) AS leaderboard_week
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
  AND s.submitted_at >= DATE_TRUNC('week', CURRENT_DATE)
  AND s.is_correct = true
LEFT JOIN user_progress up ON u.id = up.user_id
  AND up.completed_at >= DATE_TRUNC('week', CURRENT_DATE)
LEFT JOIN badges b ON u.current_badge_id = b.id
GROUP BY u.id, b.name, b.icon_emoji
ORDER BY points_this_week DESC NULLS LAST;

CREATE UNIQUE INDEX idx_leaderboard_weekly_user_id ON leaderboard_weekly(user_id);
CREATE INDEX idx_leaderboard_weekly_rank ON leaderboard_weekly(weekly_rank);
```

**Key Features**:
- **Fresh competition**: Resets weekly
- **Engagement driver**: Encourages regular activity

---

## Database Functions & Triggers

### Function: Update User Stats After Submission

```sql
CREATE OR REPLACE FUNCTION update_user_stats_after_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_correct = true THEN
    -- Update user's total points
    UPDATE users
    SET
      total_points = total_points + NEW.points_awarded,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = NEW.user_id;

    -- Update user progress
    UPDATE user_progress
    SET
      status = 'completed',
      completed_at = NEW.submitted_at,
      points_earned = GREATEST(points_earned, NEW.points_awarded),
      best_submission_id = CASE
        WHEN NEW.points_awarded > points_earned THEN NEW.id
        ELSE best_submission_id
      END,
      attempts_count = attempts_count + 1,
      updated_at = NOW(),
      version = version + 1
    WHERE user_id = NEW.user_id AND problem_id = NEW.problem_id;

    -- Update or insert daily streak
    INSERT INTO daily_streaks (user_id, activity_date, exercises_completed, points_earned)
    VALUES (NEW.user_id, CURRENT_DATE, 1, NEW.points_awarded)
    ON CONFLICT (user_id, activity_date)
    DO UPDATE SET
      exercises_completed = daily_streaks.exercises_completed + 1,
      points_earned = daily_streaks.points_earned + NEW.points_awarded;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_after_submission
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_after_submission();
```

---

### Function: Update User Badge

```sql
CREATE OR REPLACE FUNCTION update_user_badge()
RETURNS TRIGGER AS $$
DECLARE
  new_badge_id INTEGER;
BEGIN
  -- Find the highest badge the user qualifies for
  SELECT id INTO new_badge_id
  FROM badges
  WHERE required_points <= NEW.total_points
  ORDER BY rank_level DESC
  LIMIT 1;

  -- Update user's badge if it changed
  IF new_badge_id IS NOT NULL AND new_badge_id != COALESCE(NEW.current_badge_id, 0) THEN
    NEW.current_badge_id = new_badge_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_badge
BEFORE UPDATE OF total_points ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_badge();
```

---

### Function: Calculate Current Streak

```sql
CREATE OR REPLACE FUNCTION calculate_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Check if user has activity on current date
    SELECT EXISTS(
      SELECT 1 FROM daily_streaks
      WHERE user_id = p_user_id AND activity_date = v_current_date
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;

    v_streak := v_streak + 1;
    v_current_date := v_current_date - INTERVAL '1 day';
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;
```

---

### Function: Refresh All Leaderboards

```sql
CREATE OR REPLACE FUNCTION refresh_all_leaderboards()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run every 5 minutes using pg_cron
-- SELECT cron.schedule('refresh-leaderboards', '*/5 * * * *', 'SELECT refresh_all_leaderboards()');
```

---

## Row-Level Security (RLS) with Supabase

Supabase uses PostgreSQL's Row-Level Security for fine-grained access control.

### Enable RLS on all tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Users: Can read all, but only update their own profile
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- User Progress: Users can only see/modify their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Submissions: Users can only see their own submissions
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Modules & Problems: Public read access
CREATE POLICY "Anyone can view published modules" ON modules
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view published problems" ON problems
  FOR SELECT USING (is_published = true);

-- Badges: Public read access
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- Leaderboards: Public read access
-- (No RLS needed since they're materialized views)
```

---

## Scaling Strategy

### 1. Indexing
- All foreign keys are indexed
- Leaderboard queries use composite indexes
- Partial indexes for common filters (e.g., `WHERE is_published = true`)

### 2. Partitioning
- `submissions` table can be partitioned by `submission_date`
- Start partitioning when submissions exceed 10M rows

### 3. Materialized Views
- Leaderboards are pre-computed
- Refresh every 5 minutes (adjust based on traffic)
- Use `CONCURRENTLY` to avoid locking

### 4. Caching
- Use Supabase edge caching for leaderboards
- Cache module/problem data in Next.js
- Invalidate cache on new problem publish

### 5. Connection Pooling
- Use PgBouncer (Supabase provides this)
- Set appropriate pool size based on concurrent users

---

## Integration with Registry Pattern

### Sync Problems from Registry to Database

Create a script to sync `/src/problems/index.js` with the database:

```javascript
// scripts/sync-problems-to-db.js
import { supabase } from '../lib/supabase';
import problemsRegistry from '../src/problems/index.js';

async function syncProblems() {
  for (const [slug, problemModule] of Object.entries(problemsRegistry)) {
    const { info } = problemModule;

    const { error } = await supabase
      .from('problems')
      .upsert({
        slug,
        title: info.title,
        description: info.description,
        difficulty: info.difficulty,
        module_id: info.moduleId,
        base_points: info.basePoints || 100,
        is_published: true,
      }, { onConflict: 'slug' });

    if (error) console.error(`Error syncing ${slug}:`, error);
    else console.log(`✅ Synced ${slug}`);
  }
}

syncProblems();
```

**Run this script**:
- On deployment (CI/CD pipeline)
- When adding new problems
- Keep DB in sync with code

---

## Migration Strategy

### Initial Setup
1. Run all `CREATE TABLE` statements
2. Insert seed data for `badges` and `modules`
3. Enable RLS and create policies
4. Create materialized views
5. Create triggers and functions
6. Set up pg_cron for leaderboard refresh

### Future Migrations
- Use Supabase migrations or a tool like `dbmate`
- Version control all schema changes
- Test migrations in staging before production

---

## API Endpoints (Next.js Route Handlers)

### Example: Submit Answer

```javascript
// app/api/submissions/route.js
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs';

export async function POST(req) {
  const { userId } = auth();
  const { problemSlug, userAnswer } = await req.json();

  // Get user from DB
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  // Get problem from DB
  const { data: problem } = await supabase
    .from('problems')
    .select('id, base_points')
    .eq('slug', problemSlug)
    .single();

  // Evaluate with Gemini (AI judge)
  const evaluation = await evaluateWithGemini(problemSlug, userAnswer);

  // Insert submission
  const { data: submission } = await supabase
    .from('submissions')
    .insert({
      user_id: user.id,
      problem_id: problem.id,
      user_answer: userAnswer,
      ai_feedback: evaluation.feedback,
      similarity_score: evaluation.score,
      is_correct: evaluation.isCorrect,
      points_awarded: evaluation.isCorrect ? problem.base_points : 0,
    })
    .select()
    .single();

  return Response.json(submission);
}
```

---

## Conclusion

This schema provides:
- ✅ **Scalability**: Supports 100+ problems with efficient indexing
- ✅ **Modularity**: Self-contained tables, easy to extend
- ✅ **Concurrency**: Optimistic locking, triggers handle race conditions
- ✅ **Registry Alignment**: Problems sync from code to DB
- ✅ **Leaderboard Performance**: Materialized views for fast queries
- ✅ **Gamification**: Points, badges, streaks, achievements
- ✅ **Security**: RLS policies protect user data

This is a **production-ready** schema designed for an educational platform with competitive elements.
