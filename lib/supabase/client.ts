import { createBrowserClient } from "@supabase/ssr"
import { publicEnv } from "@/lib/env.public"
import { supabaseCookieOptions } from "@/lib/supabase/cookie"
import type { Database } from "@/lib/supabase/database.types"

export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { cookieOptions: supabaseCookieOptions }
  )
}
