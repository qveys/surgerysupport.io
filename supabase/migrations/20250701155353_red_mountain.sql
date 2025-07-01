/*
  # Fix Roles Table RLS Policy for Anonymous Access

  1. Problem
    - Current RLS policy only allows authenticated users to read roles
    - Anonymous users need access during signup/login process
    - API requests are failing with 401 errors

  2. Solution
    - Drop existing policy that restricts to authenticated users
    - Create new policy that allows both authenticated and anonymous users
    - Keep admin-only restrictions for modifications
*/

-- Drop existing policy that restricts to authenticated users
DROP POLICY IF EXISTS "roles_read_policy" ON public.roles;

-- Create new policy that allows both authenticated and anonymous users
CREATE POLICY "roles_read_policy" ON public.roles
  FOR SELECT
  USING (true);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';