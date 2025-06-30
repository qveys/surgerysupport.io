
-- User profiles table policies

CREATE POLICY "Allow authenticated users to create their own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
