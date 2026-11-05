import { Card } from "@/components/ui/card"

export default function Features() {
  return (
    <section>
      <div className="bg-muted/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div>
            <h2 className="text-4xl font-semibold text-foreground">
              Effortless Task Management
            </h2>
            <p className="mt-4 mb-12 text-lg text-balance text-muted-foreground">
              Automate your tasks and workflows by connecting your favorite
              tools like Notion, Todoist, and more. AI-powered scheduling helps
              you stay on track and adapt to changing priorities.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap md:mt-16">
            <div className="w-full space-y-4 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)]">
              <Card className="aspect-video overflow-hidden px-6">
                <Card className="h-full translate-y-6" />
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-xl font-semibold text-foreground">
                  Marketing Campaigns
                </h3>
                <p className="my-4 text-lg text-muted-foreground">
                  Effortlessly book and manage your meetings. Stay on top of
                  your schedule.
                </p>
              </div>
            </div>
            <div className="w-full space-y-4 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)]">
              <Card className="aspect-video overflow-hidden p-6">
                <Card className="h-full" />
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-xl font-semibold text-foreground">
                  AI Meeting Scheduler
                </h3>
                <p className="my-4 text-lg text-muted-foreground">
                  Effortlessly book and manage your meetings. Stay on top of
                  your schedule.
                </p>
              </div>
            </div>
            <div className="w-full space-y-4 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)]">
              <Card className="aspect-video overflow-hidden">
                <Card className="h-full translate-6" />
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-xl font-semibold text-foreground">
                  AI Meeting Scheduler
                </h3>
                <p className="my-4 text-lg text-muted-foreground">
                  Effortlessly book and manage your meetings. Stay on top of
                  your schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
