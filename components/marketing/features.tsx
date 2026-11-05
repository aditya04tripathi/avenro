import { Card } from "@/components/ui/card"

const features = [
  {
    title: "Backlog and boards",
    body: "Capture work with just a title. Add details only when you need them. See it on a board that moves as fast as you do.",
  },
  {
    title: "Sprints and meetings",
    body: "Plan sprints, run meetings and keep the minutes in the same project as the work they touch.",
  },
  {
    title: "Decisions that stay linked",
    body: "Turn a decision into an issue with a two-way link. Action items with owners show up in your inbox when they are overdue.",
  },
]

export default function Features() {
  return (
    <section>
      <div className="bg-muted/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div>
            <h2 className="text-4xl font-semibold text-foreground">
              Less setup, fewer clicks
            </h2>
            <p className="mt-4 mb-12 text-lg text-balance text-muted-foreground">
              Avenro keeps the tools a small team needs and leaves out the rest.
              Start with a project and a title.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap md:mt-16">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="w-full space-y-4 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)]"
              >
                <Card className="aspect-video overflow-hidden px-6">
                  <Card className="h-full translate-y-6" />
                </Card>
                <div className="sm:max-w-sm">
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="my-4 text-lg text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
