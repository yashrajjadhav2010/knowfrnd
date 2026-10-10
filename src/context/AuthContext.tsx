import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { api, getAuthToken, setAuthToken } from '../lib/api';

export const ADMIN_EMAIL = 'yashrajart1999@gmail.com';

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email?: string;
  public_display_name: string;
  username: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  account_status: 'active' | 'suspended' | 'deactivated';
  is_admin: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  isClerkLoaded: boolean;
  signInWithGoogle: () => Promise<void>;
  switchRole: (role: 'creator' | 'guest') => Promise<void>;
  signOut: () => void;
  openSignInModal: () => void;
  openSignUpModal: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  isClerkLoaded: false,
  signInWithGoogle: async () => {},
  switchRole: async () => {},
  signOut: () => {},
  openSignInModal: () => {},
  openSignUpModal: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Clerk hooks
  const clerk = useClerk();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          setAuthToken(idToken);
          const res = await api.getMe();
          if (res.authenticated && res.user) {
            setUser(res.user);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[Firebase Auth] Failed to fetch me with Firebase token:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Clerk state sync
  useEffect(() => {
    async function syncClerkUser() {
      // If already logged in with Firebase, don't overwrite with unauthenticated Clerk
      if (auth.currentUser) {
        setLoading(false);
        return;
      }

      if (!isClerkLoaded) return;

      if (isClerkSignedIn && clerkUser) {
        try {
          const token = await getToken();
          if (token) {
            setAuthToken(token);
          }
          const res = await api.getMe();
          if (res.authenticated && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.error('[Auth] Failed to sync Clerk user with backend:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // If not signed in via Clerk, check if local dev token exists
        const localToken = getAuthToken();
        if (localToken) {
          try {
            const res = await api.getMe();
            if (res.authenticated && res.user) {
              setUser(res.user);
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        } else {
          // Default to creator preview session so tester can immediately explore
          try {
            const demoRes = await api.switchDemoRole('creator');
            if (demoRes.token) {
              setAuthToken(demoRes.token);
              const me = await api.getMe();
              if (me.authenticated && me.user) {
                setUser(me.user);
              }
            }
          } catch {
            setUser(null);
          }
        }
        setLoading(false);
      }
    }

    syncClerkUser();
  }, [isClerkLoaded, isClerkSignedIn, clerkUser]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setAuthToken(token);
      const res = await api.getMe();
      if (res.authenticated && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Google Sign In failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: 'creator' | 'guest') => {
    setLoading(true);
    try {
      if (role === 'guest') {
        if (isClerkSignedIn) {
          await clerk.signOut();
        }
        await firebaseSignOut(auth).catch(() => {});
        setAuthToken(null);
        setUser(null);
      } else {
        const res = await api.switchDemoRole('creator');
        if (res.token) {
          setAuthToken(res.token);
          const me = await api.getMe();
          if (me.authenticated && me.user) {
            setUser(me.user);
          }
        }
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isClerkSignedIn) {
      try {
        await clerk.signOut();
      } catch (e) {
        console.warn('Clerk sign out:', e);
      }
    }
    await firebaseSignOut(auth).catch(() => {});
    setAuthToken(null);
    setUser(null);
  };

  const openSignInModal = () => {
    try {
      clerk.openSignIn();
    } catch {
      signInWithGoogle();
    }
  };

  const openSignUpModal = () => {
    try {
      clerk.openSignUp();
    } catch {
      signInWithGoogle();
    }
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    if (res.authenticated && res.user) {
      setUser(res.user);
    }
  };

  // Admin privileges are strictly restricted to yashrajart1999@gmail.com
  const currentEmail = (
    user?.email ||
    auth.currentUser?.email ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    ''
  ).toLowerCase();

  const isStrictlyYashrajAdmin = Boolean(
    currentEmail === ADMIN_EMAIL && (user?.is_admin || user?.role === 'admin' || Boolean(auth.currentUser?.email) || Boolean(clerkUser))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: isStrictlyYashrajAdmin,
        loading,
        isClerkLoaded,
        signInWithGoogle,
        switchRole,
        signOut,
        openSignInModal,
        openSignUpModal,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
