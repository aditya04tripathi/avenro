export interface SignUpActionState {
  success: boolean
  message?: string
  fieldErrors?: {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }
}

export const initialSignUpState: SignUpActionState = {
  success: false,
}
