import type { Metadata } from "next"
import Link from "next/link"
import LegalIntro from "@/components/legal/legal-intro"
import { company } from "@/lib/legal/company"

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Avenro collects, why, how long we keep it, and how to use your data rights.",
  alternates: { canonical: "/privacy" },
}

const retention = [
  ["Unconfirmed sign-ups", "7 days after sign-up"],
  ["Notifications", "90 days"],
  ["Webhook delivery log", "30 days"],
  [
    "Legal acceptances and privacy requests of deleted accounts",
    "3 years after deletion",
  ],
  ["Activity and audit events", "2 years"],
  ["Trial claims (fraud prevention)", "2 years"],
  ["Stripe webhook events", "90 days"],
  ["Lapsed workspaces", "30 days after the workspace becomes read-only"],
] as const

export default function PrivacyPage() {
  return (
    <>
      <LegalIntro title="Privacy policy">
        This policy explains what {company.tradingName} collects, why, and what
        you can do about it.
      </LegalIntro>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Who we are</h2>
        <p>
          The controller is {company.legalName}, trading as{" "}
          {company.tradingName}. Postal address: {company.postalAddress}.
          Contact: {company.contactEmail}. Privacy requests:{" "}
          {company.privacyEmail}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Account: your email address and display name. Your password is held
            as a hash by Supabase Auth; we never see it in plain text.
          </li>
          <li>Content you create in Avenro, such as projects and issues.</li>
          <li>
            The age-gate result: a yes or no answer that you are 16 or older. We
            do not store your birth date or birth year.
          </li>
          <li>
            Consent records: which versions of the Terms and this policy you
            accepted, and whether you opted in to marketing email.
          </li>
          <li>
            Billing data held by Stripe: Stripe stores your payment card and
            billing details. Avenro stores only your Stripe customer and
            subscription IDs. We never store card numbers.
          </li>
          <li>
            Trial-abuse records: keyed hashes of your normalized email address
            and of your card fingerprint, used to detect repeat free trials.
          </li>
        </ul>
        <p>We do not run analytics or advertising trackers today.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Why we use it and our legal bases
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            To run Avenro for you (account, content, billing): necessary to
            perform our contract with you.
          </li>
          <li>
            To keep Avenro secure and prevent trial abuse: our legitimate
            interest in preventing fraud and protecting the service. The
            trial-abuse hashes are kept for 2 years for this reason.
          </li>
          <li>
            To send marketing email: only if you opt in, and you can withdraw
            consent at any time.
          </li>
          <li>
            To meet legal duties, such as tax records: necessary to comply with
            the law.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How long we keep data</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Data
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Kept for
                </th>
              </tr>
            </thead>
            <tbody>
              {retention.map(([data, period]) => (
                <tr key={data} className="border-b align-top">
                  <td className="py-2 pr-4">{data}</td>
                  <td className="py-2">{period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          When you delete your account, your profile is scrubbed at once. A
          workspace where you are the only member is archived, and its owner
          record keeps only a scrubbed name and email. Your other memberships
          are removed. Your sign-in record is removed by our authentication
          provider.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Who receives your data</h2>
        <p>
          We share data only with the subprocessors listed on{" "}
          <Link href="/subprocessors" className="underline">
            the subprocessors page
          </Link>
          , and only to run the service for you. We do not sell personal data.
          We do not use your content to train AI models, and we do not allow
          subprocessors to.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">International transfers</h2>
        <p>
          Our database is hosted by Supabase in {company.dataRegion}. Some
          subprocessors may process data outside your country. Where they do,
          they process it under the contracts listed on that page.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your rights</h2>
        <p>You can ask us to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>give you access to your data;</li>
          <li>export your data;</li>
          <li>correct your data;</li>
          <li>delete your account and data;</li>
          <li>stop processing that relies on our legitimate interest.</li>
        </ul>
        <p>
          Use the privacy center at{" "}
          <Link href="/account/privacy" className="underline">
            /account/privacy
          </Link>{" "}
          when you are signed in, or email {company.privacyEmail}. We respond
          within 30 days. You can also complain to your local supervisory
          authority.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Age</h2>
        <p>
          Avenro is not for anyone under {company.minimumAge}. We block sign-up
          for anyone who is not {company.minimumAge} or older and do not store
          their details.
        </p>
      </section>
    </>
  )
}
