import Link from "next/link"
import { redirect } from "next/navigation"
import { signOutAction, signOutOtherDevicesAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

const AccountPage = async () => {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth) {
    redirect("/auth/sign-in")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", auth.claims.sub)
    .maybeSingle()
  const displayName =
    profile?.display_name ||
    String(auth.claims.user_metadata?.display_name ?? "")

  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>Your account</h1>

      <dl className="space-y-2">
        <div>
          <dt className="text-sm text-muted-foreground">Display name</dt>
          <dd>{displayName || "Not set"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Email address</dt>
          <dd>{auth.claims.email}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
        <form action={signOutOtherDevicesAction}>
          <Button type="submit" variant="outline" className="w-full">
            Sign out other devices
          </Button>
        </form>
        <Link href="/account/privacy">Privacy settings</Link>
      </div>
    </section>
  )
}

export default AccountPage
