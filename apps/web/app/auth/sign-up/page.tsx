"use client"

import { useActionState } from "react"
import Link from "next/link"
import { signUpAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { initialSignUpState } from "@/actions/types"

const SignUpPage = () => {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialSignUpState
  )

  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>Get. Set. Create.</h1>

      {state.message && (
        <p
          className={`text-sm ${state.success ? "text-primary" : "text-destructive"}`}
          role="status"
        >
          {state.message}
        </p>
      )}

      <form action={formAction} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            disabled={isPending}
          />
          <FieldError>{state.fieldErrors?.name}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="email-address">Email Address</FieldLabel>
          <Input
            id="email-address"
            name="email-address"
            placeholder="john@doe.com"
            type="email"
            disabled={isPending}
          />
          <FieldError>{state.fieldErrors?.email}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            disabled={isPending}
          />
          <FieldError>{state.fieldErrors?.password}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            name="confirm-password"
            placeholder="••••••••"
            type="password"
            disabled={isPending}
          />
          <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
        </Field>

        <div className="flex flex-col items-center gap-1">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing up..." : "Sign Up"}
          </Button>
          <Link href="/auth/sign-in">Already have an account? Sign In</Link>
        </div>
      </form>
    </section>
  )
}

export default SignUpPage
