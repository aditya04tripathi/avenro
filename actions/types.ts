export interface AuthActionState {
  status?: "error" | "success"
  message?: string
  // Keyed by the form field name, for example "email-address".
  fieldErrors?: Record<string, string>
}

export const initialAuthActionState: AuthActionState = {}
