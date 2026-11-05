import type { Metadata } from "next"
import LegalIntro from "@/components/legal/legal-intro"
import { company, plan } from "@/lib/legal/company"

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The rules for using Avenro, your content, subscriptions, cancellation and termination.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <>
      <LegalIntro title="Terms of service">
        These terms form a contract between you and {company.legalName}, trading
        as {company.tradingName}.
      </LegalIntro>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Who may use Avenro</h2>
        <p>
          You must be at least {company.minimumAge} years old to create an
          account. By accepting these terms you confirm that you are.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Accounts</h2>
        <p>
          You are responsible for your sign-in details and for activity under
          your account. Tell us at {company.contactEmail} if you believe someone
          else has access to it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Acceptable use</h2>
        <p>
          Do not use Avenro to break the law, to harm others, to attack or probe
          the service, or to store content you have no right to store.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your content</h2>
        <p>
          You own the content you create in Avenro. You give us a limited
          license to host, store, copy and display it only so that we can
          provide the service to you and your workspace members.
        </p>
        <p>
          We do not use your content to train AI models, and we do not allow
          subprocessors to.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Copyright complaints</h2>
        <p>
          To report content you believe infringes your copyright, email{" "}
          {company.contactEmail}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Subscriptions and billing</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Avenro offers one paid plan, {plan.name}: ${plan.monthlyPriceUsd}{" "}
            per active member per month, or ${plan.yearlyPriceUsd} per active
            member per year. Members with the Viewer or Client role are free.
          </li>
          <li>
            New workspaces start a {plan.trialDays}-day free trial. A payment
            card is required to start it. The trial converts to a paid
            subscription when it ends, unless you cancel first.
          </li>
          <li>
            Subscriptions renew automatically at the end of each billing period
            until you cancel.
          </li>
          <li>
            We give 30 days notice of any price change. The new price applies
            from your next renewal after that notice.
          </li>
          <li>
            You can cancel at any time from your account. Cancellation takes
            effect at the end of the current billing period. You keep access
            until then.
          </li>
          <li>
            If a payment fails, we retry it. If it keeps failing, the workspace
            becomes read-only. A read-only workspace is deleted 30 days after it
            becomes read-only, unless you pay.
          </li>
          <li>
            Stripe processes payments and tax. Taxes are calculated at checkout
            and shown before you pay.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Availability</h2>
        <p>
          Avenro is provided as is. We do not guarantee uptime and we do not
          offer a service level agreement. We aim to give notice of planned
          maintenance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes to these terms</h2>
        <p>
          We may update these terms. If an update changes what you agreed to, we
          ask you to accept the new version before you continue using Avenro.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ending your use</h2>
        <p>
          You can delete your account at any time from your account settings.
          Deletion scrubs your profile at once and removes your data as
          described in the privacy policy. We can suspend or end an account that
          breaks these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Liability</h2>
        <p>
          To the extent the law allows, Avenro is not liable for indirect or
          consequential loss. Nothing in these terms limits liability that the
          law does not allow us to limit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Governing law</h2>
        <p>
          These terms are governed by the laws of {company.governingLaw}. Courts
          in {company.jurisdiction} have jurisdiction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          {company.legalName}, {company.postalAddress}. Email{" "}
          {company.contactEmail}.
        </p>
      </section>
    </>
  )
}
