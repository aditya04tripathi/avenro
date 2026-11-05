"use client"

import { useActionState } from "react"
import { signInAction } from "@/actions/auth"
import { initialAuthActionState } from "@/actions/types"
import { FormMessage } from "@/components/auth/form-message"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialAuthActionState
  )
  const emailError = state.fieldErrors?.["email-address"]
  const passwordError = state.fieldErrors?.password

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Field>
        <FieldLabel htmlFor="email-address">Email Address</FieldLabel>
        <Input
          id="email-address"
          name="email-address"
          type="email"
          autoComplete="email"
          placeholder="john@doe.com"
          disabled={isPending}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "email-address-error" : undefined}
        />
        <FieldError id="email-address-error">{emailError}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isPending}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
        <FieldError id="password-error">{passwordError}</FieldError>
      </Field>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
