import type { Metadata } from "next"
import LegalIntro from "@/components/legal/legal-intro"
import { company } from "@/lib/legal/company"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to contact Avenro about the service, privacy or legal matters.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <>
      <LegalIntro title="Contact" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Company</h2>
        <address className="space-y-1 not-italic">
          <p>{company.legalName}</p>
          <p>{company.postalAddress}</p>
        </address>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Email</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>General and legal: {company.contactEmail}</li>
          <li>Privacy requests: {company.privacyEmail}</li>
        </ul>
      </section>
    </>
  )
}
