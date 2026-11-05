import type { AuthActionState } from "@/actions/types"

export function FormMessage({ state }: { state: AuthActionState }) {
  if (!state.message) {
    return null
  }

  const isError = state.status === "error"

  return (
    <p
      role={isError ? "alert" : "status"}
      className={`text-sm ${isError ? "text-destructive" : "text-primary"}`}
    >
      {state.message}
    </p>
  )
}
