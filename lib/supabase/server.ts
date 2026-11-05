import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import "server-only"
import { env } from "@/lib/env"
import { publicEnv } from "@/lib/env.public"
import { supabaseCookieOptions } from "@/lib/supabase/cookie"
import type { Database } from "@/lib/supabase/database.types"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Server Components cannot write cookies. proxy.ts refreshes the session.
          }
        },
      },
    }
  )
}
