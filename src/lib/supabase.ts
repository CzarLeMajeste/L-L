import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('PLACEHOLDER') && url.startsWith('https://'),
)

export const supabase = createClient(
  isSupabaseConfigured && url ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured && anonKey ? anonKey : 'placeholder-anon-key',
  { auth: { persistSession: false } },
)
