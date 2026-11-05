import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const SignInPage = () => {
  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>Welcome back!</h1>

      <form action="" className="space-y-6">
        <Field>
          <FieldLabel htmlFor="email-address">Email Address</FieldLabel>
          <Input
            id="email-address"
            name="email-address"
            placeholder="john@doe.com"
          />
          <FieldError />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
          />
          <FieldError />
        </Field>

        <div className="flex flex-col items-center gap-1">
          <Button className="w-full">Sign In</Button>
          <Button nativeButton={false} className="w-full" variant="link">
            <Link href="/auth/sign-up">
              Don&apos;t have an account? Sign Up
            </Link>
          </Button>
        </div>
      </form>
    </section>
  )
}

export default SignInPage
