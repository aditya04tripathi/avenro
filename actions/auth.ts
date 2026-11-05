"use server"

import { SignUpActionState } from "./types"

export async function signUpAction(
  _prevState: SignUpActionState,
  formData: FormData
): Promise<SignUpActionState> {
  const name = (formData.get("name") as string) ?? ""
  const email = (formData.get("email-address") as string) ?? ""
  const password = (formData.get("password") as string) ?? ""
  const confirmPassword = (formData.get("confirm-password") as string) ?? ""

  const fieldErrors: SignUpActionState["fieldErrors"] = {}

  if (name.length > 20 || name.length <= 5) {
    fieldErrors.name =
      "The display name should be atleast 5 characters long and not more than 20 characters long"
  }
  if (!email || !email.includes("@")) {
    fieldErrors.email = "Please provide a valid email address."
  } else if (email.length > 254) {
    fieldErrors.email = "Email cannot exceed 254 characters."
  }
  if (!password || password.length < 12) {
    fieldErrors.password = "Password must be at least 12 characters long."
  } else if (password.length > 32) {
    fieldErrors.password = "Password cannot exceed 32 characters."
  }
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "The passwords don't match."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      fieldErrors,
    }
  }

  try {
    const apiBaseUrl =
      process.env.API_BASE_URL ?? "http://127.0.0.1:3001/api/v1"
    const response = await fetch(`${apiBaseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: name,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return {
        success: false,
        message: errorData?.message ?? "Registration failed. Please try again.",
      }
    }

    return {
      success: true,
      message: "Sign up succeeded! Check your email or proceed to log in.",
    }
  } catch {
    return {
      success: false,
      message: "Unable to reach the server. Please check your connection.",
    }
  }
}
