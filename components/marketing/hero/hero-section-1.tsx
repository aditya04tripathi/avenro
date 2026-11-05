import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import heroImage from "@/assets/images/generated/hero-img.webp"
import { HeroHeader } from "@/components/marketing/hero/header"
import { Button } from "@/components/ui/button"

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
                  <p className="mb-4 text-sm text-muted-foreground">
                    Avenro is in early development.
                  </p>
                  <h1 className="max-w-md text-5xl font-medium text-balance md:text-6xl">
                    Project work, connected
                  </h1>
                  <p className="my-8 max-w-2xl text-xl text-balance text-muted-foreground">
                    Backlog, sprints, meetings and decisions in one calm place.
                    Each decision links to the work it affects.
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      nativeButton={false}
                      size="lg"
                      className="pr-4.5"
                      render={
                        <Link href="/auth/sign-up">
                          <span className="text-nowrap">Get started</span>
                          <ChevronRight className="opacity-50" />
                        </Link>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <figure
              data-ai-generated="true"
              className="m-0 mt-24 translate-x-12 perspective-near md:absolute md:top-40 md:-right-6 md:bottom-16 md:left-1/2 md:mt-0 md:translate-x-0"
            >
              <div className="relative h-full before:absolute before:-inset-x-4 before:top-0 before:bottom-7 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border before:border-foreground/5 before:bg-foreground/5">
                <div className="relative aspect-4/3 h-full -translate-y-12 skew-x-6 overflow-hidden rounded-(--radius) border border-transparent bg-background shadow-md ring-1 shadow-foreground/10 ring-foreground/5 md:aspect-auto">
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top-left"
                  />
                  <figcaption className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground">
                    AI-generated image
                  </figcaption>
                </div>
              </div>
            </figure>
          </div>
        </section>
      </main>
    </>
  )
}
