/*
  # Fix Appointments RLS Policies

  1. Problem
    - Current RLS policies use `FOR ALL` which causes conflicts between USING and WITH CHECK clauses
    - INSERT operations are failing due to ambiguous policy evaluation

  2. Solution
    - Replace broad `FOR ALL` policies with specific policies for each operation (SELECT, INSERT, UPDATE, DELETE)
    - Separate policies for patients and staff with clear conditions
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "appointments_own_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_staff_policy" ON public.appointments;

-- Create specific policies for patients (own appointments)
CREATE POLICY "appointments_patient_select" ON public.appointments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "appointments_patient_insert" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_patient_update" ON public.appointments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_patient_delete" ON public.appointments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create specific policies for staff (all appointments)
CREATE POLICY "appointments_staff_select" ON public.appointments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "appointments_staff_insert" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
  );

CREATE POLICY "appointments_staff_update" ON public.appointments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
  );

CREATE POLICY "appointments_staff_delete" ON public.appointments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
  );