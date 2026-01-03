-- ============================================
-- ML Outliers Database Schema
-- Part 4: Materialized Views
-- ============================================

-- ============================================
-- Materialized View: leaderboard_global
-- ============================================
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

-- ============================================
-- Materialized View: leaderboard_monthly
-- ============================================
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

-- ============================================
-- Materialized View: leaderboard_weekly
-- ============================================
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
