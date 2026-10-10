import { createClient } from '@supabase/supabase-js';

// Types matching the Supabase PostgreSQL Schema
export interface Profile {
  id: string;
  clerk_user_id: string;
  public_display_name: string;
  username: string;
  avatar_url?: string;
  account_status: 'active' | 'suspended' | 'deactivated';
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  owner_id: string;
  slug: string;
  type: 'quiz' | 'anonymous' | 'poll';
  title: string;
  description: string;
  theme: string;
  status: 'draft' | 'published' | 'archived' | 'flagged';
  privacy_mode: 'mode_a' | 'mode_b';
  settings: {
    allow_nickname?: boolean;
    show_leaderboard?: boolean;
    retake_allowed?: boolean;
    show_answers?: boolean;
    cover_style?: string;
  };
  published_at?: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export interface Question {
  id: string;
  experience_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_text' | 'yes_no';
  display_order: number;
  is_required: boolean;
  settings?: Record<string, any>;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  display_order: number;
}

export interface PrivateAnswerKey {
  id: string;
  question_id: string;
  correct_option_id: string;
}

export interface QuizSubmission {
  id: string;
  experience_id: string;
  participant_display_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  submission_reference: string;
  submitted_at: string;
}

export interface QuizAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
}

export interface AnonymousResponse {
  id: string;
  experience_id: string;
  response_reference: string;
  answers: {
    question_id: string;
    question_text?: string;
    response_text?: string;
    selected_option_id?: string;
  }[];
  moderation_status: 'approved' | 'flagged' | 'hidden';
  submitted_at: string;
}

export interface AnonymousResponseIdentity {
  id: string;
  response_id: string;
  responder_name: string;
  consent_given: boolean;
  consent_notice: string;
  created_at: string;
}

export interface Poll {
  id: string;
  experience_id: string;
  option_a: string;
  option_b: string;
  option_a_image?: string;
  option_b_image?: string;
  voting_policy: string;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  selected_option: 'A' | 'B';
  voter_reference: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_reference: string;
  target_type: 'experience' | 'response' | 'user';
  target_id: string;
  category: 'harassment' | 'spam' | 'inappropriate' | 'impersonation' | 'privacy_violation' | 'other';
  description: string;
  status: 'New' | 'Under Review' | 'Action Taken' | 'Dismissed' | 'Resolved';
  assigned_admin_id?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface PlatformSettings {
  key: string;
  value: Record<string, any>;
  updated_at: string;
}

// Memory database with realistic initial seeds
class MemoryDB {
  profiles: Profile[] = [];
  experiences: Experience[] = [];
  questions: Question[] = [];
  question_options: QuestionOption[] = [];
  private_answer_keys: PrivateAnswerKey[] = [];
  quiz_submissions: QuizSubmission[] = [];
  quiz_answers: QuizAnswer[] = [];
  anonymous_responses: AnonymousResponse[] = [];
  anonymous_response_identities: AnonymousResponseIdentity[] = [];
  polls: Poll[] = [];
  poll_votes: PollVote[] = [];
  reports: Report[] = [];
  admin_audit_logs: AdminAuditLog[] = [];
  platform_settings: PlatformSettings[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const now = new Date().toISOString();

    // Clean initial platform settings (No dummy users, no dummy experiences, no fake submissions)
    this.platform_settings.push(
      {
        key: 'general',
        value: {
          platform_name: 'VYBE',
          tagline: 'Your Friends. Your Secrets. Your VYBE.',
          powered_by: 'Y Series',
          maintenance_mode: false,
        },
        updated_at: now,
      },
      {
        key: 'features',
        value: {
          quizzes_enabled: true,
          polls_enabled: true,
          anonymous_enabled: true,
          allow_guest_retakes: true,
          max_questions_per_quiz: 30,
        },
        updated_at: now,
      },
      {
        key: 'moderation',
        value: {
          require_report_review: true,
          rate_limit_submissions_per_minute: 10,
        },
        updated_at: now,
      }
    );
  }
}

export const db = new MemoryDB();

// Connect to real Supabase if credentials are provided in process.env
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && serviceKey && !supabaseUrl.includes('your-project')) {
    try {
      return createClient(supabaseUrl, serviceKey);
    } catch (err) {
      console.warn('[DB] Supabase connection initialization fallback to Memory DB:', err);
      return null;
    }
  }
  return null;
};
