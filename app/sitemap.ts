import type { MetadataRoute } from "next"
import { company, siteUrl } from "@/lib/legal/company"

const paths = [
  "",
  "/pricing",
  "/privacy",
  "/terms",
  "/cookies",
  "/refunds",
  "/subprocessors",
  "/contact",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(company.lastUpdated)
  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
  }))
}
