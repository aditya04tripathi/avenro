// Business details shown on legal pages. Unknown values stay PLACEHOLDER;
// phase 13 blocks production builds while any value is still a placeholder.
export const PLACEHOLDER = "__OWNER_TO_PROVIDE__"

export const company = {
  legalName: PLACEHOLDER,
  tradingName: "Avenro",
  postalAddress: PLACEHOLDER,
  // Verified sender; owner confirms.
  contactEmail: "avenro@adityatripathi.dev",
  privacyEmail: PLACEHOLDER,
  dataRegion: PLACEHOLDER,
  governingLaw: PLACEHOLDER,
  jurisdiction: PLACEHOLDER,
  minimumAge: 16,
  lastUpdated: "2026-11-05",
  refundWindow: PLACEHOLDER,
} as const

export const plan = {
  name: "Team",
  monthlyPriceUsd: 8,
  yearlyPriceUsd: 80,
  trialDays: 30,
} as const

export const socialLinks = {
  // TODO: add real X profile URL
  x: PLACEHOLDER,
  // TODO: add real LinkedIn profile URL
  linkedin: PLACEHOLDER,
  // TODO: add real Facebook profile URL
  facebook: PLACEHOLDER,
  // TODO: add real Threads profile URL
  threads: PLACEHOLDER,
  // TODO: add real Instagram profile URL
  instagram: PLACEHOLDER,
  // TODO: add real TikTok profile URL
  tiktok: PLACEHOLDER,
} as const

export const copyrightLine = "© 2026 Avenro. All rights reserved."

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
