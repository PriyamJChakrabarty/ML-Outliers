-- ============================================
-- ML Outliers Database Schema
-- Part 5: Row-Level Security (RLS) Policies
-- ============================================

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: users
-- ============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

-- ============================================
-- RLS Policies: user_progress
-- ============================================
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

-- ============================================
-- RLS Policies: submissions
-- ============================================
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

-- ============================================
-- RLS Policies: modules (public read)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view published modules" ON modules;
CREATE POLICY "Anyone can view published modules" ON modules
  FOR SELECT USING (is_published = true);

-- ============================================
-- RLS Policies: problems (public read)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view published problems" ON problems;
CREATE POLICY "Anyone can view published problems" ON problems
  FOR SELECT USING (is_published = true);

-- ============================================
-- RLS Policies: badges (public read)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- ============================================
-- RLS Policies: user_achievements
-- ============================================
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

-- ============================================
-- RLS Policies: daily_streaks
-- ============================================
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
