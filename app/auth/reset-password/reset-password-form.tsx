"use client"

import { useActionState } from "react"
import { updatePasswordAction } from "@/actions/auth"
import { initialAuthActionState } from "@/actions/types"
import { FormMessage } from "@/components/auth/form-message"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialAuthActionState
  )
  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Field>
        <FieldLabel htmlFor="password">New password</FieldLabel>
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
        <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save new password"}
      </Button>
    </form>
  )
}
