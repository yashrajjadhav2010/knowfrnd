import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { adminAuth } from '../src/lib/firebase-admin.ts';
import { getOrCreateUser, getUserByUid } from '../src/db/users.ts';

export const ADMIN_EMAIL = 'yashrajart1999@gmail.com';

export interface Profile {
  id: string;
  clerk_user_id: string;
  email?: string;
  public_display_name: string;
  username: string;
  avatar_url?: string;
  account_status: 'active' | 'suspended' | 'deactivated';
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: Profile;
  isAdmin?: boolean;
}

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkClient =
  clerkSecretKey && !clerkSecretKey.includes('placeholder')
    ? createClerkClient({ secretKey: clerkSecretKey })
    : null;

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next();
  }

  let uid = '';
  let email = '';
  let name = '';
  let avatarUrl = '';

  // 1. First attempt Firebase ID Token verification (MANDATORY Cloud SQL Firebase Auth)
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded && decoded.uid) {
      uid = decoded.uid;
      email = decoded.email || '';
      name = decoded.name || '';
      avatarUrl = decoded.picture || '';
    }
  } catch {
    // Not a Firebase token, continue to Clerk or session
  }

  // 2. Attempt Clerk Token verification if CLERK_SECRET_KEY is configured
  if (!uid && clerkClient && clerkSecretKey) {
    try {
      const verified = await verifyToken(token, { secretKey: clerkSecretKey });
      if (verified && verified.sub) {
        uid = verified.sub;
        try {
          const clerkUser = await clerkClient.users.getUser(uid);
          if (clerkUser) {
            email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
            name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || '';
            avatarUrl = clerkUser.imageUrl || '';
          }
        } catch (fetchErr) {
          console.warn('[Clerk] Failed to fetch full user info:', fetchErr);
        }
      }
    } catch {
      // Fallback
    }
  }

  // 3. Fallback to session token id or preview role token
  if (!uid) {
    if (token.startsWith('user_') || token.startsWith('usr_') || token.startsWith('admin_')) {
      uid = token;
    } else if (token.startsWith('vybe_session_')) {
      uid = token.replace('vybe_session_', '');
    } else {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          uid = payload.sub || payload.user_id || '';
          email = payload.email || '';
          name = payload.name || '';
        }
      } catch {
        uid = token;
      }
    }
  }

  if (uid) {
    if (!email) {
      try {
        const existing = await getUserByUid(uid);
        if (existing) {
          email = existing.email;
          name = existing.displayName || name;
          avatarUrl = existing.avatarUrl || avatarUrl;
        }
      } catch {}
    }

    const isConfiguredAdmin = Boolean(email && email.toLowerCase() === ADMIN_EMAIL);

    // Synchronize to Cloud SQL users table
    try {
      const dbUser = await getOrCreateUser(
        uid,
        email || `${uid}@vybe.local`,
        name || (isConfiguredAdmin ? 'Yashraj (Admin)' : 'VYBE Creator'),
        avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`
      );

      const profile: Profile = {
        id: String(dbUser.id),
        clerk_user_id: dbUser.uid,
        email: dbUser.email || email,
        public_display_name: dbUser.displayName || name || (isConfiguredAdmin ? 'Yashraj (Admin)' : 'VYBE Creator'),
        username: dbUser.username,
        avatar_url: dbUser.avatarUrl || undefined,
        account_status: (dbUser.accountStatus as any) || 'active',
        role: isConfiguredAdmin ? 'admin' : 'user',
        created_at: dbUser.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      req.user = profile;
      req.isAdmin = isConfiguredAdmin;
    } catch (dbErr) {
      console.warn('[Auth] Database sync fallback:', dbErr);
      // Memory fallback if connection hiccups
      const fallbackProfile: Profile = {
        id: `usr_${uid}`,
        clerk_user_id: uid,
        email: email || '',
        public_display_name: name || (isConfiguredAdmin ? 'Yashraj (Admin)' : 'VYBE Creator'),
        username: email ? email.split('@')[0] : `user_${uid.slice(0, 6)}`,
        avatar_url: avatarUrl,
        account_status: 'active',
        role: isConfiguredAdmin ? 'admin' : 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      req.user = fallbackProfile;
      req.isAdmin = isConfiguredAdmin;
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  if (req.user.account_status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended by administration.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const isUserEmailAdmin = Boolean(req.user.email && req.user.email.toLowerCase() === ADMIN_EMAIL);

  if (!isUserEmailAdmin) {
    return res.status(403).json({ error: 'Access denied: Admin panel is restricted to yashrajart1999@gmail.com only.' });
  }

  req.isAdmin = true;
  next();
}
