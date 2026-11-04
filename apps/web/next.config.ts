import type { NextConfig } from "next"

import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp"],
  },
}

export default nextConfig
