import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://kxgwxiukbcqzhhcvbdya.supabase.co'
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OWfvMG_FvWJdbpb_lNSkOQ_l7KXIHMt'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const envPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

export const SUPABASE_URL = envUrl || DEFAULT_SUPABASE_URL
const key = envPublishableKey || envAnonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(SUPABASE_URL, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
