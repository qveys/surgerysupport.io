/*
  # Fix Database Schema and RLS Policy Issues

  1. Schema Updates
    - Add missing `updated_at` column to `roles` table
    - Add missing `storage_path` column to `documents` table
    - Create trigger for `roles` table updated_at

  2. Security Policies
    - Add missing RLS policies for `documents` table
    - Add missing RLS policies for other tables (appointments, checklist_items, medications, conversations, messages)

  3. Fixes
    - Resolve "column roles_1.updated_at does not exist" error
    - Resolve "new row violates row-level security policy for table documents" error
*/

-- Add missing updated_at column to roles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.roles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add missing storage_path column to documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN storage_path TEXT;
  END IF;
END $$;

-- Create trigger for roles table updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "documents_own_read_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_own_write_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_staff_read_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_admin_policy" ON public.documents;

DROP POLICY IF EXISTS "appointments_own_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_staff_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_admin_policy" ON public.appointments;

DROP POLICY IF EXISTS "checklist_items_own_policy" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_staff_policy" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_admin_policy" ON public.checklist_items;

DROP POLICY IF EXISTS "medications_own_policy" ON public.medications;
DROP POLICY IF EXISTS "medications_staff_policy" ON public.medications;
DROP POLICY IF EXISTS "medications_admin_policy" ON public.medications;

DROP POLICY IF EXISTS "conversations_own_policy" ON public.conversations;
DROP POLICY IF EXISTS "conversations_staff_policy" ON public.conversations;
DROP POLICY IF EXISTS "conversations_admin_policy" ON public.conversations;

DROP POLICY IF EXISTS "messages_own_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_staff_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_policy" ON public.messages;

DROP POLICY IF EXISTS "audit_logs_admin_policy" ON public.audit_logs;

-- Create RLS policies for documents table
CREATE POLICY "documents_own_read_policy" ON public.documents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "documents_own_write_policy" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_own_update_policy" ON public.documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_own_delete_policy" ON public.documents
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "documents_staff_read_policy" ON public.documents
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

CREATE POLICY "documents_admin_policy" ON public.documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

-- Create RLS policies for appointments table
CREATE POLICY "appointments_own_policy" ON public.appointments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_staff_policy" ON public.appointments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Create RLS policies for checklist_items table
CREATE POLICY "checklist_items_own_policy" ON public.checklist_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checklist_items_staff_policy" ON public.checklist_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Create RLS policies for medications table
CREATE POLICY "medications_own_policy" ON public.medications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "medications_staff_policy" ON public.medications
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Create RLS policies for conversations table
CREATE POLICY "conversations_own_policy" ON public.conversations
  FOR ALL TO authenticated
  USING (auth.uid() = patient_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "conversations_staff_policy" ON public.conversations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Create RLS policies for messages table
CREATE POLICY "messages_own_policy" ON public.messages
  FOR ALL TO authenticated
  USING (
    (auth.uid() = sender_id OR 
     EXISTS (
       SELECT 1 FROM public.conversations c 
       WHERE c.id = conversation_id AND c.patient_id = auth.uid()
     ))
    AND deleted_at IS NULL
  )
  WITH CHECK (
    auth.uid() = sender_id OR 
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id AND c.patient_id = auth.uid()
    )
  );

CREATE POLICY "messages_staff_policy" ON public.messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Create RLS policy for audit_logs table
CREATE POLICY "audit_logs_admin_policy" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

-- Update all existing roles to have updated_at timestamp
UPDATE public.roles SET updated_at = created_at WHERE updated_at IS NULL;