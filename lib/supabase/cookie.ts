// Server and browser clients run on different hostnames in Docker. The default
// cookie name is derived from the hostname, so the name is fixed here.
export const SUPABASE_AUTH_COOKIE_NAME = "sb-avenro-auth-token"

export const supabaseCookieOptions = { name: SUPABASE_AUTH_COOKIE_NAME }
