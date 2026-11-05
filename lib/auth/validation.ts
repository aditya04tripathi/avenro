import { z } from "zod"

export const MINIMUM_SIGN_UP_AGE = 16

// Treats the boundary year (age 16 this year) as under 16, because a birth year
// alone cannot show whether the birthday has passed.
export function isUnderMinimumAge(birthYear: number, today = new Date()) {
  return today.getFullYear() - birthYear <= MINIMUM_SIGN_UP_AGE
}

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name.")
  .max(50, "Name must be 50 characters or fewer.")

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(254, "Email must be 254 characters or fewer.")
  .pipe(z.email("Enter a valid email address."))

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(72, "Password must be 72 characters or fewer.")

export const birthYearSchema = z
  .string()
  .regex(/^\d{4}$/, "Enter the year you were born.")
  .transform(Number)
  .refine(
    (year) => year >= 1900 && year <= new Date().getFullYear(),
    "Enter a valid birth year."
  )
