import type { Metadata } from "next"
import LegalIntro from "@/components/legal/legal-intro"
import { company, plan } from "@/lib/legal/company"

export const metadata: Metadata = {
  title: "Refunds",
  description:
    "No charge during the free trial. How cancellation works and the refund window.",
  alternates: { canonical: "/refunds" },
}

export default function RefundsPage() {
  return (
    <>
      <LegalIntro title="Refunds">
        How charges, cancellation and refunds work for the {plan.name} plan.
      </LegalIntro>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">During the free trial</h2>
        <p>
          You are not charged during the {plan.trialDays}-day free trial. Cancel
          before the trial ends and you pay nothing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cancelling</h2>
        <p>
          You can cancel at any time from your account. You keep access until
          the end of the period you have paid for. We do not charge again after
          you cancel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Refund window</h2>
        <p>
          Refund window: {company.refundWindow}. Refund requests go to{" "}
          {company.contactEmail}.
        </p>
      </section>
    </>
  )
}
