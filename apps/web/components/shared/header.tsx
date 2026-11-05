import AvenroLogo from "@/components/avenro-logo"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const Header = () => {
  return (
    <header>
      <nav
        className={cn(
          "fixed z-20 w-full transition-all duration-300",
          "border-b border-black/5 bg-background/75 backdrop-blur-lg"
        )}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative flex items-center justify-center gap-6 py-3 lg:gap-0">
            <div className="flex w-full justify-between gap-6 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <AvenroLogo type="logo" height={64} width={100} />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
