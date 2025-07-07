import { supabase } from './client';

export interface DeploymentStatus {
  isConnected: boolean;
  hasRoles: boolean;
  hasUserProfiles: boolean;
  error?: string;
  details?: any;
}

export async function checkDeploymentStatus(): Promise<DeploymentStatus> {
  try {
    // Test 1: Basic connection
    const { data: connectionData, error: connectionError } = await supabase
      .from('roles')
      .select('count')
      .limit(1)
      .single();

    if (connectionError) {
      return {
        isConnected: false,
        hasRoles: false,
        hasUserProfiles: false,
        error: `Connection error: ${connectionError.message}`,
        details: connectionError
      };
    }

    // Test 2: Check if roles exist
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');

    if (rolesError) {
      return {
        isConnected: true,
        hasRoles: false,
        hasUserProfiles: false,
        error: `Roles error: ${rolesError.message}`,
        details: rolesError
      };
    }

    // Test 3: Check if user_profiles exist
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    return {
      isConnected: true,
      hasRoles: roles && roles.length > 0,
      hasUserProfiles: !profilesError && profiles && profiles.length > 0,
      details: {
        rolesCount: roles?.length || 0,
        roles: roles,
        connectionData
      }
    };
  } catch (error: any) {
    return {
      isConnected: false,
      hasRoles: false,
      hasUserProfiles: false,
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
}

export async function createRoles(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Insert the required roles
    const { data, error } = await supabase
      .from('roles')
      .insert([
        {
          name: 'Patient',
          permissions: ['read:own_data', 'write:own_profile', 'read:own_appointments', 'write:own_messages']
        },
        {
          name: 'Recovery Coordinator',
          permissions: ['read:patient_data', 'write:patient_data', 'manage:appointments', 'manage:messages', 'manage:care_plans']
        },
        {
          name: 'Nurse',
          permissions: ['read:patient_data', 'write:patient_data', 'manage:medications', 'manage:documents', 'manage:care_notes']
        },
        {
          name: 'Clinic Administrator',
          permissions: ['read:all', 'write:all', 'manage:users', 'manage:roles', 'manage:system']
        },
        {
          name: 'Sales',
          permissions: ['read:all', 'write:sales_data', 'manage:leads']
        }
      ])
      .select();

    if (error) {
      return {
        success: false,
        message: `Failed to create roles: ${error.message}`,
        details: error
      };
    }

    return {
      success: true,
      message: `Successfully created ${data.length} roles`,
      details: data
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error creating roles: ${error.message}`,
      details: error
    };
  }
}

export async function fixMissingUserProfile(userId: string, email: string): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // First, get the Patient role ID
    const { data: patientRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'Patient')
      .single();

    if (roleError || !patientRole) {
      return {
        success: false,
        message: 'Could not find the Patient role',
        details: roleError
      };
    }

    // Create the user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        role_id: patientRole.id,
        full_name: email,
        username: email.replace('@', '_at_').replace(/\./g, '_'),
        preferred_language: 'en'
      })
      .select();

    if (error) {
      return {
        success: false,
        message: `Failed to create user profile: ${error.message}`,
        details: error
      };
    }

    return {
      success: true,
      message: 'Successfully created user profile',
      details: data
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error creating user profile: ${error.message}`,
      details: error
    };
  }
}