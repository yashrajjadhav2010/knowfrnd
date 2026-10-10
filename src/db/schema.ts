import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table with Firebase UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID / Account UID
  email: text('email').notNull(),
  displayName: text('display_name').default('VYBE Creator'),
  username: text('username').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').default('user').notNull(), // 'user' | 'moderator' | 'admin'
  accountStatus: text('account_status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Experiences (Quizzes, Secret Letters/Anonymous, Polls)
export const experiences = pgTable('experiences', {
  id: text('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull(), // 'quiz' | 'anonymous' | 'poll'
  title: text('title').notNull(),
  description: text('description').default('').notNull(),
  theme: text('theme').default('pastel-pookie').notNull(),
  status: text('status').default('published').notNull(),
  privacyMode: text('privacy_mode').default('mode_a').notNull(),
  settings: jsonb('settings').default({}).notNull(),
  publishedAt: timestamp('published_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Questions for quizzes / surveys
export const questions = pgTable('questions', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id')
    .references(() => experiences.id)
    .notNull(),
  questionText: text('question_text').notNull(),
  questionType: text('question_type').default('multiple_choice').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isRequired: boolean('is_required').default(true).notNull(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Options for questions
export const questionOptions = pgTable('question_options', {
  id: text('id').primaryKey(),
  questionId: text('question_id')
    .references(() => questions.id)
    .notNull(),
  optionText: text('option_text').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
});

// Private answer keys for scoring
export const privateAnswerKeys = pgTable('private_answer_keys', {
  id: text('id').primaryKey(),
  questionId: text('question_id')
    .references(() => questions.id)
    .notNull(),
  correctOptionId: text('correct_option_id').notNull(),
});

// Quiz submissions
export const quizSubmissions = pgTable('quiz_submissions', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id')
    .references(() => experiences.id)
    .notNull(),
  participantDisplayName: text('participant_display_name').notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  percentage: integer('percentage').notNull(),
  submissionReference: text('submission_reference').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

// Quiz individual answers
export const quizAnswers = pgTable('quiz_answers', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id')
    .references(() => quizSubmissions.id)
    .notNull(),
  questionId: text('question_id').notNull(),
  selectedOptionId: text('selected_option_id').notNull(),
  isCorrect: boolean('is_correct').notNull(),
});

// Anonymous responses
export const anonymousResponses = pgTable('anonymous_responses', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id')
    .references(() => experiences.id)
    .notNull(),
  responseReference: text('response_reference').notNull(),
  answers: jsonb('answers').default([]).notNull(),
  moderationStatus: text('moderation_status').default('approved').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

// Anonymous identities (for optional consent tracking)
export const anonymousResponseIdentities = pgTable('anonymous_response_identities', {
  id: text('id').primaryKey(),
  responseId: text('response_id')
    .references(() => anonymousResponses.id)
    .notNull(),
  responderName: text('responder_name').notNull(),
  consentGiven: boolean('consent_given').default(false).notNull(),
  consentNotice: text('consent_notice').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Polls
export const polls = pgTable('polls', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id')
    .references(() => experiences.id)
    .notNull(),
  optionA: text('option_a').notNull(),
  optionB: text('option_b').notNull(),
  optionAImage: text('option_a_image'),
  optionBImage: text('option_b_image'),
  votingPolicy: text('voting_policy').default('public').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Poll votes
export const pollVotes = pgTable('poll_votes', {
  id: text('id').primaryKey(),
  pollId: text('poll_id')
    .references(() => polls.id)
    .notNull(),
  selectedOption: text('selected_option').notNull(), // 'A' | 'B'
  voterReference: text('voter_reference').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reports
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  reporterReference: text('reporter_reference').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  status: text('status').default('New').notNull(),
  assignedAdminId: text('assigned_admin_id'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Admin audit logs
export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: text('id').primaryKey(),
  adminUserId: text('admin_user_id').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Platform settings
export const platformSettings = pgTable('platform_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  experiences: many(experiences),
}));

export const experiencesRelations = relations(experiences, ({ many }) => ({
  questions: many(questions),
  quizSubmissions: many(quizSubmissions),
  anonymousResponses: many(anonymousResponses),
  polls: many(polls),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  experience: one(experiences, {
    fields: [questions.experienceId],
    references: [experiences.id],
  }),
  options: many(questionOptions),
  privateAnswerKey: one(privateAnswerKeys, {
    fields: [questions.id],
    references: [privateAnswerKeys.questionId],
  }),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
}));

export const quizSubmissionsRelations = relations(quizSubmissions, ({ one, many }) => ({
  experience: one(experiences, {
    fields: [quizSubmissions.experienceId],
    references: [experiences.id],
  }),
  answers: many(quizAnswers),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  submission: one(quizSubmissions, {
    fields: [quizAnswers.submissionId],
    references: [quizSubmissions.id],
  }),
}));

export const anonymousResponsesRelations = relations(anonymousResponses, ({ one }) => ({
  experience: one(experiences, {
    fields: [anonymousResponses.experienceId],
    references: [experiences.id],
  }),
  identity: one(anonymousResponseIdentities, {
    fields: [anonymousResponses.id],
    references: [anonymousResponseIdentities.responseId],
  }),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
  experience: one(experiences, {
    fields: [polls.experienceId],
    references: [experiences.id],
  }),
  votes: many(pollVotes),
}));
