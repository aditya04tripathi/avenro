import type { Metadata } from "next"
import Link from "next/link"
import LegalIntro from "@/components/legal/legal-intro"
import { company, plan } from "@/lib/legal/company"

export const metadata: Metadata = {
  title: "Pricing",
  description: `${plan.name} plan: $${plan.monthlyPriceUsd} per active member per month or $${plan.yearlyPriceUsd} per year, with a ${plan.trialDays}-day free trial.`,
  alternates: { canonical: "/pricing" },
}

export default function PricingPage() {
  return (
    <>
      <LegalIntro title="Pricing">
        One plan, {plan.name}. Every feature is included.
      </LegalIntro>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{plan.name}</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>${plan.monthlyPriceUsd} per active member per month.</li>
          <li>${plan.yearlyPriceUsd} per active member per year.</li>
          <li>No seat minimum. You pay only for active members.</li>
          <li>Members with the Viewer or Client role are free.</li>
          <li>Tax is calculated at checkout and shown before you pay.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          What counts as an active member
        </h2>
        <p>
          An active member is a person with an active membership in your
          workspace who does not hold the Viewer or Client role. Removing a
          member, or changing their role to Viewer or Client, stops that member
          from counting.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Free trial</h2>
        <p>
          New workspaces get a {plan.trialDays}-day free trial. A payment card
          is required to start it. You are not charged during the trial. When
          the trial ends, the subscription starts and renews automatically until
          you cancel. Cancel before the trial ends and you pay nothing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Renewal and cancellation</h2>
        <p>
          Subscriptions renew automatically at the end of each billing period.
          You can cancel at any time from your account, and you keep access
          until the end of the period you have paid for.{" "}
          <Link href="/account" className="underline">
            Manage your subscription in your account
          </Link>
          .
        </p>
        <p>
          Refund terms are on the{" "}
          <Link href="/refunds" className="underline">
            refunds page
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Price changes</h2>
        <p>
          We give 30 days notice of any price change. Your current price stays
          in place until the notice period ends.
        </p>
      </section>

      <p className="text-sm text-muted-foreground">
        Questions about pricing? Email {company.contactEmail}.
      </p>
    </>
  )
}
