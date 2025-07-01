'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, onAuthStateChange, type AuthUser } from '@/lib/supabase/auth';
import { toast } from 'sonner';

// Re-export AuthUser type for use in other components
export type { AuthUser } from '@/lib/supabase/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roleNames: string[]) => boolean;
  getRoleName: () => string;
  clearAuthState: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    console.log('🧹 Clearing auth state');
    setUser(null);
    setLoading(false);
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user from AuthContext...');
      const currentUser = await AuthService.getCurrentUser();
      console.log('✅ User refreshed:', currentUser ? {
        id: currentUser.id,
        email: currentUser.email,
        has_profile: !!currentUser.profile
      } : 'No user');
      setUser(currentUser);
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial user using direct auth check instead of getCurrentUser
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth in AuthContext...');
        
        // Use direct auth user check first
        const authUser = await AuthService.getCurrentAuthUser();
        if (!authUser) {
          if (mounted) {
            console.log('ℹ️ No authenticated user found during initialization');
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log('🔄 Auth user found during initialization, getting profile...');
        console.log('📋 Auth user details:', {
          id: authUser.id,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at
        });

        // Get profile for authenticated user
        const { profile, role } = await AuthService.getUserProfile(authUser.id);
        const completeUser: AuthUser = {
          id: authUser.id,
          email: authUser.email!,
          email_confirmed_at: authUser.email_confirmed_at,
          profile,
          role
        };

        if (mounted) {
          console.log('✅ Initial user set:', {
            id: completeUser.id,
            email: completeUser.email,
            email_confirmed_at: completeUser.email_confirmed_at,
            has_profile: !!completeUser.profile,
            has_role: !!completeUser.role,
            role_name: completeUser.role?.name
          });
          setUser(completeUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (mounted) {
        console.log('🔄 Auth state changed in AuthContext, new user:', user ? {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          has_profile: !!user.profile,
          has_role: !!user.role,
          role_name: user.role?.name
        } : 'No user');
        
        setUser(user);
        setLoading(false);
        
        // Show success toast when user successfully logs in
        if (user && user.profile) {
          toast.success('Login successful!', {
            description: `Welcome ${user.profile.full_name || user.email}`
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔄 Starting sign in process from AuthContext...');
      await AuthService.signIn(email, password);
      // Let onAuthStateChange handle the user state update
    } catch (error) {
      setLoading(false);
      console.error('❌ Sign in error in AuthContext:', error);
      toast.error('Login error', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, role?: string) => {
    setLoading(true);
    try {
      console.log('🔄 Starting signup process from AuthContext with role:', role);
      const { user: newUser, session } = await AuthService.signUp(email, password, fullName, role);
      
      console.log('📋 Signup result:', {
        user_id: newUser?.id,
        email: newUser?.email,
        email_confirmed_at: newUser?.email_confirmed_at,
        has_session: !!session
      });
      
      // Check if email confirmation is required
      if (newUser && !newUser.email_confirmed_at) {
        console.log('📧 Email confirmation required for user:', newUser.id);
        // Email confirmation required
        toast.success('Account created successfully!', {
          description: 'Please check your email and click the confirmation link to activate your account.',
          duration: 8000
        });
        
        // Additional info toast
        setTimeout(() => {
          toast.info('Verification required', {
            description: `A confirmation email has been sent to ${email}. Click the link to complete your registration.`,
            duration: 10000
          });
        }, 1000);
        
        setLoading(false);
        return;
      }
      
      // If session exists immediately (email confirmation disabled)
      if (session) {
        console.log('✅ Session exists immediately after signup');
        toast.success('Account created successfully!', {
          description: 'Your profile is being configured...'
        });
        // Let onAuthStateChange handle the user state update
      } else {
        console.log('ℹ️ No session after signup, setting loading to false');
        setLoading(false);
      }
      
    } catch (err: any) {
      setLoading(false);
      console.error('❌ Sign up error in AuthContext:', err);

      // Specific handling for "User already registered" error
      if (err.name === 'UserAlreadyExistsError') {
        toast.error('Oops!', {
          description: `This email is already in use. Please sign in or check your email for the confirmation link.`,
          duration: 10000
        });
        
        // Additional helpful toast
        setTimeout(() => {
          toast.info('What to do now?', {
            description: 'Try signing in with your existing credentials, or use "Forgot password" if needed.',
            duration: 8000
          });
        }, 1500);
      } else {
        toast.error('Error creating account', {
          description: err instanceof Error ? err.message : 'An error occurred'
        });
      }
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🔄 Starting sign out from AuthContext...');
      await AuthService.signOut();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('❌ SignOut error in AuthContext:', error);
      // Even if signOut fails, clear local state
      setUser(null);
      toast.error('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      console.log('🔄 Updating profile from AuthContext:', updates);
      const updatedProfile = await AuthService.updateProfile(updates);
      setUser({
        ...user,
        profile: updatedProfile
      });
      toast.success('Profile updated');
    } catch (error) {
      console.error('❌ Error updating profile in AuthContext:', error);
      toast.error('Error updating profile');
      throw error;
    }
  };

  const hasPermission = (permission: string) => {
    return AuthService.hasPermission(user?.role || null, permission);
  };

  const hasRole = (...roleNames: string[]) => {
    return AuthService.hasRole(user?.role || null, ...roleNames);
  };

  const getRoleName = () => {
    return AuthService.getRoleName(user?.role || null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      hasPermission,
      hasRole,
      getRoleName,
      clearAuthState,
      refreshUser
    }}>
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