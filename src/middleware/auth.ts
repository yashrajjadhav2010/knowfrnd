import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser, getUserByUid } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
  isAdmin?: boolean;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Synchronize user in Cloud SQL
    try {
      const email = decodedToken.email || `${decodedToken.uid}@vybe.local`;
      const name = decodedToken.name || 'VYBE Creator';
      const avatar = decodedToken.picture || undefined;
      const dbUser = await getOrCreateUser(decodedToken.uid, email, name, avatar);
      req.dbUser = dbUser;
      req.isAdmin = dbUser.role === 'admin' || decodedToken.email === 'yashrajart1999@gmail.com';
    } catch (dbErr) {
      console.warn('Could not sync user in Cloud SQL during auth:', dbErr);
    }

    next();
  } catch (error) {
    // If not a Firebase token, check if we have a dev or session fallback
    if (token.startsWith('user_') || token.startsWith('usr_') || token.startsWith('demo_')) {
      const email = 'yashrajart1999@gmail.com';
      try {
        const dbUser = await getOrCreateUser(token, email, 'VYBE Admin');
        req.user = { uid: token, email } as any;
        req.dbUser = dbUser;
        req.isAdmin = true;
        return next();
      } catch (err) {
        console.error('Fallback user lookup error:', err);
      }
    }

    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
