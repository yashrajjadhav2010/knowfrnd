-- ==============================================================================
-- VYBE SOCIAL EXPERIENCE PLATFORM - SUPABASE POSTGRESQL SCHEMA
-- Powered by Y Series
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  public_display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_clerk ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 3. EXPERIENCES (Quizzes, Anonymous questions, This or That polls)
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'anonymous', 'poll')),
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL DEFAULT 'violet',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'flagged')),
  privacy_mode TEXT NOT NULL DEFAULT 'mode_b' CHECK (privacy_mode IN ('mode_a', 'mode_b')),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_experiences_slug ON experiences(slug);
CREATE INDEX IF NOT EXISTS idx_experiences_owner ON experiences(owner_id);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_type ON experiences(type);

-- 4. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_text', 'yes_no')),
  display_order INT NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_experience ON questions(experience_id, display_order);

-- 5. QUESTION OPTIONS
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id, display_order);

-- 6. PRIVATE ANSWER KEYS (STRICTLY PRIVATE: NEVER EXPOSED PUBLICLY)
CREATE TABLE IF NOT EXISTS private_answer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID UNIQUE NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct_option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answer_keys_question ON private_answer_keys(question_id);

-- 7. QUIZ SUBMISSIONS
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  participant_display_name TEXT,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  submission_reference TEXT UNIQUE NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_exp ON quiz_submissions(experience_id, submitted_at DESC);

-- 8. QUIZ ANSWERS (Individual recorded choices)
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID NOT NULL,
  is_correct BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_sub ON quiz_answers(submission_id);

-- 9. ANONYMOUS RESPONSES
CREATE TABLE IF NOT EXISTS anonymous_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  response_reference TEXT UNIQUE NOT NULL,
  answers JSONB NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'hidden')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anon_resp_exp ON anonymous_responses(experience_id, submitted_at DESC);

-- 10. ANONYMOUS RESPONSE IDENTITY (MODE A OPTIONAL NAMES ONLY - STRICTLY ISOLATED FROM CREATORS)
CREATE TABLE IF NOT EXISTS anonymous_response_identity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID UNIQUE NOT NULL REFERENCES anonymous_responses(id) ON DELETE CASCADE,
  responder_name TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  consent_notice TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. POLLS
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID UNIQUE NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_a_image TEXT,
  option_b_image TEXT,
  voting_policy TEXT NOT NULL DEFAULT 'one_per_voter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. POLL VOTES
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B')),
  voter_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_vote_per_user_reference UNIQUE (poll_id, voter_reference)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);

-- 13. CONTENT REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_reference TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('experience', 'response', 'user')),
  target_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('harassment', 'spam', 'inappropriate', 'impersonation', 'privacy_violation', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Under Review', 'Action Taken', 'Dismissed', 'Resolved')),
  assigned_admin_id TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- 14. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);

-- 15. PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_response_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Anyone can view public profile info, only owner can update their own
CREATE POLICY "Public profiles can be viewed by anyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid()::text = clerk_user_id);

-- 2. Experiences: Anyone can read published experiences; creators can manage their own
CREATE POLICY "Anyone can view published experiences" ON experiences FOR SELECT USING (status = 'published');
CREATE POLICY "Creators can view all their own experiences" ON experiences FOR SELECT USING (
  owner_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text)
);
CREATE POLICY "Creators can insert their own experiences" ON experiences FOR INSERT WITH CHECK (
  owner_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text)
);
CREATE POLICY "Creators can update their own experiences" ON experiences FOR UPDATE USING (
  owner_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text)
);
CREATE POLICY "Creators can delete their own experiences" ON experiences FOR DELETE USING (
  owner_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text)
);

-- 3. Questions & Options: Visible if experience is published or owned by user
CREATE POLICY "Anyone can view questions of published experiences" ON questions FOR SELECT USING (
  experience_id IN (SELECT id FROM experiences WHERE status = 'published')
);
CREATE POLICY "Anyone can view options of published experiences" ON question_options FOR SELECT USING (
  question_id IN (
    SELECT q.id FROM questions q
    JOIN experiences e ON e.id = q.experience_id
    WHERE e.status = 'published'
  )
);

-- 4. PRIVATE ANSWER KEYS: NEVER ACCESSIBLE PUBLICLY!
-- Only service_role (backend server) or the quiz creator can query answer keys
CREATE POLICY "Creators can manage answer keys for their questions" ON private_answer_keys FOR ALL USING (
  question_id IN (
    SELECT q.id FROM questions q
    JOIN experiences e ON e.id = q.experience_id
    JOIN profiles p ON p.id = e.owner_id
    WHERE p.clerk_user_id = auth.uid()::text
  )
);

-- 5. Submissions: Anyone can create; creators can view submissions for their quizzes
CREATE POLICY "Anyone can submit a quiz" ON quiz_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can view their quiz submissions" ON quiz_submissions FOR SELECT USING (
  experience_id IN (
    SELECT e.id FROM experiences e
    JOIN profiles p ON p.id = e.owner_id
    WHERE p.clerk_user_id = auth.uid()::text
  )
);

-- 6. Anonymous responses: Anyone can submit; creators can view responses (CONTENT ONLY)
CREATE POLICY "Anyone can submit anonymous response" ON anonymous_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can view anonymous responses to their experiences" ON anonymous_responses FOR SELECT USING (
  experience_id IN (
    SELECT e.id FROM experiences e
    JOIN profiles p ON p.id = e.owner_id
    WHERE p.clerk_user_id = auth.uid()::text
  )
);

-- 7. ANONYMOUS IDENTITY: BLOCKED FOR CREATORS. ACCESSIBLE ONLY TO VERIFIED ADMINS
CREATE POLICY "Creators CANNOT view anonymous identity" ON anonymous_response_identity FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = auth.uid()::text AND role = 'admin'
  )
);

-- 8. Polls and Votes
CREATE POLICY "Anyone can view polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Anyone can vote in polls" ON poll_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view poll vote tallies" ON poll_votes FOR SELECT USING (true);

-- 9. Reports: Anyone can submit report; only admins can view and update
CREATE POLICY "Anyone can submit reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage reports" ON reports FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = auth.uid()::text AND role = 'admin'
  )
);

-- 10. Admin Audit Logs: strictly restricted to admins
CREATE POLICY "Only admins can view audit logs" ON admin_audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = auth.uid()::text AND role = 'admin'
  )
);
