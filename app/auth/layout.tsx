import Image from "next/image"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex w-full h-screen">
      <aside className="w-1/2 h-full">
        <Image
          src="/images/auth-background.jpg"
          alt="Auth Background"
          width={1000}
          height={1000}
          className="object-cover w-full h-full"
          loading="eager"
        />
      </aside>
      {children}
    </main>
  )
}

export default AuthLayout
