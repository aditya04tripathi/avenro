"use client"

import { useActionState } from "react"
import Link from "next/link"
import { completeProfileAction } from "@/actions/auth"
import { initialAuthActionState } from "@/actions/types"
import { FormMessage } from "@/components/auth/form-message"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type CompleteProfileFormProps = {
  needsAgeGate: boolean
}

export function CompleteProfileForm({
  needsAgeGate,
}: CompleteProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeProfileAction,
    initialAuthActionState
  )
  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      {needsAgeGate && (
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
      )}

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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Continue"}
      </Button>
    </form>
  )
}
