import { NextResponse, type NextRequest } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/versions"
import type { Database } from "@/lib/supabase/database.types"
import { updateSession } from "@/lib/supabase/proxy"

const PROTECTED_PREFIXES = ["/account", "/app"]
const SIGN_IN_PATH = "/auth/sign-in"
const COMPLETE_PROFILE_PATH = "/auth/complete-profile"
const ACCOUNT_PATH = "/account"

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function redirectWithCookies(
  request: NextRequest,
  pathname: string,
  response: NextResponse
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""

  const redirect = NextResponse.redirect(url)
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie)
  }
  return redirect
}

async function needsOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded_at")
    .eq("id", userId)
    .maybeSingle()
  if (!profile?.onboarded_at) {
    return true
  }

  const { data: acceptances } = await supabase
    .from("legal_acceptances")
    .select("document_slug, document_version")
    .eq("profile_id", userId)

  const accepted = new Set(
    acceptances?.map((row) => `${row.document_slug}@${row.document_version}`)
  )
  return (
    !accepted.has(`terms@${TERMS_VERSION}`) ||
    !accepted.has(`privacy@${PRIVACY_VERSION}`)
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, supabase, claims } = await updateSession(request)

  const gated = isProtected(pathname) || pathname === COMPLETE_PROFILE_PATH
  if (!gated) {
    return response
  }

  if (!claims) {
    return redirectWithCookies(request, SIGN_IN_PATH, response)
  }

  const onboardingRequired = await needsOnboarding(supabase, claims.sub)

  if (pathname === COMPLETE_PROFILE_PATH) {
    return onboardingRequired
      ? response
      : redirectWithCookies(request, ACCOUNT_PATH, response)
  }

  return onboardingRequired
    ? redirectWithCookies(request, COMPLETE_PROFILE_PATH, response)
    : response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
}
