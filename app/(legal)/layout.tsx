export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-6 py-16 leading-relaxed text-foreground">
      {children}
    </main>
  )
}
