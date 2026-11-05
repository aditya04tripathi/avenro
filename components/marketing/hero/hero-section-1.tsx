import Image from "next/image"
import Link from "next/link"
import { ChevronRight, CirclePlay } from "lucide-react"
import { HeroHeader } from "@/components/marketing/hero/header"
import { Button } from "@/components/ui/button"
import { Spotify } from "@/components/ui/svgs/spotify"
import { SupabaseFull } from "@/components/ui/svgs/supabase"
import { VercelFull } from "@/components/ui/svgs/vercel"

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <section className="bg-linear-to-b from-background to-muted">
          <div className="relative py-36">
            <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
              <div className="md:w-1/2">
                <div>
                  <h1 className="max-w-md text-5xl font-medium text-balance md:text-6xl">
                    Simple payments for startups
                  </h1>
                  <p className="my-8 max-w-2xl text-xl text-balance text-muted-foreground">
                    One tool that does it all. Search, generate, analyze, and
                    chat—right inside Tailark.
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      nativeButton={false}
                      size="lg"
                      className="pr-4.5"
                      render={
                        <Link href="#link">
                          <span className="text-nowrap">Get Started</span>
                          <ChevronRight className="opacity-50" />
                        </Link>
                      }
                    />
                    <Button
                      key={2}
                      nativeButton={false}
                      size="lg"
                      variant="outline"
                      className="pl-5"
                      render={
                        <Link href="#link">
                          <CirclePlay className="fill-primary/25 stroke-primary" />
                          <span className="text-nowrap">Watch video</span>
                        </Link>
                      }
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <p className="text-muted-foreground">Trusted by teams at :</p>
                  <div className="mt-6 flex items-center gap-8 **:fill-foreground">
                    <VercelFull height={20} width={76} />
                    <Spotify height={22} width={73} />
                    <SupabaseFull className="h-[22px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-24 translate-x-12 perspective-near md:absolute md:top-40 md:-right-6 md:bottom-16 md:left-1/2 md:mt-0 md:translate-x-0">
              <div className="relative h-full before:absolute before:-inset-x-4 before:top-0 before:bottom-7 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border before:border-foreground/5 before:bg-foreground/5">
                <div className="relative h-full -translate-y-12 skew-x-6 overflow-hidden rounded-(--radius) border border-transparent bg-background shadow-md ring-1 shadow-foreground/10 ring-foreground/5">
                  <Image
                    src="/mist/tailark.png"
                    alt="app screen"
                    width="2880"
                    height="1842"
                    className="size-full object-cover object-top-left"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
