// Accepts only same-origin paths. Rejects protocol-relative and backslash forms.
export function safeNextPath(value: string | null, fallback: string) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback
  }

  return value
}
