"use client"
import AvenroLogo from "@/components/avenro-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import React from "react"

const menuItems = [
  { name: "Features", href: "#link" },
  { name: "Pricing", href: "#link" },
  { name: "About", href: "#link" },
]

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className={cn(
          "fixed z-20 w-full transition-all duration-300",
          isScrolled &&
            "border-b border-black/5 bg-background/75 backdrop-blur-lg"
        )}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative flex items-center justify-between gap-6 py-3 lg:gap-0">
            <div className="flex w-full justify-between gap-6 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <AvenroLogo type="logo" height={64} width={100} />
              </Link>
            </div>

            <div className="flex w-fit flex-row gap-3">
              <Button
                nativeButton={false}
                variant="ghost"
                className={cn(isScrolled && "lg:hidden")}
                render={
                  <Link href="#">
                    <span>Login</span>
                  </Link>
                }
              />
              <Button
                nativeButton={false}
                className={cn(isScrolled && "lg:hidden")}
                render={
                  <Link href="#">
                    <span>Sign Up</span>
                  </Link>
                }
              />
              <Button
                nativeButton={false}
                size="sm"
                className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                render={
                  <Link href="#">
                    <span>Get Started</span>
                  </Link>
                }
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
