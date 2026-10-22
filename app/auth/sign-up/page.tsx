import { Button, buttonVariants } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const SignUpPage = () => {
  return (
    <section className="flex flex-col gap-8 justify-center items-center p-5 w-1/2 h-screen">
      <h1>Welcome back</h1>
      <form className="flex flex-col gap-5 w-full max-w-sm">
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" />
        </Field>
        <Field>
          <Label htmlFor="email-address">Email Address</Label>
          <Input
            id="email-address"
            name="email-address"
            type="email"
            placeholder="john@doe.com"
          />
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={"password"}
              placeholder="********"
            />
          </div>
        </Field>
        <Field>
          <Label htmlFor="password-confirm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="password-confirm"
              name="password-confirm"
              type={"password"}
              placeholder="********"
            />
          </div>
        </Field>

        <Field>
          <Button type="submit">Sign Up</Button>
          <Link
            href="/auth/sign-in"
            className={buttonVariants({ variant: "outline" })}
          >
            Sign In
          </Link>
        </Field>
        <p className="text-xs text-center">
          By signing up, you agree to our{" "}
          <a href="/terms-and-conditions">Terms and Conditions</a>
        </p>
      </form>
    </section>
  )
}

export default SignUpPage
