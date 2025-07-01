/*
  # Fix RLS Policy for Roles Table to Allow Anonymous Access

  1. Problem
    - Current RLS policies only allow authenticated users to read roles
    - Anonymous users need to read roles during signup/login process
    
  2. Solution
    - Create a new policy that allows anonymous users to read roles
    - Keep existing policies for authenticated users
    - Ensure proper security for write operations
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "roles_read_policy" ON public.roles;

-- Create policy for reading roles (allow both authenticated and anonymous users)
CREATE POLICY "roles_read_policy" ON public.roles
  FOR SELECT
  USING (true);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';