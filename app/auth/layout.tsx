import Image from "next/image"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex h-screen w-full">
      <aside className="h-full w-1/2">
        <Image
          src="/images/auth-background.jpg"
          alt="Auth Background"
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </aside>
      {children}
    </main>
  )
}

export default AuthLayout
