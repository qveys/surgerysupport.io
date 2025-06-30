/*
  # Data Retention and Cleanup Functions

  1. Soft Delete Functions
    - Functions to handle soft deletes
    - Restore functions for accidental deletions

  2. Hard Delete Functions
    - PHI data cleanup (7 years)
    - Message cleanup (2 years)
    - Audit log cleanup (5 years)

  3. Scheduled Cleanup
    - Automated cleanup procedures
*/

-- Function to soft delete records
CREATE OR REPLACE FUNCTION soft_delete_record(
  table_name TEXT,
  record_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name NOT IN (
    'appointments', 'checklist_items', 'documents', 
    'medications', 'conversations', 'messages', 'user_profiles'
  ) THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;

  -- Build and execute the soft delete query
  sql_query := format(
    'UPDATE public.%I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    table_name
  );
  
  EXECUTE sql_query USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore soft deleted records
CREATE OR REPLACE FUNCTION restore_record(
  table_name TEXT,
  record_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
BEGIN
  -- Validate table name
  IF table_name NOT IN (
    'appointments', 'checklist_items', 'documents', 
    'medications', 'conversations', 'messages', 'user_profiles'
  ) THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;

  -- Build and execute the restore query
  sql_query := format(
    'UPDATE public.%I SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    table_name
  );
  
  EXECUTE sql_query USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete PHI data older than 7 years
CREATE OR REPLACE FUNCTION cleanup_phi_data() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete old user profiles (PHI)
  DELETE FROM public.user_profiles 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '7 years';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete old appointments
  DELETE FROM public.appointments 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '7 years';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete old medications
  DELETE FROM public.medications 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '7 years';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete old documents
  DELETE FROM public.documents 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '7 years';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete old checklist items
  DELETE FROM public.checklist_items 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '7 years';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete messages older than 2 years
CREATE OR REPLACE FUNCTION cleanup_messages() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete old messages
  DELETE FROM public.messages 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete old conversations with no messages
  DELETE FROM public.conversations 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '2 years'
  AND NOT EXISTS (
    SELECT 1 FROM public.messages 
    WHERE conversation_id = conversations.id
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete audit logs older than 5 years
CREATE OR REPLACE FUNCTION cleanup_audit_logs() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '5 years';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run all cleanup procedures
CREATE OR REPLACE FUNCTION run_data_cleanup() RETURNS JSONB AS $$
DECLARE
  phi_deleted INTEGER;
  messages_deleted INTEGER;
  audit_deleted INTEGER;
  result JSONB;
BEGIN
  -- Run all cleanup functions
  SELECT cleanup_phi_data() INTO phi_deleted;
  SELECT cleanup_messages() INTO messages_deleted;
  SELECT cleanup_audit_logs() INTO audit_deleted;

  -- Build result object
  result := jsonb_build_object(
    'phi_records_deleted', phi_deleted,
    'messages_deleted', messages_deleted,
    'audit_logs_deleted', audit_deleted,
    'cleanup_date', NOW()
  );

  -- Log the cleanup operation
  INSERT INTO public.audit_logs (
    action, 
    table_name, 
    new_values
  ) VALUES (
    'DATA_CLEANUP',
    'system',
    result
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for active (non-deleted) records
CREATE OR REPLACE VIEW public.active_appointments AS
SELECT * FROM public.appointments WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_checklist_items AS
SELECT * FROM public.checklist_items WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_documents AS
SELECT * FROM public.documents WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_medications AS
SELECT * FROM public.medications WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_conversations AS
SELECT * FROM public.conversations WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_messages AS
SELECT * FROM public.messages WHERE deleted_at IS NULL;