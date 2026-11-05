import { NextRequest, NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { safeNextPath } from "@/lib/auth/redirect"
import { env } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"

const EMAIL_OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  if (tokenHash && type && EMAIL_OTP_TYPES.includes(type)) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      const target =
        type === "recovery"
          ? "/auth/reset-password"
          : safeNextPath(searchParams.get("next"), "/account")
      return NextResponse.redirect(new URL(target, env.SITE_URL))
    }
  }

  return NextResponse.redirect(
    new URL("/auth/sign-in?error=link", env.SITE_URL)
  )
}
