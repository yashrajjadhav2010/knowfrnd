-- ==============================================================================
-- VYBE SOCIAL EXPERIENCE PLATFORM - SEED DATA
-- Powered by Y Series
-- ==============================================================================

-- 1. Initial Platform Settings
INSERT INTO platform_settings (key, value) VALUES
  ('general', '{"platform_name": "VYBE", "tagline": "Your Friends. Your Secrets. Your VYBE.", "powered_by": "Y Series", "maintenance_mode": false}'::jsonb),
  ('features', '{"quizzes_enabled": true, "polls_enabled": true, "anonymous_enabled": true, "allow_guest_retakes": true, "max_questions_per_quiz": 30}'::jsonb),
  ('moderation', '{"auto_flag_keywords": ["hate", "doxx", "threat"], "require_report_review": true, "rate_limit_submissions_per_minute": 10}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
