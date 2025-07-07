
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { handleApiError, showErrorToast } from '@/lib/errorHandler';
import config from '@/lib/config';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  requiresMFA: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; requiresMFA?: boolean }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  completeMFAChallenge: () => void;
  isAdmin: boolean;
  isTrainer: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check MFA requirement
          setTimeout(async () => {
            if (mounted) {
              await fetchUserRole(session.user.id);
              await checkMFARequirement();
            }
          }, 0);
        } else {
          setUserRole(null);
          setRequiresMFA(false);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          handleApiError(error, 'Auth initialization');
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserRole(session.user.id);
            await checkMFARequirement();
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        handleApiError(error, 'Fetch user role');
        return;
      }

      setUserRole(profile?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };

  // Check MFA requirement
  const checkMFARequirement = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (error) {
        console.error('Error checking MFA requirement:', error);
        return;
      }

      const requiresMFAVerification = data.nextLevel === 'aal2' && data.currentLevel === 'aal1';
      setRequiresMFA(requiresMFAVerification);
      
      console.log('MFA Status:', {
        currentLevel: data.currentLevel,
        nextLevel: data.nextLevel,
        requiresMFA: requiresMFAVerification
      });
    } catch (error) {
      console.error('Error checking MFA requirement:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      
      if (error) {
        showErrorToast(error, 'Sign in');
        return { error };
      }

      // Check if MFA is required after successful password authentication
      await checkMFARequirement();
      
      return { error: null, requiresMFA };
    } catch (error) {
      const apiError = handleApiError(error, 'Sign in');
      showErrorToast(apiError);
      return { error: apiError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'user') => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
            role: role
          }
        }
      });
      
      if (error) {
        showErrorToast(error, 'Sign up');
      } else {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account."
        });
      }
      
      return { error };
    } catch (error) {
      const apiError = handleApiError(error, 'Sign up');
      showErrorToast(apiError);
      return { error: apiError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });
      
      if (error) {
        showErrorToast(error, 'Password reset');
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for password reset instructions."
        });
      }
      
      return { error };
    } catch (error) {
      const apiError = handleApiError(error, 'Password reset');
      showErrorToast(apiError);
      return { error: apiError };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state first to ensure UI updates immediately
      setUser(null);
      setSession(null);
      setUserRole(null);
      setRequiresMFA(false);
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
      }
      
      // Try to sign out from Supabase, but don't fail if session is already gone
      const { error } = await supabase.auth.signOut();
      
      // Only show error if it's not a session-related error
      if (error && !error.message?.includes('session') && !error.message?.includes('Session')) {
        console.warn('Sign out warning:', error);
        showErrorToast(error, 'Sign out');
      }
      
    } catch (error: any) {
      // Don't show errors for session-related issues during logout
      if (!error.message?.includes('session') && !error.message?.includes('Session')) {
        console.error('Sign out error:', error);
        showErrorToast(error, 'Sign out');
      }
    } finally {
      setLoading(false);
    }
  };

  // Complete MFA challenge (called after successful MFA verification)
  const completeMFAChallenge = () => {
    setRequiresMFA(false);
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    requiresMFA,
    signIn,
    signUp,
    signOut,
    resetPassword,
    completeMFAChallenge,
    isAdmin: userRole === 'admin',
    isTrainer: userRole === 'trainer',
    isUser: userRole === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
