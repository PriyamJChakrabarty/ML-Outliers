-- ============================================
-- ML Outliers Database Schema
-- Part 3: Functions & Triggers
-- ============================================

-- ============================================
-- Function: Update user stats after submission
-- ============================================
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

-- ============================================
-- Function: Update user badge
-- ============================================
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

-- ============================================
-- Function: Calculate current streak
-- ============================================
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

-- ============================================
-- Function: Update streaks for all users
-- ============================================
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

-- ============================================
-- Function: Refresh all leaderboards
-- ============================================
CREATE OR REPLACE FUNCTION refresh_all_leaderboards()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly;
END;
$$ LANGUAGE plpgsql;
