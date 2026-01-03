-- ============================================
-- ML Outliers - Complete Database Migration
-- Execute this file to set up the entire database
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: CREATE TABLES
-- ============================================

-- Table: badges
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_emoji TEXT,
  required_points INTEGER NOT NULL,
  required_exercises INTEGER,
  rank_level INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_rank_level ON badges(rank_level);
CREATE INDEX IF NOT EXISTS idx_badges_required_points ON badges(required_points);

-- Table: modules
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL,
  prerequisite_module_id INTEGER REFERENCES modules(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_slug ON modules(slug);
CREATE INDEX IF NOT EXISTS idx_modules_display_order ON modules(display_order);

-- Table: problems
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  module_id INTEGER REFERENCES modules(id),
  base_points INTEGER DEFAULT 100,
  time_bonus_points INTEGER DEFAULT 50,
  display_order INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
CREATE INDEX IF NOT EXISTS idx_problems_module_id ON problems(module_id);
CREATE INDEX IF NOT EXISTS idx_problems_display_order ON problems(display_order);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  current_badge_id INTEGER REFERENCES badges(id),
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);

-- Table: submissions
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  ai_feedback TEXT,
  similarity_score DECIMAL(5,2),
  is_correct BOOLEAN,
  judge_model TEXT DEFAULT 'gemini-1.5-flash',
  judge_prompt_version TEXT DEFAULT 'v1',
  submission_time_seconds INTEGER,
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submission_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_is_correct ON submissions(is_correct);
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id, submitted_at DESC);

-- Table: user_progress
CREATE TABLE IF NOT EXISTS user_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  attempts_count INTEGER DEFAULT 0,
  first_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  best_submission_id BIGINT REFERENCES submissions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  UNIQUE(user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_problem_id ON user_progress(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON user_progress(completed_at);

-- Table: user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- Table: daily_streaks
CREATE TABLE IF NOT EXISTS daily_streaks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  exercises_completed INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_id ON daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_activity_date ON daily_streaks(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_date ON daily_streaks(user_id, activity_date DESC);

-- ============================================
-- PART 2: SEED DATA
-- ============================================

-- Seed: badges
INSERT INTO badges (name, description, icon_emoji, required_points, required_exercises, rank_level) VALUES
('Beginner', 'Just getting started', '🌱', 0, 0, 1),
('Apprentice', 'Learning the ropes', '📚', 1000, 10, 2),
('Intermediate', 'Building expertise', '⚙️', 2500, 25, 3),
('Advanced', 'Strong understanding', '🎓', 5000, 40, 4),
('Expert', 'Mastered the fundamentals', '🥇', 8000, 60, 5),
('Master', 'Elite data scientist', '🏆', 12000, 80, 6)
ON CONFLICT (name) DO NOTHING;

-- Seed: modules
INSERT INTO modules (slug, name, description, display_order, is_published) VALUES
('linear-regression', 'Linear Regression', 'Master the fundamentals of linear regression and understand when to use it', 1, true),
('logistic-regression', 'Logistic Regression', 'Learn classification techniques with logistic regression', 2, false),
('decision-trees', 'Decision Trees', 'Understand tree-based models and their applications', 3, false),
('random-forests', 'Random Forests', 'Master ensemble methods with random forests', 4, false),
('neural-networks', 'Neural Networks', 'Introduction to deep learning and neural networks', 5, false),
('clustering', 'Clustering', 'Unsupervised learning with clustering algorithms', 6, false),
('dimensionality-reduction', 'Dimensionality Reduction', 'PCA, t-SNE, and other dimensionality reduction techniques', 7, false),
('model-evaluation', 'Model Evaluation', 'Learn to properly evaluate and validate ML models', 8, false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PART 3: FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update user stats after submission
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
  ELSE
    -- Failed attempt - just increment attempts count
    UPDATE user_progress
    SET
      attempts_count = attempts_count + 1,
      updated_at = NOW(),
      version = version + 1
    WHERE user_id = NEW.user_id AND problem_id = NEW.problem_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_user_stats_after_submission ON submissions;
CREATE TRIGGER trigger_update_user_stats_after_submission
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_after_submission();

-- Function: Update user badge
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

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_user_badge ON users;
CREATE TRIGGER trigger_update_user_badge
BEFORE UPDATE OF total_points ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_badge();

-- Function: Calculate current streak
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

-- Function: Update streaks for all users
CREATE OR REPLACE FUNCTION update_all_user_streaks()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  current_streak_val INTEGER;
BEGIN
  FOR user_record IN SELECT id FROM users LOOP
    current_streak_val := calculate_current_streak(user_record.id);

    UPDATE users
    SET
      current_streak = current_streak_val,
      longest_streak = GREATEST(longest_streak, current_streak_val),
      updated_at = NOW()
    WHERE id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Refresh all leaderboards
CREATE OR REPLACE FUNCTION refresh_all_leaderboards()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 4: MATERIALIZED VIEWS
-- ============================================

-- Materialized View: leaderboard_global
DROP MATERIALIZED VIEW IF EXISTS leaderboard_global CASCADE;

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

CREATE UNIQUE INDEX idx_leaderboard_global_user_id ON leaderboard_global(user_id);
CREATE INDEX idx_leaderboard_global_rank ON leaderboard_global(global_rank);
CREATE INDEX idx_leaderboard_global_points ON leaderboard_global(total_points DESC);

-- Materialized View: leaderboard_monthly
DROP MATERIALIZED VIEW IF EXISTS leaderboard_monthly CASCADE;

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
  COALESCE(SUM(s.points_awarded), 0) AS points_this_month,
  RANK() OVER (ORDER BY COALESCE(SUM(s.points_awarded), 0) DESC) AS monthly_rank,
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

-- Materialized View: leaderboard_weekly
DROP MATERIALIZED VIEW IF EXISTS leaderboard_weekly CASCADE;

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
  COALESCE(SUM(s.points_awarded), 0) AS points_this_week,
  RANK() OVER (ORDER BY COALESCE(SUM(s.points_awarded), 0) DESC) AS weekly_rank,
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

-- ============================================
-- PART 5: ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

-- RLS Policies: user_progress
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- RLS Policies: submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can insert own submissions" ON submissions;
CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- RLS Policies: modules (public read)
DROP POLICY IF EXISTS "Anyone can view published modules" ON modules;
CREATE POLICY "Anyone can view published modules" ON modules
  FOR SELECT USING (is_published = true);

-- RLS Policies: problems (public read)
DROP POLICY IF EXISTS "Anyone can view published problems" ON problems;
CREATE POLICY "Anyone can view published problems" ON problems
  FOR SELECT USING (is_published = true);

-- RLS Policies: badges (public read)
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- RLS Policies: user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- RLS Policies: daily_streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON daily_streaks;
CREATE POLICY "Users can view own streaks" ON daily_streaks
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can insert own streaks" ON daily_streaks;
CREATE POLICY "Users can insert own streaks" ON daily_streaks
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- ============================================
-- SETUP COMPLETE
-- ============================================
