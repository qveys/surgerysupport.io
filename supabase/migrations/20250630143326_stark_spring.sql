/*
  # Fix Authentication Flow and User Profile Creation

  1. Ensure all required roles exist
  2. Fix user profile creation trigger
  3. Add proper RLS policies
  4. Ensure email column exists and is properly configured
*/

-- Ensure all required roles exist with proper permissions
INSERT INTO public.roles (name, permissions) VALUES
('Sales', '["read:all", "write:sales_data", "manage:leads"]'),
('Patient', '["read:own_data", "write:own_profile", "read:own_appointments", "write:own_messages"]'),
('Recovery Coordinator', '["read:patient_data", "write:patient_data", "manage:appointments", "manage:messages", "manage:care_plans"]'),
('Nurse', '["read:patient_data", "write:patient_data", "manage:medications", "manage:documents", "manage:care_notes"]'),
('Clinic Administrator', '["read:all", "write:all", "manage:users", "manage:roles", "manage:system"]')
ON CONFLICT (name) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Ensure the user_profiles table has all required columns
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
  END IF;

  -- Add phone_number column if it doesn't exist (fixing the column name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- Ensure email column is NOT NULL and unique
ALTER TABLE public.user_profiles 
  ALTER COLUMN email SET NOT NULL;

-- Create unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_profiles' 
    AND constraint_name = 'user_profiles_email_key'
  ) THEN
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Update any existing records that might have NULL email values
UPDATE public.user_profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE public.user_profiles.id = auth_users.id 
AND public.user_profiles.email IS NULL;

-- Drop and recreate the user profile creation function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  target_role_id UUID;
  target_role_name TEXT;
  user_email TEXT;
  user_name TEXT;
  user_username TEXT;
BEGIN
  -- Get user email and name
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', user_email);
  
  -- Generate username from email
  user_username := LOWER(REPLACE(REPLACE(user_email, '@', '_at_'), '.', '_'));
  
  -- Get the target role from user metadata, default to Patient
  target_role_name := COALESCE(NEW.raw_user_meta_data->>'role_name', 'Patient');
  
  -- Get the role ID
  SELECT id INTO target_role_id 
  FROM public.roles 
  WHERE name = target_role_name;
  
  -- If role not found, use Patient role
  IF target_role_id IS NULL THEN
    SELECT id INTO target_role_id 
    FROM public.roles 
    WHERE name = 'Patient';
  END IF;
  
  -- Insert new user profile with conflict handling
  INSERT INTO public.user_profiles (
    id, 
    email, 
    role_id, 
    full_name, 
    username,
    preferred_language,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_email,
    target_role_id,
    user_name,
    user_username,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role_id = COALESCE(EXCLUDED.role_id, user_profiles.role_id),
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    username = COALESCE(EXCLUDED.username, user_profiles.username),
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Staff can read patient profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Staff can update patient profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_own_read_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_own_update_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_create_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_staff_read_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON public.user_profiles;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "user_profiles_own_select" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_own_insert" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_own_update" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_staff_select" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles staff_profile
      JOIN public.roles staff_role ON staff_profile.role_id = staff_role.id
      WHERE staff_profile.id = auth.uid()
      AND staff_role.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales')
    )
  );

CREATE POLICY "user_profiles_staff_update" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles staff_profile
      JOIN public.roles staff_role ON staff_profile.role_id = staff_role.id
      WHERE staff_profile.id = auth.uid()
      AND staff_role.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles staff_profile
      JOIN public.roles staff_role ON staff_profile.role_id = staff_role.id
      WHERE staff_profile.id = auth.uid()
      AND staff_role.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
  );

CREATE POLICY "user_profiles_admin_all" ON public.user_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin_profile
      JOIN public.roles admin_role ON admin_profile.role_id = admin_role.id
      WHERE admin_profile.id = auth.uid()
      AND admin_role.name = 'Clinic Administrator'
    )
  );

-- Clean up any orphaned user profiles
DELETE FROM public.user_profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';