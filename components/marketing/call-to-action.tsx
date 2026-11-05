import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CallToAction() {
  return (
    <section>
      <div className="bg-muted py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="max-w-lg text-3xl font-semibold text-balance text-foreground lg:text-4xl">
            Start with one project.
          </h2>
          <p className="mt-4 text-lg">
            Pay per active member after a 30-day trial. Card required, cancel
            anytime.
          </p>
          <div className="mt-8 flex gap-3">
            <Button
              nativeButton={false}
              render={
                <Link href="/auth/sign-up">
                  Start 30-day trial
                  <ChevronRight
                    strokeWidth={2.5}
                    className="size-3.5! opacity-50"
                  />
                </Link>
              }
              className="pr-2"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
