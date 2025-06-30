/*
  # Création des profils utilisateur manquants et trigger automatique

  1. Création des profils manquants
    - Pour chaque auth.user existant sans profil dans user_profiles
    - Attribution automatique du rôle Patient par défaut
    - Gestion des erreurs et conflits

  2. Trigger automatique
    - Création d'un trigger robuste pour les nouveaux utilisateurs
    - Gestion des métadonnées utilisateur (nom, rôle)
    - Gestion des erreurs sans faire échouer la création d'utilisateur

  3. Sécurité
    - Vérification de l'existence des rôles requis
    - Création des rôles manquants si nécessaire
    - Gestion des contraintes d'unicité
*/

-- Ensure all required roles exist first
INSERT INTO public.roles (name, permissions) VALUES
('Sales', '["read:all", "write:sales_data", "manage:leads"]'),
('Patient', '["read:own_data", "write:own_profile", "read:own_appointments", "write:own_messages"]'),
('Recovery Coordinator', '["read:patient_data", "write:patient_data", "manage:appointments", "manage:messages", "manage:care_plans"]'),
('Nurse', '["read:patient_data", "write:patient_data", "manage:medications", "manage:documents", "manage:care_notes"]'),
('Clinic Administrator', '["read:all", "write:all", "manage:users", "manage:roles", "manage:system"]')
ON CONFLICT (name) DO NOTHING;

-- Function to create user profiles for existing auth.users
CREATE OR REPLACE FUNCTION create_missing_user_profiles()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  patient_role_id UUID;
  created_count INTEGER := 0;
  user_email TEXT;
  user_name TEXT;
  user_username TEXT;
BEGIN
  -- Get Patient role ID
  SELECT id INTO patient_role_id FROM public.roles WHERE name = 'Patient';
  
  -- If Patient role doesn't exist, create it
  IF patient_role_id IS NULL THEN
    INSERT INTO public.roles (name, permissions)
    VALUES ('Patient', '["read:own_data", "write:own_profile", "read:own_appointments", "write:own_messages"]')
    RETURNING id INTO patient_role_id;
  END IF;

  -- Loop through all auth.users that don't have a profile
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  LOOP
    BEGIN
      -- Prepare user data
      user_email := COALESCE(user_record.email, '');
      user_name := COALESCE(user_record.raw_user_meta_data->>'full_name', user_email);
      user_username := LOWER(REPLACE(REPLACE(user_email, '@', '_at_'), '.', '_'));
      
      -- Insert user profile
      INSERT INTO public.user_profiles (
        id,
        email,
        role_id,
        full_name,
        username,
        preferred_language,
        created_at,
        updated_at
      ) VALUES (
        user_record.id,
        user_email,
        patient_role_id,
        user_name,
        user_username,
        COALESCE(user_record.raw_user_meta_data->>'preferred_language', 'en'),
        NOW(),
        NOW()
      );
      
      created_count := created_count + 1;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but continue with other users
        RAISE WARNING 'Failed to create profile for user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN created_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create missing user profiles for existing auth.users
SELECT create_missing_user_profiles() as profiles_created;

-- Drop the temporary function
DROP FUNCTION create_missing_user_profiles();

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the robust user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  target_role_id UUID;
  target_role_name TEXT;
  user_email TEXT;
  user_name TEXT;
  user_username TEXT;
