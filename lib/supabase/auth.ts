'use client';

import { supabase } from './client';
import type { Database } from './types';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  profile: UserProfile | null;
  role: Role | null;
}

export class AuthService {
  // Sign up new user with role selection
  static async signUp(email: string, password: string, fullName?: string, roleName?: string) {
    try {
      console.log('🔄 Starting signup process for:', email, 'with role:', roleName);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role_name: roleName || 'Patient'
          }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        
        // Handle specific error for existing user
        if (error.message === 'User already registered') {
          const userExistsError = new Error('User already registered');
          userExistsError.name = 'UserAlreadyExistsError'; // Custom error name
          throw userExistsError;
        }
        
        // Handle misleading "Invalid login credentials" error during signup
        if (error.message === 'Invalid login credentials') {
          // This often means the user already exists, so treat it as such
          const userExistsError = new Error('Email already registered or incorrect information. Try signing in or resetting your password.');
          userExistsError.name = 'UserAlreadyExistsError';
          throw userExistsError;
        }
        
        // Handle other signup-related errors that might indicate existing user
        if (error.message.includes('already') || error.message.includes('exists')) {
          const userExistsError = new Error('This account already exists');
          userExistsError.name = 'UserAlreadyExistsError';
          throw userExistsError;
        }
        
        throw error;
      }

