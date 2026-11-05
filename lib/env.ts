import "server-only"
import { z } from "zod"

const serverEnvSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  UNSUBSCRIBE_TOKEN_SECRET: z.string().min(32),
  SITE_URL: z.url(),
})

export const env = serverEnvSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  UNSUBSCRIBE_TOKEN_SECRET: process.env.UNSUBSCRIBE_TOKEN_SECRET,
  SITE_URL: process.env.SITE_URL,
})
