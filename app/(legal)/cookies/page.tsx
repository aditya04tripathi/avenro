import type { Metadata } from "next"
import LegalIntro from "@/components/legal/legal-intro"

export const metadata: Metadata = {
  title: "Cookies",
  description: "Every cookie and browser storage key Avenro sets, and why.",
  alternates: { canonical: "/cookies" },
}

const cookies = [
  {
    name: "sb-avenro-auth-token (and its chunks)",
    type: "Cookie",
    purpose: "Keeps you signed in.",
    category: "Necessary",
    duration: "Session",
  },
  {
    name: "avenro_consent",
    type: "Cookie",
    purpose: "Remembers your cookie choice.",
    category: "Necessary",
    duration: "6 months",
  },
  {
    name: "age_gate",
    type: "Cookie",
    purpose: "Remembers that the age check passed, so you are not asked again.",
    category: "Necessary",
    duration: "24 hours",
  },
  {
    name: "theme",
    type: "Local storage",
    purpose: "Remembers your light or dark theme.",
    category: "Necessary",
    duration: "Until you change it or clear browser data",
  },
] as const

export default function CookiesPage() {
  return (
    <>
      <LegalIntro title="Cookies">
        This page lists each cookie and browser storage key Avenro sets.
      </LegalIntro>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What we set</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Name
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Type
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Purpose
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Category
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {cookies.map((cookie) => (
                <tr key={cookie.name} className="border-b align-top">
                  <td className="py-2 pr-4 font-mono text-xs">{cookie.name}</td>
                  <td className="py-2 pr-4">{cookie.type}</td>
                  <td className="py-2 pr-4">{cookie.purpose}</td>
                  <td className="py-2 pr-4">{cookie.category}</td>
                  <td className="py-2">{cookie.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Analytics and marketing</h2>
        <p>
          Avenro does not use analytics or marketing cookies today. All keys
          listed above are necessary for the service or for your cookie choice,
          so no consent is needed for them.
        </p>
      </section>
    </>
  )
}
