import { ForgotPasswordForm } from "./forgot-password-form"

const ForgotPasswordPage = () => {
  return (
    <section className="mx-auto w-full max-w-lg flex-1 space-y-6">
      <h1>Reset your password</h1>
      <p className="text-muted-foreground">
        Enter the email you signed up with. We will send a link to choose a new
        password.
      </p>

      <ForgotPasswordForm />
    </section>
  )
}

export default ForgotPasswordPage
