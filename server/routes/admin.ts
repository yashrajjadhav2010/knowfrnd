import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAdmin } from '../auth.js';
import {
  dbGetUsers,
  dbUpdateUserStatus,
  dbGetAllExperiencesAdmin,
  dbUpdateExperienceStatus,
  dbGetAllQuizSubmissionsAdmin,
  dbGetAllAnonymousResponsesAdmin,
  dbGetReports,
  dbUpdateReport,
  dbGetAuditLogs,
  dbCreateAuditLog,
  dbGetPlatformSettings,
  dbUpdatePlatformSetting,
  dbGetExperienceBySlugOrId,
} from '../../src/db/queries.ts';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

// 1. GET /api/admin/overview
adminRouter.get('/overview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usersList = await dbGetUsers();
    const experiencesList = await dbGetAllExperiencesAdmin();
    const quizSubs = await dbGetAllQuizSubmissionsAdmin();
    const anonResps = await dbGetAllAnonymousResponsesAdmin();
    const reportsList = await dbGetReports();
    const recentLogs = await dbGetAuditLogs();

    res.json({
      metrics: {
        total_users: usersList.length,
        active_users: usersList.filter((u) => u.accountStatus === 'active').length,
        total_experiences: experiencesList.length,
        published_experiences: experiencesList.filter((e) => e.status === 'published').length,
        quizzes_count: experiencesList.filter((e) => e.type === 'quiz').length,
        anonymous_count: experiencesList.filter((e) => e.type === 'anonymous').length,
        polls_count: experiencesList.filter((e) => e.type === 'poll').length,
        total_quiz_submissions: quizSubs.length,
        total_anonymous_responses: anonResps.length,
        total_poll_votes: 0,
        open_reports: reportsList.filter((r) => r.status === 'New' || r.status === 'Under Review').length,
      },
      recent_logs: recentLogs.slice(0, 8),
    });
  } catch (err: any) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch admin overview' });
  }
});

// 2. GET /api/admin/users
adminRouter.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search } = req.query;
    let list = await dbGetUsers();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.uid.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    const experiencesList = await dbGetAllExperiencesAdmin();
    const enriched = list.map((u) => ({
      id: String(u.id),
      clerk_user_id: u.uid,
      public_display_name: u.displayName || 'Creator',
      username: u.username,
      email: u.email,
      avatar_url: u.avatarUrl,
      role: u.role,
      account_status: u.accountStatus,
      created_at: u.createdAt.toISOString(),
      experiences_count: experiencesList.filter((e) => e.ownerUid === u.uid).length,
    }));

    res.json({ users: enriched });
  } catch (err: any) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/status
adminRouter.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await dbUpdateUserStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    await dbCreateAuditLog({
      id: `audit_${Date.now()}`,
      adminUserId: req.user!.clerk_user_id,
      action: 'USER_STATUS_CHANGE',
      targetType: 'user',
      targetId: id,
      metadata: { new_status: status },
    });

    res.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('Admin user status update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update user status' });
  }
});

// 3. GET /api/admin/experiences
adminRouter.get('/experiences', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, status, search } = req.query;
    let list = await dbGetAllExperiencesAdmin();

    if (type && type !== 'all') {
      list = list.filter((e) => e.type === type);
    }
    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q));
    }

    res.json({ experiences: list });
  } catch (err: any) {
    console.error('Admin experiences error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch experiences' });
  }
});

// PATCH /api/admin/experiences/:id/moderation
adminRouter.patch('/experiences/:id/moderation', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await dbUpdateExperienceStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    await dbCreateAuditLog({
      id: `audit_${Date.now()}`,
      adminUserId: req.user!.clerk_user_id,
      action: 'MODERATE_EXPERIENCE',
      targetType: 'experience',
      targetId: id,
      metadata: { to_status: status, title: updated.title },
    });

    res.json({ success: true, experience: updated });
  } catch (err: any) {
    console.error('Admin moderate experience error:', err);
    res.status(500).json({ error: err.message || 'Failed to moderate experience' });
  }
});

