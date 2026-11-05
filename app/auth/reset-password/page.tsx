import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResetPasswordForm } from "./reset-password-form"

const ResetPasswordPage = async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data) {
    redirect("/auth/forgot-password")
  }

  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>Choose a new password</h1>

      <ResetPasswordForm />
    </section>
  )
}

export default ResetPasswordPage
