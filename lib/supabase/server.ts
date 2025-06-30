import { createServerClient } from '@supabase/ssr'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

// Server-side Supabase client for use in Server Components and API routes
export const createSupabaseServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};

// Service role client for admin operations (use with caution)
export const createSupabaseServiceClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};