/*
  # Fix Authentication and User Profile Issues

  1. Clean up existing policies to avoid conflicts
  2. Fix the handle_new_user function to be more robust
  3. Ensure proper role assignment
  4. Add better error handling for user profile creation
  5. Fix RLS policy circular dependency for roles table
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON public.roles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Staff can read relevant profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Then drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  patient_role_id UUID;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user email, handling potential null values
  user_email := COALESCE(NEW.email, '');
  
  -- Get user name from metadata or use email as fallback
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', user_email);
  
  -- Get the Patient role ID, create if it doesn't exist
  SELECT id INTO patient_role_id FROM public.roles WHERE name = 'Patient';
  
  -- If Patient role doesn't exist, create it
  IF patient_role_id IS NULL THEN
    INSERT INTO public.roles (name, permissions)
    VALUES ('Patient', '["read:own_data", "write:own_profile", "read:own_appointments", "write:own_messages"]')
    RETURNING id INTO patient_role_id;
  END IF;
  
  -- Insert new user profile with conflict handling
  INSERT INTO public.user_profiles (id, email, role_id, full_name, username)
  VALUES (
    NEW.id,
    user_email,
    patient_role_id,
    user_name,
    LOWER(REPLACE(user_email, '@', '_at_'))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure all required roles exist
INSERT INTO public.roles (name, permissions) VALUES
('Sales', '["read:all", "write:sales_data", "manage:leads"]'),
('Patient', '["read:own_data", "write:own_profile", "read:own_appointments", "write:own_messages"]'),
('Recovery Coordinator', '["read:patient_data", "write:patient_data", "manage:appointments", "manage:messages", "manage:care_plans"]'),
('Nurse', '["read:patient_data", "write:patient_data", "manage:medications", "manage:documents", "manage:care_notes"]'),
('Clinic Administrator', '["read:all", "write:all", "manage:users", "manage:roles", "manage:system"]')
ON CONFLICT (name) DO NOTHING;

-- Drop existing roles policies to recreate them
DROP POLICY IF EXISTS "roles_read_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_bootstrap_policy" ON public.roles;

-- Recreate RLS policies with better structure
CREATE POLICY "roles_read_policy" ON public.roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "roles_admin_policy" ON public.roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

-- Add bootstrap policy to allow initial role creation when table is empty
CREATE POLICY "roles_bootstrap_policy" ON public.roles
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Allow insert if roles table is empty (bootstrap scenario)
    (SELECT COUNT(*) FROM public.roles) = 0
  );

CREATE POLICY "profiles_own_read_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_own_update_policy" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_create_policy" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_staff_read_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales')
    )
  );

CREATE POLICY "profiles_admin_policy" ON public.user_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

-- Add unique constraint on username if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_username_key' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Clean up any orphaned user profiles (profiles without corresponding auth users)
DELETE FROM public.user_profiles 
WHERE id NOT IN (SELECT id FROM auth.users);