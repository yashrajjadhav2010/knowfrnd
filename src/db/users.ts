import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export const ADMIN_EMAIL = 'yashrajart1999@gmail.com';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  avatarUrl?: string
) {
  try {
    const isOwnerAdmin = Boolean(email && email.toLowerCase() === ADMIN_EMAIL);

    const cleanUsername = email
      ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
      : `user_${uid.slice(0, 6)}`;

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || (isOwnerAdmin ? 'Yashraj (Admin)' : 'VYBE Creator'),
        username: cleanUsername,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
        role: isOwnerAdmin ? 'admin' : 'user',
        accountStatus: 'active',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
          role: isOwnerAdmin ? 'admin' : 'user',
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to getOrCreateUser:', error);
    throw new Error('Database user sync failed.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to getUserByUid:', error);
    throw new Error('Database user lookup failed.', { cause: error });
  }
}

export async function getUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
