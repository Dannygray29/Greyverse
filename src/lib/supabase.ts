import { createClient } from '@supabase/supabase-js';

// Safe for the browser: this is the project's publishable/anon key, never a service-role key.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://kxgwxiukbcqzhhcvbdya.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_OWfvMG_FvWJdbpb_lNSkOQ_l7KXIHMt';

export const supabase = createClient(url, key);
