"use client"

import { useActionState } from "react"
import Link from "next/link"
import { signUpAction } from "@/actions/auth"
import { initialAuthActionState } from "@/actions/types"
import { FormMessage } from "@/components/auth/form-message"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialAuthActionState
  )
  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="John Doe"
          disabled={isPending}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error">{errors.name}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="email-address">Email Address</FieldLabel>
        <Input
          id="email-address"
          name="email-address"
          type="email"
          autoComplete="email"
          placeholder="john@doe.com"
          disabled={isPending}
          aria-invalid={Boolean(errors["email-address"])}
          aria-describedby={
            errors["email-address"] ? "email-address-error" : undefined
          }
        />
        <FieldError id="email-address-error">
          {errors["email-address"]}
        </FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="birth-year">Birth year</FieldLabel>
        <Input
          id="birth-year"
          name="birth-year"
          type="number"
          autoComplete="bday-year"
          disabled={isPending}
          aria-invalid={Boolean(errors["birth-year"])}
          aria-describedby={
            errors["birth-year"] ? "birth-year-error" : undefined
          }
        />
        <FieldError id="birth-year-error">{errors["birth-year"]}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isPending}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        <FieldError id="password-error">{errors.password}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isPending}
          aria-invalid={Boolean(errors["confirm-password"])}
          aria-describedby={
            errors["confirm-password"] ? "confirm-password-error" : undefined
          }
        />
        <FieldError id="confirm-password-error">
          {errors["confirm-password"]}
        </FieldError>
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="accept-legal"
          name="accept-legal"
          disabled={isPending}
          aria-invalid={Boolean(errors["accept-legal"])}
          aria-describedby={
            errors["accept-legal"] ? "accept-legal-error" : undefined
          }
        />
        <FieldLabel htmlFor="accept-legal">
          I agree to the{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </FieldLabel>
      </Field>
      <FieldError id="accept-legal-error">{errors["accept-legal"]}</FieldError>

      <Field orientation="horizontal">
        <Checkbox
          id="marketing-opt-in"
          name="marketing-opt-in"
          disabled={isPending}
        />
        <FieldLabel htmlFor="marketing-opt-in">
          Email me product news. Unsubscribe anytime.
        </FieldLabel>
      </Field>

      <div className="flex flex-col items-center gap-1">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing up..." : "Sign Up"}
        </Button>
        <Link href="/auth/sign-in">Already have an account? Sign In</Link>
      </div>
    </form>
  )
}
