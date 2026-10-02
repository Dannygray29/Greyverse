import { createClient } from '@supabase/supabase-js'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const envPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const key = envPublishableKey || envAnonKey

export const SUPABASE_URL = envUrl || ''

// Keep the static site buildable when deployment secrets are not configured.
// Authenticated/data features already guard against a missing client; production
// use still requires the public Supabase URL and publishable/anon key.
export const supabase = envUrl && key
  ? createClient(envUrl, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null
