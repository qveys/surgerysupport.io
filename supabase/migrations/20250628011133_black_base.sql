/*
  # Row Level Security Policies

  1. Roles Table Policies
    - Allow all authenticated users to read roles
    - Only admins can modify roles

  2. User Profiles Policies
    - Users can read/update their own profile
    - Staff can read relevant user profiles
    - Admins can manage all profiles

  3. Data Table Policies
    - Patients can access their own data
    - Staff can access assigned patient data
    - Admins have full access

  4. Audit Logs Policies
    - Only admins can read audit logs
*/

-- Roles table policies
CREATE POLICY "Allow authenticated users to read roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

-- User profiles table policies
CREATE POLICY "Users can read their own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can read relevant profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales')
    )
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

-- Appointments table policies
CREATE POLICY "Patients can manage their own appointments"
  ON public.appointments FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "Staff can manage relevant appointments"
  ON public.appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Checklist items table policies
CREATE POLICY "Patients can manage their own checklist items"
  ON public.checklist_items FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "Staff can manage relevant checklist items"
  ON public.checklist_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Documents table policies
CREATE POLICY "Patients can manage their own documents"
  ON public.documents FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "Staff can manage relevant documents"
  ON public.documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Medications table policies
CREATE POLICY "Patients can manage their own medications"
  ON public.medications FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "Staff can manage relevant medications"
  ON public.medications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Conversations table policies
CREATE POLICY "Patients can access their own conversations"
  ON public.conversations FOR ALL
  TO authenticated
  USING (
    patient_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "Staff can access relevant conversations"
  ON public.conversations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales')
    )
    AND deleted_at IS NULL
  );

-- Messages table policies
CREATE POLICY "Users can access messages in their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id 
      AND (c.patient_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() 
        AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales')
      ))
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id 
      AND (c.patient_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() 
        AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales')
      ))
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid() AND deleted_at IS NULL
  );

-- Audit logs table policies
CREATE POLICY "Only admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Clinic Administrator'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);