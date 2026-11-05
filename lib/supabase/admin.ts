import { createClient } from "@supabase/supabase-js"
import "server-only"
import { env } from "@/lib/env"
import type { Database } from "@/lib/supabase/database.types"

// Bypasses RLS. Use only for account deletion of users who must not keep data.
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