// 4. GET /api/admin/submissions
adminRouter.get('/submissions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subs = await dbGetAllQuizSubmissionsAdmin();
    const enriched = await Promise.all(
      subs.map(async (s) => {
        const exp = await dbGetExperienceBySlugOrId(s.experienceId);
        return {
          ...s,
          quiz_title: exp?.title || 'Quiz',
          quiz_slug: exp?.slug,
          participant_name: s.participantDisplayName,
          total_questions: s.totalQuestions,
          submitted_at: s.submittedAt.toISOString(),
        };
      })
    );
    res.json({ submissions: enriched });
  } catch (err: any) {
    console.error('Admin submissions error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch submissions' });
  }
});

// 5. GET /api/admin/anonymous-responses
adminRouter.get('/anonymous-responses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbGetAllAnonymousResponsesAdmin();
    const formatted = await Promise.all(
      list.map(async (r) => {
        const exp = await dbGetExperienceBySlugOrId(r.experienceId);
        return {
          id: r.id,
          experience_id: r.experienceId,
          experience_title: exp?.title || 'Anonymous Experience',
          privacy_mode: exp?.privacyMode || 'mode_b',
          answers: r.answers,
          moderation_status: r.moderationStatus,
          submitted_at: r.submittedAt.toISOString(),
          has_disclosed_name: Boolean(r.identity),
          disclosed_name: r.identity ? r.identity.responderName : undefined,
          identity_note:
            exp?.privacyMode === 'mode_b'
              ? 'Platform Anonymous (Zero Identity Retained)'
              : r.identity
              ? 'Disclosed to Platform Only with Explicit Consent'
              : 'Anonymous (No name provided)',
        };
      })
    );

    await dbCreateAuditLog({
      id: `audit_${Date.now()}`,
      adminUserId: req.user!.clerk_user_id,
      action: 'INSPECT_ANONYMOUS_RESPONSES',
      targetType: 'anonymous_responses',
      targetId: 'all',
      metadata: { count: list.length },
    });

    res.json({ responses: formatted });
  } catch (err: any) {
    console.error('Admin anonymous responses error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch responses' });
  }
});

// 6. GET /api/admin/reports & PATCH /api/admin/reports/:id
adminRouter.get('/reports', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbGetReports();
    res.json({ reports: list });
  } catch (err: any) {
    console.error('Admin reports error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch reports' });
  }
});

adminRouter.patch('/reports/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    const updated = await dbUpdateReport(id, status, resolution_notes, req.user!.clerk_user_id);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await dbCreateAuditLog({
      id: `audit_${Date.now()}`,
      adminUserId: req.user!.clerk_user_id,
      action: 'RESOLVE_REPORT',
      targetType: 'report',
      targetId: id,
      metadata: { status, resolution_notes },
    });

    res.json({ success: true, report: updated });
  } catch (err: any) {
    console.error('Admin update report error:', err);
    res.status(500).json({ error: err.message || 'Failed to resolve report' });
  }
});

// 7. GET /api/admin/audit-logs
adminRouter.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await dbGetAuditLogs();
    res.json({ audit_logs: logs });
  } catch (err: any) {
    console.error('Admin audit logs error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch audit logs' });
  }
});

// 8. GET & POST /api/admin/settings
adminRouter.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbGetPlatformSettings();
    res.json({ settings: list });
  } catch (err: any) {
    console.error('Admin settings error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch settings' });
  }
});

adminRouter.post('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    for (const s of settings) {
      await dbUpdatePlatformSetting(s.key, s.value);
    }

    await dbCreateAuditLog({
      id: `audit_${Date.now()}`,
      adminUserId: req.user!.clerk_user_id,
      action: 'UPDATE_PLATFORM_SETTINGS',
      targetType: 'settings',
      targetId: 'global',
      metadata: { updated_keys: settings.map((s) => s.key) },
    });

    const updatedList = await dbGetPlatformSettings();
    res.json({ success: true, settings: updatedList });
  } catch (err: any) {
    console.error('Admin update settings error:', err);
    res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});