      // CRITICAL CHECK: If no error but identities array is empty, user already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        console.log('⚠️ User signup returned empty identities array - email already exists');
        const userExistsError = new Error('This account already exists');
        userExistsError.name = 'UserAlreadyExistsError';
        throw userExistsError;
      }

      // CRITICAL: Explicitly set session if one was returned
      if (data.session) {
        console.log('✅ Setting session explicitly after signup');
        await supabase.auth.setSession(data.session);
      }

      console.log('✅ Signup successful, user created:', data.user?.id);
      console.log('📋 User identities:', data.user?.identities);
      console.log('📧 Email confirmed at:', data.user?.email_confirmed_at);
      return data;
    } catch (error) {
      console.error('❌ SignUp error:', error);
      throw error;
    }
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    try {
      console.log('🔄 Starting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        if (error.message === 'Invalid login credentials') {
          throw new Error('Email or password incorrect');
        }
        throw error;
      }

      // CRITICAL: Explicitly set session after successful sign in
      if (data.session) {
        console.log('✅ Setting session explicitly after sign in');
        await supabase.auth.setSession(data.session);
      }

      console.log('✅ Sign in successful for user:', data.user?.id);
      console.log('📧 Email confirmed at:', data.user?.email_confirmed_at);
      return data;
    } catch (error) {
      console.error('❌ SignIn error:', error);
      throw error;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      console.log('🔄 Starting sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ SignOut error:', error);
      throw error;
    }
  }

  // Get current authenticated user (without profile)
  static async getCurrentAuthUser() {
    try {
      console.log('🔄 Getting current auth user...');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // Don't log "Auth session missing!" as an error since it's an expected state
        if (error.message !== 'Auth session missing!') {
          console.error('❌ Error getting auth user:', error);
        } else {
          console.log('ℹ️ No auth session found (expected when not logged in)');
        }
        return null;
      }
      
      if (user) {
        console.log('✅ Auth user found:', {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at
        });
      } else {
        console.log('ℹ️ No authenticated user');
      }
      
      return user;
    } catch (error) {
      console.error('❌ Error in getCurrentAuthUser:', error);
      return null;
    }
  }

  // Get user profile with better error handling
  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; role: Role | null }> {
    try {
      console.log('🔄 Getting profile for user ID:', userId);

      // First, check if the user_profiles table exists and is accessible
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        
        // Check if it's a table access error
        if (profileError.code === 'PGRST116' || profileError.message.includes('JSON object requested')) {
          console.error('🚨 Database access error - user profile may not exist or RLS policy issue');
          
          // Try to create a profile for this user if it doesn't exist
          try {
            console.log('🔄 Attempting to create missing user profile...');
            const { data: authUser } = await supabase.auth.getUser();
            
            if (authUser.user && authUser.user.id === userId) {
              // Get Patient role ID
              const { data: patientRole } = await supabase
                .from('roles')
                .select('id')
                .eq('name', 'Patient')
                .single();

              if (patientRole) {
                const { data: newProfile, error: createError } = await supabase
                  .from('user_profiles')
                  .insert({
                    id: userId,
                    email: authUser.user.email || '',
                    role_id: patientRole.id,
                    full_name: authUser.user.user_metadata?.full_name || authUser.user.email || '',
                    username: (authUser.user.email || '').replace('@', '_at_').replace('.', '_'),
                    preferred_language: 'en'
                  })
                  .select()
                  .single();

                if (!createError && newProfile) {
                  console.log('✅ Created missing user profile:', newProfile.id);
                  
                  // Get the role for the new profile
                  const { data: roleData } = await supabase
                    .from('roles')
                    .select('*')
                    .eq('id', newProfile.role_id)
                    .single();

                  return {
                    profile: newProfile,
                    role: roleData || null
                  };
                }
              }
            }
          } catch (createError) {
            console.error('❌ Failed to create missing profile:', createError);
          }
        }
        
        return { profile: null, role: null };
      }

      if (!profileData) {
        console.log('⚠️ Profile not found for user:', userId);
        return { profile: null, role: null };
      }

      console.log('✅ Profile found:', {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        role_id: profileData.role_id
      });

      let userRole: Role | null = null;
      if (profileData.role_id) {
        console.log('🔄 Fetching role for role_id:', profileData.role_id);
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', profileData.role_id)
          .single();

        if (roleError) {
          console.error('❌ Error fetching role:', roleError);
        } else {
          userRole = roleData;
          console.log('✅ Role found:', userRole.name);
        }
      }

      return {
        profile: profileData,
        role: userRole
      };
    } catch (error) {
      console.error('❌ Error in getUserProfile:', error);
      return { profile: null, role: null };
    }
  }

  // Get complete user (auth + profile)
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('🔄 Getting complete current user...');
      
      // First get the authenticated user
      const authUser = await this.getCurrentAuthUser();
      if (!authUser) {
        console.log('ℹ️ No authenticated user found');
        return null;
      }

      console.log('🔄 Auth user found, getting profile...');
      
      // Then get their profile
      const { profile, role } = await this.getUserProfile(authUser.id);

      const completeUser: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        email_confirmed_at: authUser.email_confirmed_at,
        profile,
        role
      };
      
      console.log('✅ Complete user assembled:', {
        id: completeUser.id,
        email: completeUser.email,
        email_confirmed_at: completeUser.email_confirmed_at,
        has_profile: !!completeUser.profile,
        has_role: !!completeUser.role,
        role_name: completeUser.role?.name
      });

      return completeUser;
    } catch (error) {
      console.error('❌ Error in getCurrentUser:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<UserProfile>) {
    try {
      console.log('🔄 Updating profile with:', updates);
      const authUser = await this.getCurrentAuthUser();
      if (!authUser) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Profile updated successfully');
      return data;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  // Check if user has permission
  static hasPermission(role: Role | null, permission: string): boolean {
    if (!role || !role.permissions) return false;
    
    const permissions = role.permissions as string[];
    return permissions.includes(permission) || permissions.includes('manage:all');
  }

  // Check if user has any of the specified roles
  static hasRole(role: Role | null, ...roleNames: string[]): boolean {
    if (!role) {
      return false;
    }
    return roleNames.includes(role.name);
  }

  // Get user's role name
  static getRoleName(role: Role | null): string {
    return role?.name || 'Unknown';
  }
}

// Auth state change listener - modified to use session data directly
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      console.log('🔄 Auth state change event:', event, 'Session exists:', !!session);
      console.log('📋 Session details:', session ? {
        user_id: session.user?.id,
        email: session.user?.email,
        email_confirmed_at: session.user?.email_confirmed_at,
        expires_at: session.expires_at
      } : 'No session');
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('👋 User signed out or no session');
        callback(null);
        return;
      }

      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        console.log('🔄 User authenticated, getting profile using session data...');
        
        // Use session.user directly instead of calling getCurrentUser()
        const sessionUser = session.user;
        console.log('📋 Session user data:', {
          id: sessionUser.id,
          email: sessionUser.email,
          email_confirmed_at: sessionUser.email_confirmed_at,
          created_at: sessionUser.created_at
        });
        
        // Get the user's profile and role using the session user ID
        console.log('🔄 Fetching profile for session user:', sessionUser.id);
        const { profile, role } = await AuthService.getUserProfile(sessionUser.id);
        
        // Construct the complete AuthUser object
        const authUser: AuthUser = {
          id: sessionUser.id,
          email: sessionUser.email!,
          email_confirmed_at: sessionUser.email_confirmed_at,
          profile,
          role
        };
        
        console.log('✅ Complete user data from session assembled:', {
          id: authUser.id,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at,
          has_profile: !!authUser.profile,
          has_role: !!authUser.role,
          role_name: authUser.role?.name
        });
        
        callback(authUser);
      }
    } catch (error) {
      console.error('❌ Error in auth state change:', error);
      callback(null);
    }
  });
}