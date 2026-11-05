import Image from "next/image"
import authBg from "@avenro/assets/images/auth-background.jpg"
import { Header } from "@/components/shared/header"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="flex items-center justify-between">
        <Image
          className="h-dvh w-full max-w-1/2 flex-1"
          src={authBg}
          alt="Auth Background"
        />

        {children}
      </div>
    </main>
  )
}

export default AuthLayout
