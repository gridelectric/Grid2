'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { User as AppUser } from '@/types';
import { getLandingPathForRole } from '@/lib/auth/roleLanding';

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/magic-link',
  '/forbidden',
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string, accessToken?: string) => {
    if (!userId) {
      return;
    }

    try {
      let token = accessToken;
      if (!token) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        token = session?.access_token;
      }

      const response = await fetch('/api/auth/profile', {
        cache: 'no-store',
        headers: token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : undefined,
      });

      if (!response.ok) {
        const body = await response.text();
        console.error('Error fetching profile:', {
          status: response.status,
          body,
        });
        return;
      }

      const payload = (await response.json()) as { profile?: AppUser };
      if (payload.profile) {
        setProfile(payload.profile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const applySession = async (session: Session | null) => {
      try {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.access_token);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error applying session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          setIsLoading(false);
          return;
        }

        await applySession(session);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase auth callbacks should not block on async operations.
      setTimeout(() => {
        void applySession(session);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.push('/login');
        return;
      }

      if (user && profile?.must_reset_password === true && !pathname?.startsWith('/set-password')) {
        router.push('/set-password');
        return;
      }

      if (user && profile && profile.must_reset_password === false && pathname?.startsWith('/set-password')) {
        router.push(getLandingPathForRole(profile?.role));
      }
    }
  }, [user, profile, isLoading, pathname, isPublicRoute, router]);

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
