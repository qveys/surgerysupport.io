/*
  # Fix user_profiles table email column issue

  1. Schema Updates
    - Ensure email column exists in user_profiles table
    - Add missing columns that may be referenced in the application
    - Update constraints and indexes

  2. Data Integrity
    - Preserve existing data
    - Add proper constraints
    - Ensure referential integrity

  3. Security
    - Maintain RLS policies
    - Update permissions as needed
*/

-- First, let's ensure the user_profiles table has all the required columns
-- Add missing columns if they don't exist

DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
  END IF;

  -- Add date_of_birth column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN date_of_birth DATE;
  END IF;

  -- Add address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN address TEXT;
  END IF;

  -- Add emergency_contact_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'emergency_contact_name'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN emergency_contact_name TEXT;
  END IF;

  -- Add emergency_contact_phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'emergency_contact_phone'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN emergency_contact_phone TEXT;
  END IF;

  -- Add medical_history column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'medical_history'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN medical_history TEXT;
  END IF;

  -- Add allergies column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'allergies'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN allergies TEXT;
  END IF;

  -- Add medications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'medications'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN medications TEXT;
  END IF;

  -- Add insurance_provider column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'insurance_provider'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN insurance_provider TEXT;
  END IF;

  -- Add insurance_policy_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'insurance_policy_number'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN insurance_policy_number TEXT;
  END IF;

  -- Add preferred_language column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN preferred_language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Ensure email column is NOT NULL and has proper constraints
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
-- This should sync with the auth.users table
UPDATE public.user_profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE public.user_profiles.id = auth_users.id 
AND public.user_profiles.email IS NULL;

-- Create or update the handle_new_user function to ensure it works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  patient_role_id UUID;
BEGIN
  -- Get the Patient role ID
  SELECT id INTO patient_role_id FROM public.roles WHERE name = 'Patient';
  
  -- Insert new user profile with all required fields
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
    NEW.email,
    patient_role_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    LOWER(REPLACE(NEW.email, '@', '_at_')),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policies for user_profiles if they don't exist
DO $$
BEGIN
  -- Policy for users to read their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.user_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Policy for users to update their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Policy for staff to read patient profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Staff can read patient profiles'
  ) THEN
    CREATE POLICY "Staff can read patient profiles"
      ON public.user_profiles
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles staff_profile
          JOIN public.roles staff_role ON staff_profile.role_id = staff_role.id
          WHERE staff_profile.id = auth.uid()
          AND staff_role.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
        )
      );
  END IF;

  -- Policy for staff to update patient profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Staff can update patient profiles'
  ) THEN
    CREATE POLICY "Staff can update patient profiles"
      ON public.user_profiles
      FOR UPDATE
      TO authenticated
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
  END IF;
END $$;

-- Refresh the schema cache by updating a system table (this forces PostgREST to reload)
NOTIFY pgrst, 'reload schema';