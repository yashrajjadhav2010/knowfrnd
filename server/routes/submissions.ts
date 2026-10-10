import { Router, Request, Response } from 'express';
import {
  dbGetExperienceBySlugOrId,
  dbGetQuestionsForExperience,
  dbGetPrivateAnswerKeys,
  dbCreateQuizSubmission,
  dbCreateAnonymousResponse,
  dbGetPollForExperience,
  dbGetPollVotes,
  dbRecordPollVote,
} from '../../src/db/queries.ts';

export const submissionsRouter = Router();

// ==============================================================================
// 1. QUIZ SUBMISSION (Server-authoritative score calculation)
// ==============================================================================
submissionsRouter.post('/quiz/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { participant_name, answers, submission_token } = req.body;

    const exp = await dbGetExperienceBySlugOrId(id);
    if (!exp || exp.type !== 'quiz') {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (exp.status !== 'published') {
      return res.status(400).json({ error: 'This quiz is not currently accepting responses.' });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers submitted.' });
    }

    const questions = await dbGetQuestionsForExperience(exp.id);
    const totalQuestions = questions.length;
    if (totalQuestions === 0) {
      return res.status(400).json({ error: 'Quiz has no questions.' });
    }

    const answerKeys = await dbGetPrivateAnswerKeys(exp.id);

    let correctCount = 0;
    const recordedAnswers: { question_id: string; selected_option_id: string; is_correct: boolean; correct_option_id?: string }[] = [];

    questions.forEach((q) => {
      const selectedOptId = answers[q.id];
      const key = answerKeys.find((k) => k.questionId === q.id);
      const isCorrect = Boolean(selectedOptId && key && key.correctOptionId === selectedOptId);

      if (isCorrect) {
        correctCount++;
      }

      recordedAnswers.push({
        question_id: q.id,
        selected_option_id: selectedOptId || '',
        is_correct: isCorrect,
        correct_option_id: key?.correctOptionId,
      });
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const subRef = submission_token || `ref_${Math.random().toString(36).substring(2, 10)}`;

    const submissionRecord = {
      id: subId,
      experienceId: exp.id,
      participantDisplayName: (participant_name || 'Anonymous Friend').trim().substring(0, 40),
      score: correctCount,
      totalQuestions,
      percentage,
      submissionReference: subRef,
    };

    const answersRecords = recordedAnswers.map((ans) => ({
      id: `qa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      submissionId: subId,
      questionId: ans.question_id,
      selectedOptionId: ans.selected_option_id,
      isCorrect: ans.is_correct,
    }));

    await dbCreateQuizSubmission(submissionRecord, answersRecords);

    let rankBadge = 'Acquaintance';
    let badgeColor = 'from-slate-500 to-slate-700';
    let feedback = "Nice try! You've got room to get to know each other better.";

    if (percentage === 100) {
      rankBadge = 'Soulmate Tier 🏆';
      badgeColor = 'from-purple-600 via-pink-500 to-amber-400';
      feedback = 'Unreal! You know every single secret and detail!';
    } else if (percentage >= 80) {
      rankBadge = 'Best Friend 💖';
      badgeColor = 'from-purple-600 to-pink-500';
      feedback = 'Certified bestie! You truly listen and pay attention.';
    } else if (percentage >= 60) {
      rankBadge = 'Close Friend ⭐';
      badgeColor = 'from-indigo-500 to-purple-600';
      feedback = 'Solid bond! You got most of the big stuff right.';
    } else if (percentage >= 40) {
      rankBadge = 'Casual Buddy ✌️';
      badgeColor = 'from-cyan-500 to-blue-600';
      feedback = 'Pretty good, but there are definitely surprises left!';
    }

    const expSettings = (exp.settings as any) || {};
    const breakdown = expSettings.show_answers
      ? recordedAnswers.map((ra) => ({
          question_id: ra.question_id,
          selected_option_id: ra.selected_option_id,
          is_correct: ra.is_correct,
          correct_option_id: ra.correct_option_id,
        }))
      : undefined;

    res.json({
      success: true,
      result: {
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        rank_badge: rankBadge,
        badge_color: badgeColor,
        feedback,
        submission_reference: subRef,
        participant_name: submissionRecord.participantDisplayName,
        quiz_title: exp.title,
        breakdown,
      },
    });
  } catch (err: any) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit quiz' });
  }
});

// ==============================================================================
// 2. ANONYMOUS QUESTIONS SUBMISSION
// ==============================================================================
submissionsRouter.post('/anonymous/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers, responder_name, consent_given } = req.body;

    const exp = await dbGetExperienceBySlugOrId(id);
    if (!exp || exp.type !== 'anonymous') {
      return res.status(404).json({ error: 'Anonymous experience not found' });
    }

    if (exp.status !== 'published') {
      return res.status(400).json({ error: 'This question box is currently closed.' });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'At least one response answer is required.' });
    }

    const validQuestions = await dbGetQuestionsForExperience(exp.id);
    const formattedAnswers = [];

    for (const item of answers) {
      const q = validQuestions.find((vq) => vq.id === item.question_id);
      if (!q) continue;

      const text = (item.response_text || item.text || '').trim();
      if (q.isRequired && !text && !item.selected_option_id) {
        return res.status(400).json({ error: `Please answer required question: "${q.questionText}"` });
      }

      formattedAnswers.push({
        question_id: q.id,
        question_text: q.questionText,
        response_text: text.substring(0, 1000),
        selected_option_id: item.selected_option_id || undefined,
      });
    }

    const responseId = `anon_res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const responseRef = `anon_${Math.random().toString(36).substring(2, 10)}`;

    const identityData =
      exp.privacyMode === 'mode_a' && responder_name && responder_name.trim().length > 0 && consent_given
        ? {
            id: `identity_${Date.now()}`,
            responseId,
            responderName: responder_name.trim().substring(0, 50),
            consentGiven: true,
            consentNotice: 'Responder voluntarily disclosed name to platform for moderation purposes. Creator cannot view.',
          }
        : undefined;

    await dbCreateAnonymousResponse(
      {
        id: responseId,
        experienceId: exp.id,
        responseReference: responseRef,
        answers: formattedAnswers,
        moderationStatus: 'approved',
      },
      identityData
    );

    res.json({
      success: true,
      message: 'Your anonymous response has been delivered safely to Cloud SQL.',
      response_reference: responseRef,
      privacy_mode: exp.privacyMode,
    });
  } catch (err: any) {
    console.error('Anonymous submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit anonymous response' });
  }
});

// ==============================================================================
// 3. THIS OR THAT POLL VOTING
// ==============================================================================
submissionsRouter.post('/poll/:id/vote', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { selected_option, voter_reference } = req.body;

    const exp = await dbGetExperienceBySlugOrId(id);
    if (!exp || exp.type !== 'poll') {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (exp.status !== 'published') {
      return res.status(400).json({ error: 'This poll is closed.' });
    }

    const poll = await dbGetPollForExperience(exp.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll data not found' });
    }

    if (!selected_option || !['A', 'B'].includes(selected_option)) {
      return res.status(400).json({ error: 'Invalid vote selection. Choose option A or B.' });
    }

    const voterRef = voter_reference || `voter_${req.ip || 'anon'}_${Math.random().toString(36).substring(2, 6)}`;

    const currentVotes = await dbGetPollVotes(poll.id);
    const existingVote = currentVotes.find((v) => v.voterReference === voterRef);
    if (existingVote) {
      const votesA = currentVotes.filter((v) => v.selectedOption === 'A').length;
      const votesB = currentVotes.filter((v) => v.selectedOption === 'B').length;
      const total = votesA + votesB;
      return res.status(200).json({
        success: true,
        already_voted: true,
        user_selection: existingVote.selectedOption,
        tally: {
          total_votes: total,
          votes_a: votesA,
          votes_b: votesB,
          percent_a: total > 0 ? Math.round((votesA / total) * 100) : 50,
          percent_b: total > 0 ? Math.round((votesB / total) * 100) : 50,
        },
      });
    }

    await dbRecordPollVote({
      id: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pollId: poll.id,
      selectedOption: selected_option,
      voterReference: voterRef,
    });

    const updatedVotes = await dbGetPollVotes(poll.id);
    const votesA = updatedVotes.filter((v) => v.selectedOption === 'A').length;
    const votesB = updatedVotes.filter((v) => v.selectedOption === 'B').length;
    const total = votesA + votesB;

    res.json({
      success: true,
      already_voted: false,
      user_selection: selected_option,
      tally: {
        total_votes: total,
        votes_a: votesA,
        votes_b: votesB,
        percent_a: total > 0 ? Math.round((votesA / total) * 100) : 50,
        percent_b: total > 0 ? Math.round((votesB / total) * 100) : 50,
      },
    });
  } catch (err: any) {
    console.error('Poll voting error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit vote' });
  }
});
