import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './client';

// Server-side Supabase client for use in Server Components and API routes
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
