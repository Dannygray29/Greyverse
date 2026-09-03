import { createClient } from '@supabase/supabase-js'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const envPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const key = envPublishableKey || envAnonKey

if (!envUrl || !key) {
  throw new Error(
    'GreyVerse requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).'
  )
}

export const SUPABASE_URL = envUrl

export const supabase = createClient(SUPABASE_URL, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
