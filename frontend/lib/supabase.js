import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/['"]/g, '').trim()
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://placeholder.supabase.co'
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/['"]/g, '').trim()
const supabaseAnonKey = (rawKey && rawKey !== 'your_supabase_anon_key') ? rawKey : 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
