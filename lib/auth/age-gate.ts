import { cookies } from "next/headers"
import "server-only"

export const AGE_GATE_COOKIE = "age_gate"

export const AGE_REFUSAL_MESSAGE =
  "We can't create an account with these details."

const ONE_DAY_IN_SECONDS = 60 * 60 * 24

export async function isAgeGateBlocked() {
  const cookieStore = await cookies()
  return cookieStore.get(AGE_GATE_COOKIE)?.value === "blocked"
}

export async function blockAgeGate() {
  const cookieStore = await cookies()
  cookieStore.set(AGE_GATE_COOKIE, "blocked", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_DAY_IN_SECONDS,
  })
}