BEGIN
  -- Validate input data
  IF NEW.id IS NULL THEN
    RAISE WARNING 'Cannot create profile: user ID is null';
    RETURN NEW;
  END IF;

  -- Prepare user data with safe defaults
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', user_email);
  
  -- Generate safe username from email
  user_username := LOWER(REPLACE(REPLACE(COALESCE(user_email, 'user_' || NEW.id::text), '@', '_at_'), '.', '_'));
  
  -- Get target role from metadata, default to Patient
  target_role_name := COALESCE(NEW.raw_user_meta_data->>'role_name', 'Patient');
  
  -- Get role ID, with fallback to Patient
  SELECT id INTO target_role_id FROM public.roles WHERE name = target_role_name;
  
  IF target_role_id IS NULL THEN
    SELECT id INTO target_role_id FROM public.roles WHERE name = 'Patient';
  END IF;
  
  -- If still no role found, create Patient role
  IF target_role_id IS NULL THEN
    INSERT INTO public.roles (name, permissions)
    VALUES ('Patient', '["read:own_data", "write:own_profile", "read:own_appointments", "write:own_messages"]')
    RETURNING id INTO target_role_id;
  END IF;
  
  -- Insert user profile with comprehensive error handling
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      email,
      role_id,
      full_name,
      username,
      preferred_language,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_email,
      target_role_id,
      user_name,
      user_username,
      COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Successfully created user profile for user %', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle duplicate key errors
      RAISE WARNING 'User profile already exists for user %', NEW.id;
      
      -- Try to update existing profile with new data
      BEGIN
        UPDATE public.user_profiles SET
          email = user_email,
          role_id = COALESCE(target_role_id, role_id),
          full_name = COALESCE(user_name, full_name),
          username = COALESCE(user_username, username),
          updated_at = NOW()
        WHERE id = NEW.id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Failed to update existing profile for user %: %', NEW.id, SQLERRM;
      END;
      
    WHEN OTHERS THEN
      -- Log any other errors but don't fail the user creation
      RAISE WARNING 'Error creating user profile for %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
  ) THEN
    RAISE NOTICE 'Trigger on_auth_user_created created successfully';
  ELSE
    RAISE WARNING 'Failed to create trigger on_auth_user_created';
  END IF;
END $$;

-- Create a function to manually sync any missing profiles (for maintenance)
CREATE OR REPLACE FUNCTION public.sync_missing_user_profiles()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  action TEXT,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  user_record RECORD;
  patient_role_id UUID;
  result_record RECORD;
BEGIN
  -- Get Patient role ID
  SELECT id INTO patient_role_id FROM public.roles WHERE name = 'Patient';
  
  -- Return results for each user processed
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  LOOP
    BEGIN
      -- Try to create the profile
      INSERT INTO public.user_profiles (
        id,
        email,
        role_id,
        full_name,
        username,
        preferred_language,
        created_at,
        updated_at
      ) VALUES (
        user_record.id,
        COALESCE(user_record.email, ''),
        patient_role_id,
        COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.email),
        LOWER(REPLACE(REPLACE(COALESCE(user_record.email, 'user_' || user_record.id::text), '@', '_at_'), '.', '_')),
        COALESCE(user_record.raw_user_meta_data->>'preferred_language', 'en'),
        NOW(),
        NOW()
      );
      
      -- Return success result
      user_id := user_record.id;
      email := user_record.email;
      action := 'CREATED';
      success := TRUE;
      error_message := NULL;
      RETURN NEXT;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Return error result
        user_id := user_record.id;
        email := user_record.email;
        action := 'FAILED';
        success := FALSE;
        error_message := SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Final verification and summary
DO $$
DECLARE
  total_auth_users INTEGER;
  total_profiles INTEGER;
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_auth_users FROM auth.users;
  SELECT COUNT(*) INTO total_profiles FROM public.user_profiles;
  missing_profiles := total_auth_users - total_profiles;
  
  RAISE NOTICE '=== USER PROFILE SYNC SUMMARY ===';
  RAISE NOTICE 'Total auth.users: %', total_auth_users;
  RAISE NOTICE 'Total user_profiles: %', total_profiles;
  RAISE NOTICE 'Missing profiles: %', missing_profiles;
  
  IF missing_profiles = 0 THEN
    RAISE NOTICE 'SUCCESS: All auth.users have corresponding user_profiles';
  ELSE
    RAISE WARNING 'WARNING: % auth.users still missing user_profiles', missing_profiles;
    RAISE NOTICE 'Run: SELECT * FROM public.sync_missing_user_profiles(); to manually sync remaining profiles';
  END IF;
  
  RAISE NOTICE '=== TRIGGER STATUS ===';
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
  ) THEN
    RAISE NOTICE 'SUCCESS: Trigger on_auth_user_created is active';
  ELSE
    RAISE WARNING 'ERROR: Trigger on_auth_user_created is not active';
  END IF;
END $$;