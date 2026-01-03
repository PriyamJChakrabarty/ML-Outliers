-- ============================================
-- ML Outliers Database Schema
-- Part 2: Seed Data
-- ============================================

-- ============================================
-- Seed: badges
-- ============================================
INSERT INTO badges (name, description, icon_emoji, required_points, required_exercises, rank_level) VALUES
('Beginner', 'Just getting started', '🌱', 0, 0, 1),
('Apprentice', 'Learning the ropes', '📚', 1000, 10, 2),
('Intermediate', 'Building expertise', '⚙️', 2500, 25, 3),
('Advanced', 'Strong understanding', '🎓', 5000, 40, 4),
('Expert', 'Mastered the fundamentals', '🥇', 8000, 60, 5),
('Master', 'Elite data scientist', '🏆', 12000, 80, 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Seed: modules
-- ============================================
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
