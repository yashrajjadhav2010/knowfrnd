import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import {
  dbGetExperiencesByOwner,
  dbGetQuizSubmissionsForExperience,
  dbGetAnonymousResponsesForExperience,
  dbGetPollForExperience,
  dbGetPollVotes,
  dbGetExperienceBySlugOrId,
} from '../../src/db/queries.ts';

export const dashboardRouter = Router();

// GET /api/dashboard/overview
dashboardRouter.get('/overview', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userExperiences = await dbGetExperiencesByOwner(user.clerk_user_id);

    const publishedCount = userExperiences.filter((e) => e.status === 'published').length;
    const draftCount = userExperiences.filter((e) => e.status === 'draft').length;

    let totalResponses = 0;
    let totalQuizScores = 0;
    let totalQuizSubmissionsCount = 0;
    const recentActivity: any[] = [];

    for (const exp of userExperiences) {
      if (exp.type === 'quiz') {
        const subs = await dbGetQuizSubmissionsForExperience(exp.id);
        totalResponses += subs.length;
        subs.forEach((sub) => {
          totalQuizScores += sub.percentage;
          totalQuizSubmissionsCount++;
          recentActivity.push({
            id: sub.id,
            experience_title: exp.title,
            type: 'quiz_submission',
            label: `${sub.participantDisplayName || 'A friend'} scored ${sub.score}/${sub.totalQuestions} (${sub.percentage}%)`,
            timestamp: sub.submittedAt.toISOString(),
          });
        });
      } else if (exp.type === 'anonymous') {
        const anons = await dbGetAnonymousResponsesForExperience(exp.id);
        totalResponses += anons.length;
        anons.forEach((anon) => {
          recentActivity.push({
            id: anon.id,
            experience_title: exp.title,
            type: 'anonymous_response',
            label: 'Received a new anonymous response',
            timestamp: anon.submittedAt.toISOString(),
          });
        });
      } else if (exp.type === 'poll') {
        const poll = await dbGetPollForExperience(exp.id);
        if (poll) {
          const votes = await dbGetPollVotes(poll.id);
          totalResponses += votes.length;
          votes.slice(-3).forEach((v) => {
            recentActivity.push({
              id: v.id,
              experience_title: exp.title,
              type: 'poll_vote',
              label: `New vote for Option ${v.selectedOption}`,
              timestamp: v.createdAt.toISOString(),
            });
          });
        }
      }
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const averageQuizScore =
      totalQuizSubmissionsCount > 0 ? Math.round(totalQuizScores / totalQuizSubmissionsCount) : 0;

    res.json({
      metrics: {
        total_experiences: userExperiences.length,
        published_experiences: publishedCount,
        draft_experiences: draftCount,
        total_responses: totalResponses,
        average_quiz_score: averageQuizScore,
      },
      recent_activity: recentActivity.slice(0, 8),
      user: {
        id: user.id,
        public_display_name: user.public_display_name,
        username: user.username,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Dashboard overview error:', err);
    res.status(500).json({ error: err.message || 'Failed to load dashboard overview' });
  }
});

// GET /api/dashboard/experiences
dashboardRouter.get('/experiences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { type, status } = req.query;

    let list = await dbGetExperiencesByOwner(user.clerk_user_id);

    if (type && type !== 'all') {
      list = list.filter((e) => e.type === type);
    }
    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }

    const enriched = await Promise.all(
      list.map(async (exp) => {
        let responseCount = 0;
        if (exp.type === 'quiz') {
          const subs = await dbGetQuizSubmissionsForExperience(exp.id);
          responseCount = subs.length;
        } else if (exp.type === 'anonymous') {
          const anons = await dbGetAnonymousResponsesForExperience(exp.id);
          responseCount = anons.length;
        } else if (exp.type === 'poll') {
          const poll = await dbGetPollForExperience(exp.id);
          if (poll) {
            const votes = await dbGetPollVotes(poll.id);
            responseCount = votes.length;
          }
        }

        return {
          ...exp,
          response_count: responseCount,
        };
      })
    );

    res.json({ experiences: enriched });
  } catch (err: any) {
    console.error('Dashboard experiences error:', err);
    res.status(500).json({ error: err.message || 'Failed to load dashboard experiences' });
  }
});

// GET /api/dashboard/responses/:experienceId
dashboardRouter.get('/responses/:experienceId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { experienceId } = req.params;

    const exp = await dbGetExperienceBySlugOrId(experienceId);
    if (!exp) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    if (exp.ownerUid !== user.clerk_user_id && !req.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view responses for this experience.' });
    }

    if (exp.type === 'quiz') {
      const submissions = await dbGetQuizSubmissionsForExperience(exp.id);
      const totalSubmissions = submissions.length;
      const avgScore =
        totalSubmissions > 0
          ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
          : 0;

      return res.json({
        type: 'quiz',
        experience: { id: exp.id, title: exp.title, type: exp.type },
        summary: {
          total_submissions: totalSubmissions,
          average_score: avgScore,
          highest_score: totalSubmissions > 0 ? Math.max(...submissions.map((s) => s.percentage)) : 0,
        },
        submissions: submissions.map((s) => ({
          id: s.id,
          participant_name: s.participantDisplayName,
          score: s.score,
          total_questions: s.totalQuestions,
          percentage: s.percentage,
          submitted_at: s.submittedAt.toISOString(),
        })),
      });
    }

    if (exp.type === 'anonymous') {
      const responses = await dbGetAnonymousResponsesForExperience(exp.id);
      return res.json({
        type: 'anonymous',
        experience: { id: exp.id, title: exp.title, type: exp.type, privacy_mode: exp.privacyMode },
        summary: {
          total_responses: responses.length,
        },
        responses: responses.map((r) => ({
          id: r.id,
          response_reference: r.responseReference,
          answers: r.answers,
          submitted_at: r.submittedAt.toISOString(),
        })),
      });
    }

    if (exp.type === 'poll') {
      const poll = await dbGetPollForExperience(exp.id);
      if (!poll) {
        return res.status(404).json({ error: 'Poll record not found' });
      }
      const votes = await dbGetPollVotes(poll.id);
      const votesA = votes.filter((v) => v.selectedOption === 'A').length;
      const votesB = votes.filter((v) => v.selectedOption === 'B').length;
      const total = votesA + votesB;

      return res.json({
        type: 'poll',
        experience: { id: exp.id, title: exp.title, type: exp.type },
        poll: {
          option_a: poll.optionA,
          option_b: poll.optionB,
          votes_a: votesA,
          votes_b: votesB,
          total_votes: total,
          percent_a: total > 0 ? Math.round((votesA / total) * 100) : 50,
          percent_b: total > 0 ? Math.round((votesB / total) * 100) : 50,
        },
      });
    }

    res.status(400).json({ error: 'Unsupported experience type' });
  } catch (err: any) {
    console.error('Dashboard responses error:', err);
    res.status(500).json({ error: err.message || 'Failed to load experience responses' });
  }
});
