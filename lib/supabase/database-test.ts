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

    // Test 3: Check if roles exist (with detailed RLS diagnostics)
    results.push(await this.testRolesExistDetailed());

    // Test 4: Test RLS policies in detail
    results.push(await this.testRLSPoliciesDetailed());

    // Test 5: Test user profile creation
    results.push(await this.testUserProfileCreation());

    // Test 6: Test auth user vs profile sync
    results.push(await this.testAuthUserProfileSync());

    // Test 7: Test current user permissions
    results.push(await this.testCurrentUserPermissions());

    // Test 8: Test service role access (if available)
    results.push(await this.testServiceRoleAccess());

    console.log('🧪 Database tests completed');
    return results;
  }

  private static async testConnection(): Promise<DatabaseTestResult> {
    try {
      // Test basic connection with a simple query
      const { data, error } = await supabase.rpc('version');

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

    const tableResults: any = {};

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        tableResults[table] = {
          exists: !error || !error.message.includes('does not exist'),
          accessible: !error,
          error: error?.message,
          errorCode: error?.code,
          rowCount: data?.length || 0
        };
      } catch (err: any) {
        tableResults[table] = {
          exists: false,
          accessible: false,
          error: err.message,
          errorCode: err.code
        };
      }
    }

    const existingTables = Object.keys(tableResults).filter(table => tableResults[table].exists);
    const accessibleTables = Object.keys(tableResults).filter(table => tableResults[table].accessible);
    const missingTables = Object.keys(tableResults).filter(table => !tableResults[table].exists);

    if (missingTables.length > 0) {
      return {
        test: 'Required Tables',
        status: 'fail',
        message: `Missing tables: ${missingTables.join(', ')}`,
        details: { tableResults, existing: existingTables, accessible: accessibleTables, missing: missingTables }
      };
    }

    if (accessibleTables.length < existingTables.length) {
      return {
        test: 'Required Tables',
        status: 'warning',
        message: `All tables exist but some are not accessible due to RLS policies`,
        details: { tableResults, existing: existingTables, accessible: accessibleTables }
      };
    }

    return {
      test: 'Required Tables',
      status: 'pass',
      message: `All ${requiredTables.length} required tables exist and are accessible`,
      details: { tableResults, existing: existingTables, accessible: accessibleTables }
    };
  }

  private static async testRolesExistDetailed(): Promise<DatabaseTestResult> {
    try {
      console.log('🔍 Testing roles table access...');

      // Test 1: Try to access roles table
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('name, permissions, id, created_at');

      console.log('Roles query result:', { roles, rolesError });

      if (rolesError) {
        // Analyze the specific error
        let errorAnalysis = '';
        if (rolesError.code === '42501') {
          errorAnalysis = 'RLS policy denies access - user lacks permission to read roles';
        } else if (rolesError.code === '42P01') {
          errorAnalysis = 'Table does not exist';
        } else if (rolesError.message.includes('RLS')) {
          errorAnalysis = 'Row Level Security policy blocking access';
        } else if (rolesError.message.includes('policy')) {
          errorAnalysis = 'Security policy violation';
        } else {
          errorAnalysis = 'Unknown database error';
        }

        return {
          test: 'Roles Configuration',
          status: 'fail',
          message: `Cannot access roles table: ${rolesError.message}`,
          details: { 
            error: rolesError,
            errorAnalysis,
            errorCode: rolesError.code,
            hint: 'Check RLS policies on roles table'
          }
        };
      }

      // Test 2: Check if we got any roles
      if (!roles || roles.length === 0) {
        return {
          test: 'Roles Configuration',
          status: 'fail',
          message: 'Roles table is empty - no roles found',
          details: { 
            rolesCount: 0,
            hint: 'Run database migrations to populate roles'
          }
        };
      }

      // Test 3: Check for required roles
      const requiredRoles = ['Patient', 'Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales'];
      const existingRoles = roles.map(r => r.name);
      const missingRoles = requiredRoles.filter(role => !existingRoles.includes(role));

      if (missingRoles.length > 0) {
        return {
          test: 'Roles Configuration',
          status: 'fail',
          message: `Missing roles: ${missingRoles.join(', ')}`,
          details: { 
            existing: existingRoles, 
            missing: missingRoles, 
            roles,
            rolesCount: roles.length,
            hint: 'Some required roles are missing from the database'
          }
        };
      }

      return {
        test: 'Roles Configuration',
        status: 'pass',
        message: `All ${requiredRoles.length} required roles exist`,
        details: { 
          roles,
          rolesCount: roles.length,
          existingRoles
        }
      };
    } catch (error: any) {
      return {
        test: 'Roles Configuration',
        status: 'fail',
        message: `Error checking roles: ${error.message}`,
        details: { 
          error,
          errorType: error.constructor.name,
          hint: 'Unexpected error accessing roles table'
        }
      };
    }
  }

  private static async testRLSPoliciesDetailed(): Promise<DatabaseTestResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const policyTests = {
        rolesRead: { status: 'unknown', error: null },
        userProfilesRead: { status: 'unknown', error: null },
        userProfilesWrite: { status: 'unknown', error: null },
        appointmentsRead: { status: 'unknown', error: null }
      };

      // Test roles read policy
      try {
        const { error } = await supabase.from('roles').select('name').limit(1);
        policyTests.rolesRead = { status: error ? 'fail' : 'pass', error };
      } catch (e: any) {
        policyTests.rolesRead = { status: 'fail', error: e };
      }

      // Test user_profiles read policy
      try {
        const { error } = await supabase.from('user_profiles').select('id').limit(1);
        policyTests.userProfilesRead = { status: error ? 'fail' : 'pass', error };
      } catch (e: any) {
        policyTests.userProfilesRead = { status: 'fail', error: e };
      }

      // Test user_profiles write policy (if user exists)
      if (user) {
        try {
          const { error } = await supabase
            .from('user_profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', user.id);
          policyTests.userProfilesWrite = { status: error ? 'fail' : 'pass', error };
        } catch (e: any) {
          policyTests.userProfilesWrite = { status: 'fail', error: e };
        }
      }

      // Test appointments read policy
      try {
        const { error } = await supabase.from('appointments').select('id').limit(1);
        policyTests.appointmentsRead = { status: error ? 'fail' : 'pass', error };
      } catch (e: any) {
        policyTests.appointmentsRead = { status: 'fail', error: e };
      }

      const failedPolicies = Object.entries(policyTests).filter(([_, test]) => test.status === 'fail');
      const passedPolicies = Object.entries(policyTests).filter(([_, test]) => test.status === 'pass');

      if (failedPolicies.length > 0) {
        return {
          test: 'RLS Policies',
          status: 'fail',
          message: `${failedPolicies.length} RLS policy tests failed`,
          details: { 
            policyTests,
            failedPolicies: failedPolicies.map(([name, test]) => ({ name, error: test.error })),
            currentUser: user ? { id: user.id, email: user.email } : null,
            hint: 'RLS policies are blocking access - check policy conditions'
          }
        };
      }

      return {
        test: 'RLS Policies',
        status: 'pass',
        message: `All ${passedPolicies.length} RLS policy tests passed`,
        details: { policyTests }
      };
    } catch (error: any) {
      return {
        test: 'RLS Policies',
        status: 'fail',
        message: `RLS test error: ${error.message}`,
        details: { error }
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
          details: { 
            profileError, 
            userId: user.id,
            errorCode: profileError.code,
            hint: 'RLS policy may be blocking profile access'
          }
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
            profileExists: false,
            hint: 'Profile creation trigger may not be working'
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
          profileRole: profile.role_id,
          profileCreatedAt: profile.created_at
        }
      };
    } catch (error: any) {
      return {
        test: 'User Profile Creation',
        status: 'fail',
        message: `Profile creation test error: ${error.message}`,
        details: { error }
      };
    }
  }

  private static async testAuthUserProfileSync(): Promise<DatabaseTestResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          test: 'Auth-Profile Sync',
          status: 'warning',
          message: 'No authenticated user to test sync',
          details: { authError }
        };
      }

      // Check current user's profile
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, created_at')
        .eq('id', user.id);

      if (profileError) {
        return {
          test: 'Auth-Profile Sync',
          status: 'fail',
          message: `Cannot check profile sync: ${profileError.message}`,
          details: { 
            profileError,
            errorCode: profileError.code,
            hint: 'RLS policy blocking profile access'
          }
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
          userEmail: user.email,
          userCreatedAt: user.created_at,
          hasProfile,
          profileCount: profiles?.length || 0,
          profileData: profiles?.[0] || null
        }
      };
    } catch (error: any) {
      return {
        test: 'Auth-Profile Sync',
        status: 'fail',
        message: `Sync test error: ${error.message}`,
        details: { error }
      };
    }
  }

  private static async testCurrentUserPermissions(): Promise<DatabaseTestResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          test: 'Current User Permissions',
          status: 'warning',
          message: 'No authenticated user to test permissions',
          details: { authError }
        };
      }

      // Get user's profile and role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('id', user.id)
        .maybeSingle();

      const permissionTests = {
        hasProfile: !!profile && !profileError,
        hasRole: !!(profile?.role),
        canReadRoles: false,
        canReadOwnProfile: false,
        canUpdateOwnProfile: false
      };

      // Test reading roles
      try {
        const { error } = await supabase.from('roles').select('name').limit(1);
        permissionTests.canReadRoles = !error;
      } catch (e) {
        permissionTests.canReadRoles = false;
      }

      // Test reading own profile
      try {
        const { error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .limit(1);
        permissionTests.canReadOwnProfile = !error;
      } catch (e) {
        permissionTests.canReadOwnProfile = false;
      }

      // Test updating own profile
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);
        permissionTests.canUpdateOwnProfile = !error;
      } catch (e) {
        permissionTests.canUpdateOwnProfile = false;
      }

      const passedTests = Object.values(permissionTests).filter(Boolean).length;
      const totalTests = Object.keys(permissionTests).length;

      return {
        test: 'Current User Permissions',
        status: passedTests === totalTests ? 'pass' : passedTests > 0 ? 'warning' : 'fail',
        message: `${passedTests}/${totalTests} permission tests passed`,
        details: {
          user: {
            id: user.id,
            email: user.email,
            emailConfirmed: user.email_confirmed_at,
            createdAt: user.created_at
          },
          profile: profile || null,
          profileError: profileError || null,
          permissionTests
        }
      };
    } catch (error: any) {
      return {
        test: 'Current User Permissions',
        status: 'fail',
        message: `Permission test error: ${error.message}`,
        details: { error }
      };
    }
  }

  private static async testServiceRoleAccess(): Promise<DatabaseTestResult> {
    try {
      // Test if we can access system tables (requires service role)
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);

      if (error) {
        return {
          test: 'Service Role Access',
          status: 'warning',
          message: 'No service role access (expected for client-side)',
          details: { 
            error,
            note: 'Service role access is only available server-side'
          }
        };
      }

      return {
        test: 'Service Role Access',
        status: 'pass',
        message: 'Service role access available',
        details: { hasServiceAccess: true }
      };
    } catch (error: any) {
      return {
        test: 'Service Role Access',
        status: 'warning',
        message: 'Service role test requires admin access',
        details: { 
          error,
          note: 'This is expected for client-side applications'
        }
      };
    }
  }

  // Helper method to get detailed database info
  static async getDatabaseInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Try to get additional info about the current session
      const { data: session } = await supabase.auth.getSession();
      
      const info = {
        currentUser: user ? {
          id: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed_at,
          createdAt: user.created_at,
          metadata: user.user_metadata,
          appMetadata: user.app_metadata
        } : null,
        session: session?.session ? {
          accessToken: session.session.access_token ? 'Present' : 'Missing',
          refreshToken: session.session.refresh_token ? 'Present' : 'Missing',
          expiresAt: session.session.expires_at,
          tokenType: session.session.token_type
        } : null,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        environment: process.env.NODE_ENV || 'development'
      };

      return info;
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Method to test specific RLS policy
  static async testSpecificRLSPolicy(tableName: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE') {
    try {
      let query;
      
      switch (operation) {
        case 'SELECT':
          query = supabase.from(tableName).select('*').limit(1);
          break;
        case 'INSERT':
          // This will likely fail but gives us info about the policy
          query = supabase.from(tableName).insert({});
          break;
        case 'UPDATE':
          query = supabase.from(tableName).update({}).eq('id', 'test');
          break;
        case 'DELETE':
          query = supabase.from(tableName).delete().eq('id', 'test');
          break;
      }

      const { data, error } = await query;
      
      return {
        table: tableName,
        operation,
        success: !error,
        error: error?.message,
        errorCode: error?.code,
        data: data
      };
    } catch (error: any) {
      return {
        table: tableName,
        operation,
        success: false,
        error: error.message,
        errorCode: error.code
      };
    }
  }
}