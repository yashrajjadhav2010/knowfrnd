import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import {
  dbGetPublishedExperiences,
  dbGetExperienceBySlugOrId,
  dbGetQuestionsForExperience,
  dbGetPollForExperience,
  dbGetPollVotes,
  dbGetQuizSubmissionsForExperience,
  dbGetAnonymousResponsesForExperience,
  dbCreateExperience,
  dbCreateQuestionWithOptions,
  dbCreatePoll,
  dbUpdateExperienceStatus,
  dbCreateAuditLog,
  dbGetUserByUid,
} from '../../src/db/queries.ts';

export const experiencesRouter = Router();

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Math.random().toString(36).substring(2, 6)}`;
}

// GET /api/experiences (Public explore list)
experiencesRouter.get('/', async (req, res) => {
  try {
    const { type, search } = req.query;
    const list = await dbGetPublishedExperiences(
      typeof type === 'string' ? type : undefined,
      typeof search === 'string' ? search : undefined
    );

    const enriched = await Promise.all(
      list.map(async (exp) => {
        let owner = null;
        try {
          owner = await dbGetUserByUid(exp.ownerUid);
        } catch {}

        let responseCount = 0;
        try {
          if (exp.type === 'quiz') {
            const subs = await dbGetQuizSubmissionsForExperience(exp.id);
            responseCount = subs.length;
          } else if (exp.type === 'anonymous') {
            const resps = await dbGetAnonymousResponsesForExperience(exp.id);
            responseCount = resps.length;
          } else if (exp.type === 'poll') {
            const poll = await dbGetPollForExperience(exp.id);
            if (poll) {
              const votes = await dbGetPollVotes(poll.id);
              responseCount = votes.length;
            }
          }
        } catch {}

        return {
          id: exp.id,
          slug: exp.slug,
          type: exp.type,
          title: exp.title,
          description: exp.description,
          theme: exp.theme,
          status: exp.status,
          created_at: exp.createdAt.toISOString(),
          published_at: exp.publishedAt ? exp.publishedAt.toISOString() : undefined,
          creator: {
            public_display_name: owner?.displayName || 'Anonymous Creator',
            username: owner?.username || 'user',
            avatar_url: owner?.avatarUrl || undefined,
          },
          response_count: responseCount,
        };
      })
    );

    res.json({ experiences: enriched });
  } catch (err: any) {
    console.error('Failed to get experiences:', err);
    res.status(500).json({ error: err.message || 'Failed to get experiences' });
  }
});

// GET /api/experiences/:slugOrId (Public experience details)
// STRICT REQUIREMENT: PRIVATE ANSWER KEYS ARE NEVER RETURNED HERE!
experiencesRouter.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const exp = await dbGetExperienceBySlugOrId(slugOrId);
    if (!exp) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const authReq = req as AuthenticatedRequest;
    const isOwner = authReq.user?.clerk_user_id === exp.ownerUid;
    const isAdmin = authReq.isAdmin;
    if (exp.status !== 'published' && !isOwner && !isAdmin) {
      return res.status(403).json({ error: 'This experience is not publicly published.' });
    }

    let owner = null;
    try {
      owner = await dbGetUserByUid(exp.ownerUid);
    } catch {}

    const expSettings = (exp.settings as any) || {};
    const creatorDisplayName = expSettings.creator_name || owner?.displayName || 'Quiz Host';

    const questionsWithOpts = await dbGetQuestionsForExperience(exp.id);
    const questions = questionsWithOpts.map((q) => ({
      id: q.id,
      question_text: q.questionText,
      question_type: q.questionType,
      display_order: q.displayOrder,
      is_required: q.isRequired,
      options: q.options.map((o) => ({
        id: o.id,
        option_text: o.optionText,
        display_order: o.displayOrder,
      })),
    }));

    let pollData = null;
    let totalResponses = 0;

    if (exp.type === 'poll') {
      const poll = await dbGetPollForExperience(exp.id);
      if (poll) {
        const votes = await dbGetPollVotes(poll.id);
        const votesA = votes.filter((v) => v.selectedOption === 'A').length;
        const votesB = votes.filter((v) => v.selectedOption === 'B').length;
        const total = votesA + votesB;
        totalResponses = total;
        pollData = {
          id: poll.id,
          option_a: poll.optionA,
          option_b: poll.optionB,
          option_a_image: poll.optionAImage || undefined,
          option_b_image: poll.optionBImage || undefined,
          total_votes: total,
          votes_a: votesA,
          votes_b: votesB,
          percent_a: total > 0 ? Math.round((votesA / total) * 100) : 50,
          percent_b: total > 0 ? Math.round((votesB / total) * 100) : 50,
        };
      }
    } else if (exp.type === 'quiz') {
      const subs = await dbGetQuizSubmissionsForExperience(exp.id);
      totalResponses = subs.length;
    } else if (exp.type === 'anonymous') {
      const resps = await dbGetAnonymousResponsesForExperience(exp.id);
      totalResponses = resps.length;
    }

    res.json({
      experience: {
        id: exp.id,
        slug: exp.slug,
        type: exp.type,
        title: exp.title,
        description: exp.description,
        theme: exp.theme,
        status: exp.status,
        privacy_mode: exp.privacyMode,
        settings: exp.settings,
        creator_name: creatorDisplayName,
        creator: {
          public_display_name: creatorDisplayName,
          username: owner?.username || 'user',
          avatar_url: owner?.avatarUrl || undefined,
        },
        questions,
        poll: pollData,
        total_responses: totalResponses,
      },
    });
  } catch (err: any) {
    console.error('Failed to get experience details:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch experience details' });
  }
});

// POST /api/experiences (Create Quiz, Anonymous Box, or Poll)
experiencesRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      type,
      title,
      description = '',
      creator_name,
      theme = 'pastel-pookie',
      status = 'published',
      privacy_mode = 'mode_b',
      settings = {},
      questions = [],
      poll = null,
    } = req.body;

    if (!type || !title || !['quiz', 'anonymous', 'poll'].includes(type)) {
      return res.status(400).json({ error: 'Valid experience type (quiz, anonymous, poll) and title are required.' });
    }

    if (title.trim().length < 3 || title.trim().length > 120) {
      return res.status(400).json({ error: 'Title must be between 3 and 120 characters.' });
    }

    const expId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = slugify(title);

    const resolvedCreatorName = typeof creator_name === 'string' && creator_name.trim() 
      ? creator_name.trim().substring(0, 50) 
      : (settings.creator_name || 'Bestie');

    if (type === 'quiz') {
      if (!Array.isArray(questions) || questions.length < 3 || questions.length > 30) {
        return res.status(400).json({ error: 'Quizzes must have between 3 and 30 questions.' });
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question_text || q.question_text.trim().length < 2) {
          return res.status(400).json({ error: `Question #${i + 1} text is too short.` });
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({ error: `Question #${i + 1} must have at least 2 options.` });
        }
        if (q.correct_option_index === undefined && !q.correct_option_id) {
          return res.status(400).json({ error: `Question #${i + 1} must specify a correct answer.` });
        }
      }
    } else if (type === 'anonymous') {
      if (!Array.isArray(questions) || questions.length < 1 || questions.length > 20) {
        return res.status(400).json({ error: 'Anonymous experiences must have at least 1 question.' });
      }
    } else if (type === 'poll') {
      if (!poll || !poll.option_a || !poll.option_b) {
        return res.status(400).json({ error: 'Poll requires both Option A and Option B.' });
      }
    }

    const newExp = await dbCreateExperience({
      id: expId,
      ownerUid: user.clerk_user_id,
      slug,
      type,
      title: title.trim(),
      description: description.trim(),
      theme,
      status: status === 'draft' ? 'draft' : 'published',
      privacyMode: privacy_mode === 'mode_a' ? 'mode_a' : 'mode_b',
      settings: {
        creator_name: resolvedCreatorName,
        allow_nickname: settings.allow_nickname ?? true,
        show_leaderboard: settings.show_leaderboard ?? true,
        retake_allowed: settings.retake_allowed ?? true,
        show_answers: settings.show_answers ?? true,
        cover_style: settings.cover_style || 'default',
      },
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    if (type === 'quiz' || type === 'anonymous') {
      for (let idx = 0; idx < questions.length; idx++) {
        const qData = questions[idx];
        const qId = `q_${expId}_${idx + 1}`;
        const optsList: any[] = [];
        let correctOptId: string | undefined = undefined;

        if (type === 'quiz' || (qData.options && qData.options.length > 0)) {
          (qData.options || []).forEach((optText: any, optIdx: number) => {
            const optId = `opt_${qId}_${optIdx + 1}`;
            optsList.push({
              id: optId,
              questionId: qId,
              optionText: typeof optText === 'string' ? optText.trim() : optText.option_text || '',
              displayOrder: optIdx + 1,
            });
            if (qData.correct_option_index === optIdx || qData.correct_option_id === optId) {
              correctOptId = optId;
            }
          });
        }

        await dbCreateQuestionWithOptions(
          {
            id: qId,
            experienceId: expId,
            questionText: qData.question_text.trim(),
            questionType: qData.question_type || 'multiple_choice',
            displayOrder: idx + 1,
            isRequired: qData.is_required !== false,
            settings: qData.settings || {},
          },
          optsList,
          correctOptId
        );
      }
    } else if (type === 'poll') {
      await dbCreatePoll({
        id: `poll_${expId}`,
        experienceId: expId,
        optionA: poll.option_a.trim(),
        optionB: poll.option_b.trim(),
        optionAImage: poll.option_a_image || null,
        optionBImage: poll.option_b_image || null,
        votingPolicy: poll.voting_policy || 'one_per_voter',
      });
    }

    res.status(201).json({
      success: true,
      experience: newExp,
      shareUrl: `/experience/${newExp.slug}`,
    });
  } catch (err: any) {
    console.error('Failed to create experience:', err);
    res.status(500).json({ error: err.message || 'Failed to create experience' });
  }
});

// DELETE /api/experiences/:id (Archive or Delete experience)
experiencesRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const isAdmin = req.isAdmin;

    const exp = await dbGetExperienceBySlugOrId(id);
    if (!exp) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    if (exp.ownerUid !== user.clerk_user_id && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this experience.' });
    }

    await dbUpdateExperienceStatus(exp.id, 'archived');

    if (isAdmin) {
      await dbCreateAuditLog({
        id: `audit_${Date.now()}`,
        adminUserId: user.clerk_user_id,
        action: 'ARCHIVE_EXPERIENCE',
        targetType: 'experience',
        targetId: exp.id,
        metadata: { title: exp.title, type: exp.type },
      });
    }

    res.json({ success: true, message: 'Experience archived successfully in Cloud SQL.' });
  } catch (err: any) {
    console.error('Failed to delete experience:', err);
    res.status(500).json({ error: err.message || 'Failed to delete experience' });
  }
});
