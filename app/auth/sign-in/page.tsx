import Link from "next/link"
import { SignInForm } from "./sign-in-form"

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const { error } = await searchParams

  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>Welcome back!</h1>

      {error === "link" && (
        <p role="alert" className="text-sm text-destructive">
          That link is invalid or has expired. Sign in or request a new one.
        </p>
      )}

      <SignInForm />

      <div className="flex flex-col items-center gap-1">
        <Link href="/auth/forgot-password">Forgot your password?</Link>
        <Link href="/auth/sign-up">Don&apos;t have an account? Sign Up</Link>
      </div>
    </section>
  )
}

export default SignInPage
