import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyyrdhcrmeplpxvbjdyb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_WF0sXuygGq0_lz4kBUO7dQ_c_aTU6Jy';

export function createClient() {
    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
