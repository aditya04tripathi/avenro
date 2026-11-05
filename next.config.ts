import type { NextConfig } from "next"

const isProduction = process.env.NODE_ENV === "production"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]
    : []),
]

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noai, noimageai" },
        ],
      },
      {
        source: "/:path(account|auth|app|api)/:rest*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, noai, noimageai" }],
      },
      {
        source: "/:path(account|auth|app|api)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, noai, noimageai" }],
      },
    ]
  },
}

export default nextConfig
