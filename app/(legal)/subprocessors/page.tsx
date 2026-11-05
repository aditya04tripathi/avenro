import type { Metadata } from "next"
import LegalIntro from "@/components/legal/legal-intro"
import { company, PLACEHOLDER } from "@/lib/legal/company"

export const metadata: Metadata = {
  title: "Subprocessors",
  description:
    "The companies that process Avenro data for us, what they do, where, and their data processing agreements.",
  alternates: { canonical: "/subprocessors" },
}

const subprocessors = [
  {
    name: "Supabase",
    purpose: "Database, authentication and file storage.",
    location: company.dataRegion,
    dpa: "https://supabase.com/privacy",
  },
  {
    name: "Stripe",
    purpose: "Payments, tax calculation and fraud screening.",
    location: "Stripe's regions, as set out in its DPA.",
    dpa: "https://stripe.com/legal/dpa",
  },
  {
    name: "Email provider (SMTP)",
    purpose: "Sends sign-up, password and billing emails.",
    location: PLACEHOLDER,
    dpa: PLACEHOLDER,
  },
  {
    name: "Hosting provider",
    purpose: "Runs the Avenro web application.",
    location: PLACEHOLDER,
    dpa: PLACEHOLDER,
  },
] as const

export default function SubprocessorsPage() {
  return (
    <>
      <LegalIntro title="Subprocessors">
        These companies process personal data for {company.tradingName} to
        provide the service.
      </LegalIntro>

      <section className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Provider
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Purpose
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Location
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Data processing agreement
                </th>
              </tr>
            </thead>
            <tbody>
              {subprocessors.map((row) => (
                <tr key={row.name} className="border-b align-top">
                  <td className="py-2 pr-4">{row.name}</td>
                  <td className="py-2 pr-4">{row.purpose}</td>
                  <td className="py-2 pr-4">{row.location}</td>
                  <td className="py-2">{row.dpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes to this list</h2>
        <p>We will update this page before we add a subprocessor.</p>
      </section>
    </>
  )
}
