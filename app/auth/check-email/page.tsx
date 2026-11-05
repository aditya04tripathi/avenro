import Link from "next/link"

const CheckEmailPage = () => {
  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>Check your email</h1>
      <p className="text-muted-foreground">
        If you can sign up with this email, we sent a link to confirm it. Open
        the link to finish.
      </p>
      <Link href="/auth/sign-in">Back to sign in</Link>
    </section>
  )
}

export default CheckEmailPage
