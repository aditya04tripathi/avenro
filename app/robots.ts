import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/legal/company"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/auth", "/app", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
