"use server"

import { redirect } from "next/navigation"
import type { z } from "zod"
import type { AuthActionState } from "@/actions/types"
import {
  AGE_REFUSAL_MESSAGE,
  blockAgeGate,
  isAgeGateBlocked,
} from "@/lib/auth/age-gate"
import {
  birthYearSchema,
  emailSchema,
  isUnderMinimumAge,
  nameSchema,
  passwordSchema,
} from "@/lib/auth/validation"
import { env } from "@/lib/env"
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/versions"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type FieldErrors = Record<string, string>

const AGE_REFUSAL: AuthActionState = {
  status: "error",
  message: AGE_REFUSAL_MESSAGE,
}
const GENERIC_ERROR: AuthActionState = {
  status: "error",
  message: "Something went wrong. Try again.",
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function parseField<T>(
  schema: z.ZodType<T>,
  value: string,
  errors: FieldErrors,
  key: string
): T | undefined {
  const result = schema.safeParse(value)
  if (result.success) {
    return result.data
  }

  errors[key] ??= result.error.issues[0]?.message ?? "Check this field."
  return undefined
}

function isRateLimited(error: { status?: number }) {
  return error.status === 429
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (await isAgeGateBlocked()) {
    return AGE_REFUSAL
  }

  const errors: FieldErrors = {}

  const birthYear = parseField(
    birthYearSchema,
    readString(formData, "birth-year"),
    errors,
    "birth-year"
  )
  if (birthYear !== undefined && isUnderMinimumAge(birthYear)) {
    await blockAgeGate()
    return AGE_REFUSAL
  }

  const name = parseField(
    nameSchema,
    readString(formData, "name"),
    errors,
    "name"
  )
  const email = parseField(
    emailSchema,
    readString(formData, "email-address"),
    errors,
    "email-address"
  )
  const password = parseField(
    passwordSchema,
    readString(formData, "password"),
    errors,
    "password"
  )
  const confirmPassword = readString(formData, "confirm-password")
  if (password !== undefined && password !== confirmPassword) {
    errors["confirm-password"] = "The passwords don't match."
  }
  if (readString(formData, "accept-legal") !== "on") {
    errors["accept-legal"] =
      "Accept the Terms of Service and Privacy Policy to continue."
  }
  const marketingOptIn = readString(formData, "marketing-opt-in") === "on"

  if (
    !name ||
    !email ||
    !password ||
    birthYear === undefined ||
    Object.keys(errors).length > 0
  ) {
    return { status: "error", fieldErrors: errors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.SITE_URL}/auth/confirm`,
      data: {
        display_name: name,
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_VERSION,
        age_confirmed: true,
        marketing_opt_in: marketingOptIn,
      },
    },
  })

  if (error) {
    return isRateLimited(error)
      ? {
          status: "error",
          message: "Too many attempts. Try again in a few minutes.",
        }
      : {
          status: "error",
          message: "We could not create your account. Try again.",
        }
  }

  // Same response for new and existing emails, so the form does not reveal accounts.
  redirect("/auth/check-email")
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const errors: FieldErrors = {}
  const email = parseField(
    emailSchema,
    readString(formData, "email-address"),
    errors,
    "email-address"
  )
  const password = readString(formData, "password")
  if (!password) {
    errors.password = "Enter your password."
  }

  if (!email || Object.keys(errors).length > 0) {
    return { status: "error", fieldErrors: errors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return {
      status: "error",
      message: "We could not sign you in with those details.",
    }
  }

  redirect("/account")
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function signOutOtherDevicesAction() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: "others" })
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const errors: FieldErrors = {}
  const email = parseField(
    emailSchema,
    readString(formData, "email-address"),
    errors,
    "email-address"
  )
  if (!email) {
    return { status: "error", fieldErrors: errors }
  }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.SITE_URL}/auth/confirm`,
  })

  return {
    status: "success",
    message: "If an account exists for that email, we sent a reset link.",
  }
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data) {
    redirect("/auth/sign-in")
  }

  const errors: FieldErrors = {}
  const password = parseField(
    passwordSchema,
    readString(formData, "password"),
    errors,
    "password"
  )
  const confirmPassword = readString(formData, "confirm-password")
  if (password !== undefined && password !== confirmPassword) {
    errors["confirm-password"] = "The passwords don't match."
  }

  if (!password || Object.keys(errors).length > 0) {
    return { status: "error", fieldErrors: errors }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return {
      status: "error",
      message: "We could not update your password. Request a new reset link.",
    }
  }

  redirect("/account")
}

export async function completeProfileAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data) {
    redirect("/auth/sign-in")
  }
  const userId = data.claims.sub

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarded_at, age_confirmed_at")
    .eq("id", userId)
    .maybeSingle()
  if (profileError) {
    return GENERIC_ERROR
  }

  const needsAgeGate = !profile?.age_confirmed_at
  const errors: FieldErrors = {}

  if (needsAgeGate) {
    const birthYear = parseField(
      birthYearSchema,
      readString(formData, "birth-year"),
      errors,
      "birth-year"
    )
    if (birthYear !== undefined && isUnderMinimumAge(birthYear)) {
      await blockAgeGate()
      const { error: deleteError } =
        await supabaseAdmin.auth.admin.deleteUser(userId)
      if (deleteError) {
        return GENERIC_ERROR
      }
      await supabase.auth.signOut()
      return AGE_REFUSAL
    }
  }

  if (readString(formData, "accept-legal") !== "on") {
    errors["accept-legal"] =
      "Accept the Terms of Service and Privacy Policy to continue."
  }
  const marketingOptIn = readString(formData, "marketing-opt-in") === "on"

  if (Object.keys(errors).length > 0) {
    return { status: "error", fieldErrors: errors }
  }

  const { error } =
    profile?.onboarded_at && !needsAgeGate
      ? await supabase.rpc("accept_current_terms")
      : await supabase.rpc("complete_onboarding", {
          p_terms_version: TERMS_VERSION,
          p_privacy_version: PRIVACY_VERSION,
          p_age_confirmed: true,
          p_marketing_opt_in: marketingOptIn,
        })
  if (error) {
    return GENERIC_ERROR
  }

  redirect("/account")
}
