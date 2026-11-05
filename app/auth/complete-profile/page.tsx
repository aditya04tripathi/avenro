import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompleteProfileForm } from "./complete-profile-form"

const CompleteProfilePage = async () => {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth) {
    redirect("/auth/sign-in")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("age_confirmed_at")
    .eq("id", auth.claims.sub)
    .maybeSingle()
  const needsAgeGate = !profile?.age_confirmed_at

  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>One more step</h1>
      <p className="text-muted-foreground">
        {needsAgeGate
          ? "Confirm your age and accept the current terms to use Avenro."
          : "Our Terms or Privacy Policy changed. Accept the current versions to keep using Avenro."}
      </p>

      <CompleteProfileForm needsAgeGate={needsAgeGate} />
    </section>
  )
}

export default CompleteProfilePage
