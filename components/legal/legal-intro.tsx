import { company } from "@/lib/legal/company"

export default function LegalIntro({
  title,
  children,
}: Readonly<{
  title: string
  children?: React.ReactNode
}>) {
  return (
    <header className="space-y-3">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      {children ? <p className="text-muted-foreground">{children}</p> : null}
      <p className="text-sm text-muted-foreground">
        Last updated: {company.lastUpdated}
      </p>
    </header>
  )
}
