import { db } from './index.ts';
import {
  users,
  experiences,
  questions,
  questionOptions,
  privateAnswerKeys,
  quizSubmissions,
  quizAnswers,
  anonymousResponses,
  anonymousResponseIdentities,
  polls,
  pollVotes,
  reports,
  adminAuditLogs,
  platformSettings,
} from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

// Sanitized Query Helpers with Two-Layer Error Handling

// --- Users ---
export async function dbGetUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Failed to get users:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to get user by UID:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbUpdateUserStatus(uid: string, status: string) {
  try {
    const rows = await db
      .update(users)
      .set({ accountStatus: status })
      .where(eq(users.uid, uid))
      .returning();
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to update user status:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Experiences ---
export async function dbGetPublishedExperiences(type?: string, search?: string) {
  try {
    const all = await db
      .select()
      .from(experiences)
      .where(eq(experiences.status, 'published'))
      .orderBy(desc(experiences.createdAt));

    let filtered = all;
    if (type && type !== 'all') {
      filtered = filtered.filter((e) => e.type === type);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  } catch (error) {
    console.error('Failed to get published experiences:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetExperienceBySlugOrId(slugOrId: string) {
  try {
    let rows = await db.select().from(experiences).where(eq(experiences.slug, slugOrId)).limit(1);
    if (!rows.length) {
      rows = await db.select().from(experiences).where(eq(experiences.id, slugOrId)).limit(1);
    }
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to get experience by identifier:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbCreateExperience(expData: typeof experiences.$inferInsert) {
  try {
    const rows = await db.insert(experiences).values(expData).returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to create experience:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetExperiencesByOwner(ownerUid: string) {
  try {
    return await db
      .select()
      .from(experiences)
      .where(eq(experiences.ownerUid, ownerUid))
      .orderBy(desc(experiences.createdAt));
  } catch (error) {
    console.error('Failed to get user experiences:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetAllExperiencesAdmin() {
  try {
    return await db.select().from(experiences).orderBy(desc(experiences.createdAt));
  } catch (error) {
    console.error('Failed to get all experiences for admin:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbUpdateExperienceStatus(id: string, status: string) {
  try {
    const rows = await db
      .update(experiences)
      .set({ status, updatedAt: new Date() })
      .where(eq(experiences.id, id))
      .returning();
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to update experience status:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Questions & Options ---
export async function dbGetQuestionsForExperience(expId: string) {
  try {
    const qs = await db
      .select()
      .from(questions)
      .where(eq(questions.experienceId, expId))
      .orderBy(questions.displayOrder);

    const result = [];
    for (const q of qs) {
      const opts = await db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, q.id))
        .orderBy(questionOptions.displayOrder);

      result.push({
        ...q,
        options: opts,
      });
    }
    return result;
  } catch (error) {
    console.error('Failed to get questions for experience:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbCreateQuestionWithOptions(
  qData: typeof questions.$inferInsert,
  optsData: typeof questionOptions.$inferInsert[],
  correctOptionId?: string
) {
  try {
    await db.insert(questions).values(qData);
    if (optsData.length > 0) {
      await db.insert(questionOptions).values(optsData);
    }
    if (correctOptionId) {
      await db.insert(privateAnswerKeys).values({
        id: `key_${qData.id}`,
        questionId: qData.id,
        correctOptionId,
      });
    }
  } catch (error) {
    console.error('Failed to create question with options:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetPrivateAnswerKeys(expId: string) {
  try {
    const qs = await db.select().from(questions).where(eq(questions.experienceId, expId));
    const keys = [];
    for (const q of qs) {
      const row = await db
        .select()
        .from(privateAnswerKeys)
        .where(eq(privateAnswerKeys.questionId, q.id))
        .limit(1);
      if (row[0]) keys.push(row[0]);
    }
    return keys;
  } catch (error) {
    console.error('Failed to get answer keys:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Submissions & Answers ---
export async function dbCreateQuizSubmission(
  submission: typeof quizSubmissions.$inferInsert,
  answers: (typeof quizAnswers.$inferInsert)[]
) {
  try {
    const rows = await db.insert(quizSubmissions).values(submission).returning();
    if (answers.length > 0) {
      await db.insert(quizAnswers).values(answers);
    }
    return rows[0];
  } catch (error) {
    console.error('Failed to create quiz submission:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetQuizSubmissionsForExperience(expId: string) {
  try {
    return await db
      .select()
      .from(quizSubmissions)
      .where(eq(quizSubmissions.experienceId, expId))
      .orderBy(desc(quizSubmissions.submittedAt));
  } catch (error) {
    console.error('Failed to get quiz submissions for experience:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetAllQuizSubmissionsAdmin() {
  try {
    return await db.select().from(quizSubmissions).orderBy(desc(quizSubmissions.submittedAt));
  } catch (error) {
    console.error('Failed to get all quiz submissions:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Anonymous Responses ---
export async function dbCreateAnonymousResponse(
  respData: typeof anonymousResponses.$inferInsert,
  identityData?: typeof anonymousResponseIdentities.$inferInsert
) {
  try {
    const rows = await db.insert(anonymousResponses).values(respData).returning();
    if (identityData) {
      await db.insert(anonymousResponseIdentities).values(identityData);
    }
    return rows[0];
  } catch (error) {
    console.error('Failed to create anonymous response:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetAnonymousResponsesForExperience(expId: string) {
  try {
    return await db
      .select()
      .from(anonymousResponses)
      .where(eq(anonymousResponses.experienceId, expId))
      .orderBy(desc(anonymousResponses.submittedAt));
  } catch (error) {
    console.error('Failed to get anonymous responses for experience:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetAllAnonymousResponsesAdmin() {
  try {
    const resps = await db
      .select()
      .from(anonymousResponses)
      .orderBy(desc(anonymousResponses.submittedAt));

    const enriched = [];
    for (const r of resps) {
      const idRows = await db
        .select()
        .from(anonymousResponseIdentities)
        .where(eq(anonymousResponseIdentities.responseId, r.id))
        .limit(1);
      enriched.push({
        ...r,
        identity: idRows[0] || null,
      });
    }
    return enriched;
  } catch (error) {
    console.error('Failed to get all anonymous responses for admin:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Polls & Votes ---
export async function dbCreatePoll(pollData: typeof polls.$inferInsert) {
  try {
    const rows = await db.insert(polls).values(pollData).returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to create poll:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetPollForExperience(expId: string) {
  try {
    const rows = await db.select().from(polls).where(eq(polls.experienceId, expId)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to get poll for experience:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetPollVotes(pollId: string) {
  try {
    return await db.select().from(pollVotes).where(eq(pollVotes.pollId, pollId));
  } catch (error) {
    console.error('Failed to get poll votes:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbRecordPollVote(voteData: typeof pollVotes.$inferInsert) {
  try {
    const rows = await db.insert(pollVotes).values(voteData).returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to record poll vote:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Reports ---
export async function dbCreateReport(repData: typeof reports.$inferInsert) {
  try {
    const rows = await db.insert(reports).values(repData).returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to create report:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetReports() {
  try {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  } catch (error) {
    console.error('Failed to get reports:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbUpdateReport(id: string, status: string, notes?: string, adminId?: string) {
  try {
    const rows = await db
      .update(reports)
      .set({
        status,
        resolutionNotes: notes,
        assignedAdminId: adminId,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to update report:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Audit Logs ---
export async function dbCreateAuditLog(logData: typeof adminAuditLogs.$inferInsert) {
  try {
    const rows = await db.insert(adminAuditLogs).values(logData).returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to create audit log:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbGetAuditLogs() {
  try {
    return await db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(50);
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// --- Platform Settings ---
export async function dbGetPlatformSettings() {
  try {
    return await db.select().from(platformSettings);
  } catch (error) {
    console.error('Failed to get platform settings:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function dbUpdatePlatformSetting(key: string, value: any) {
  try {
    const rows = await db
      .insert(platformSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to update platform setting:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
