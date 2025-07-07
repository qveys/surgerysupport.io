/*
  # Fix Roles Table RLS Policy Issue

  1. Problem
    - Current RLS policy creates a circular dependency
    - Only users with 'Clinic Administrator' role can insert roles
    - But if roles table is empty, no one can be assigned that role
    - This prevents initial setup of the roles table

  2. Solution
    - Drop existing conflicting policies
    - Create a new policy that allows authenticated users to read roles
    - Create a policy that allows authenticated users to insert roles when the table is empty
    - Maintain admin-only policy for other operations
    - Ensure required roles exist
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "roles_read_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_bootstrap_policy" ON public.roles;

-- Create policy for reading roles (all authenticated users)
CREATE POLICY "roles_read_policy" ON public.roles
  FOR SELECT TO authenticated
  USING (true);

-- Create policy for inserting roles when table is empty (bootstrap scenario)
CREATE POLICY "roles_bootstrap_policy" ON public.roles
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Allow insert if roles table is empty (bootstrap scenario)
    (SELECT COUNT(*) FROM public.roles) = 0
  );

-- Create policy for admin management of roles
CREATE POLICY "roles_admin_policy" ON public.roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

-- Ensure all required roles exist
INSERT INTO public.roles (name, permissions) VALUES
('Sales', '["read:all", "write:sales_data", "manage:leads"]'),
('Patient', '["read:own_data", "write:own_profile", "read:own_appointments", "write:own_messages"]'),
('Recovery Coordinator', '["read:patient_data", "write:patient_data", "manage:appointments", "manage:messages", "manage:care_plans"]'),
('Nurse', '["read:patient_data", "write:patient_data", "manage:medications", "manage:documents", "manage:care_notes"]'),
('Clinic Administrator', '["read:all", "write:all", "manage:users", "manage:roles", "manage:system"]')
ON CONFLICT (name) DO NOTHING;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';