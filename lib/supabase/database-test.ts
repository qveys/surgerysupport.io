import { supabase } from './client';

export interface DatabaseTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class DatabaseTestService {
  static async runAllTests(): Promise<DatabaseTestResult[]> {
    const results: DatabaseTestResult[] = [];

    console.log('🧪 Starting comprehensive database tests...');

    // Test 1: Basic connection
    results.push(await this.testConnection());

    // Test 2: Check if tables exist
    results.push(await this.testTablesExist());

    // Test 3: Check if roles exist
    results.push(await this.testRolesExist());

    // Test 4: Test RLS policies
    results.push(await this.testRLSPolicies());

    // Test 5: Test user profile creation
    results.push(await this.testUserProfileCreation());

    // Test 6: Test auth user vs profile sync
    results.push(await this.testAuthUserProfileSync());

    // Test 7: Test trigger functionality
    results.push(await this.testTriggerFunctionality());

    // Test 8: Test permissions
    results.push(await this.testPermissions());

    console.log('🧪 Database tests completed');
    return results;
  }

  private static async testConnection(): Promise<DatabaseTestResult> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('count')
        .limit(1);

      if (error) {
        return {
          test: 'Database Connection',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          details: error
        };
      }

      return {
        test: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to database'
      };
    } catch (error) {
      return {
        test: 'Database Connection',
        status: 'fail',
        message: `Connection error: ${error}`,
        details: error
      };
    }
  }

  private static async testTablesExist(): Promise<DatabaseTestResult> {
    const requiredTables = [
      'roles',
      'user_profiles',
      'appointments',
      'checklist_items',
      'documents',
      'medications',
      'conversations',
      'messages',
      'patient_images'
    ];

    const missingTables: string[] = [];
    const existingTables: string[] = [];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
            missingTables.push(table);
          } else {
            // Table exists but might have RLS issues
            existingTables.push(table);
          }
        } else {
          existingTables.push(table);
        }
      } catch (err) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      return {
        test: 'Required Tables',
        status: 'fail',
        message: `Missing tables: ${missingTables.join(', ')}`,
        details: { missing: missingTables, existing: existingTables }
      };
    }

    return {
      test: 'Required Tables',
      status: 'pass',
      message: `All ${requiredTables.length} required tables exist`,
      details: { existing: existingTables }
    };
  }

  private static async testRolesExist(): Promise<DatabaseTestResult> {
    try {
      const { data: roles, error } = await supabase
        .from('roles')
        .select('name, permissions');

      if (error) {
        return {
          test: 'Roles Configuration',
          status: 'fail',
          message: `Cannot access roles table: ${error.message}`,
          details: error
        };
      }

      const requiredRoles = ['Patient', 'Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales'];
      const existingRoles = roles?.map(r => r.name) || [];
      const missingRoles = requiredRoles.filter(role => !existingRoles.includes(role));

      if (missingRoles.length > 0) {
        return {
          test: 'Roles Configuration',
          status: 'fail',
          message: `Missing roles: ${missingRoles.join(', ')}`,
          details: { existing: existingRoles, missing: missingRoles, roles }
        };
      }

      return {
        test: 'Roles Configuration',
        status: 'pass',
        message: `All ${requiredRoles.length} required roles exist`,
        details: { roles }
      };
    } catch (error) {
      return {
        test: 'Roles Configuration',
        status: 'fail',
        message: `Error checking roles: ${error}`,
        details: error
      };
    }
  }

  private static async testRLSPolicies(): Promise<DatabaseTestResult> {
    try {
      // Test if we can access user_profiles table (this will test RLS)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('RLS') || error.message.includes('policy') || error.code === '42501') {
          return {
            test: 'RLS Policies',
            status: 'fail',
            message: `RLS policy error: ${error.message}`,
            details: error
          };
        }
      }

      return {
        test: 'RLS Policies',
        status: 'pass',
        message: 'RLS policies allow basic access'
      };
    } catch (error) {
      return {
        test: 'RLS Policies',
        status: 'fail',
        message: `RLS test error: ${error}`,
        details: error
      };
    }
  }

  private static async testUserProfileCreation(): Promise<DatabaseTestResult> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          test: 'User Profile Creation',
          status: 'warning',
          message: 'No authenticated user to test profile creation',
          details: { authError }
        };
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        return {
          test: 'User Profile Creation',
          status: 'fail',
          message: `Cannot check user profile: ${profileError.message}`,
          details: { profileError, userId: user.id }
        };
      }

      if (!profile) {
        return {
          test: 'User Profile Creation',
          status: 'fail',
          message: 'User profile does not exist for authenticated user',
          details: { 
            userId: user.id, 
            userEmail: user.email,
            userCreatedAt: user.created_at,
            profileExists: false
          }
        };
      }

      return {
        test: 'User Profile Creation',
        status: 'pass',
        message: 'User profile exists for authenticated user',
        details: { 
          userId: user.id,
          profileId: profile.id,
          profileEmail: profile.email,
          profileRole: profile.role_id
        }
      };
    } catch (error) {
      return {
        test: 'User Profile Creation',
        status: 'fail',
        message: `Profile creation test error: ${error}`,
        details: error
      };
    }
  }

  private static async testAuthUserProfileSync(): Promise<DatabaseTestResult> {
    try {
      // This test requires service role access, so we'll do a basic check
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          test: 'Auth-Profile Sync',
          status: 'warning',
          message: 'No authenticated user to test sync',
          details: { authError }
        };
      }

      // Count profiles vs auth users (we can only check current user)
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id);

      if (profileError) {
        return {
          test: 'Auth-Profile Sync',
          status: 'fail',
          message: `Cannot check profile sync: ${profileError.message}`,
          details: profileError
        };
      }

      const hasProfile = profiles && profiles.length > 0;

      return {
        test: 'Auth-Profile Sync',
        status: hasProfile ? 'pass' : 'fail',
        message: hasProfile 
          ? 'Current user has corresponding profile' 
          : 'Current user missing profile',
        details: {
          userId: user.id,
          hasProfile,
          profileCount: profiles?.length || 0
        }
      };
    } catch (error) {
      return {
        test: 'Auth-Profile Sync',
        status: 'fail',
        message: `Sync test error: ${error}`,
        details: error
      };
    }
  }

  private static async testTriggerFunctionality(): Promise<DatabaseTestResult> {
    try {
      // We can't directly test triggers without service role, but we can check if the function exists
      // by trying to call it (this will fail but give us info about whether it exists)
      
      return {
        test: 'Trigger Functionality',
        status: 'warning',
        message: 'Cannot test triggers without service role access',
        details: { note: 'Triggers can only be tested with admin access' }
      };
    } catch (error) {
      return {
        test: 'Trigger Functionality',
        status: 'warning',
        message: 'Trigger test requires admin access',
        details: error
      };
    }
  }

  private static async testPermissions(): Promise<DatabaseTestResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          test: 'Permissions Test',
          status: 'warning',
          message: 'No authenticated user to test permissions',
          details: { authError }
        };
      }

      // Test basic CRUD operations
      const tests = {
        canReadRoles: false,
        canReadOwnProfile: false,
        canUpdateOwnProfile: false,
        canCreateAppointment: false
      };

      // Test reading roles
      try {
        const { error } = await supabase.from('roles').select('name').limit(1);
        tests.canReadRoles = !error;
      } catch (e) {
        tests.canReadRoles = false;
      }

      // Test reading own profile
      try {
        const { error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .limit(1);
        tests.canReadOwnProfile = !error;
      } catch (e) {
        tests.canReadOwnProfile = false;
      }

      // Test updating own profile
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);
        tests.canUpdateOwnProfile = !error;
      } catch (e) {
        tests.canUpdateOwnProfile = false;
      }

      // Test creating appointment
      try {
        const { error } = await supabase
          .from('appointments')
          .insert({
            user_id: user.id,
            title: 'Test Appointment',
            date: new Date().toISOString(),
            time: '10:00',
            type: 'test'
          });
        
        tests.canCreateAppointment = !error;
        
        // Clean up test appointment if created
        if (!error) {
          await supabase
            .from('appointments')
            .delete()
            .eq('title', 'Test Appointment')
            .eq('user_id', user.id);
        }
      } catch (e) {
        tests.canCreateAppointment = false;
      }

      const passedTests = Object.values(tests).filter(Boolean).length;
      const totalTests = Object.keys(tests).length;

      return {
        test: 'Permissions Test',
        status: passedTests === totalTests ? 'pass' : passedTests > 0 ? 'warning' : 'fail',
        message: `${passedTests}/${totalTests} permission tests passed`,
        details: tests
      };
    } catch (error) {
      return {
        test: 'Permissions Test',
        status: 'fail',
        message: `Permission test error: ${error}`,
        details: error
      };
    }
  }

  // Helper method to get detailed database info
  static async getDatabaseInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const info = {
        currentUser: user ? {
          id: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed_at,
          createdAt: user.created_at,
          metadata: user.user_metadata
        } : null,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      };

      return info;
    } catch (error) {
      return { error: error.message };
    }
  }
}