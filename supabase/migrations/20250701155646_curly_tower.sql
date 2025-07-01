/*
  # Fix Roles Table RLS Policy for Anonymous Access

  1. Problem
    - Current RLS policy only allows authenticated users to read roles
    - Anonymous users need to read roles during signup/login process
    - The authorization header is using the API key instead of access token

  2. Solution
    - Create a new policy that allows anonymous access to roles table
    - Remove the "TO authenticated" clause to allow both authenticated and anonymous users
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "roles_read_policy" ON public.roles;

-- Create policy for reading roles (allow both authenticated and anonymous users)
CREATE POLICY "roles_read_policy" ON public.roles
  FOR SELECT
  USING (true);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';