const densities = [
  { descriptor: "0.75x", density: 0.75, width: 375 },
  { descriptor: "1x", density: 1, width: 500 },
  { descriptor: "1.5x", density: 1.5, width: 750 },
  { descriptor: "2x", density: 2, width: 1000 },
  { descriptor: "3x", density: 3, width: 1500 },
  { descriptor: "4x", density: 4, width: 2000 },
] as const

const logos = {
  brandmarkPrimary: {
    category: "brandmarks",
    file: "avenro-brandmark-primary",
  },
  brandmarkReversed: {
    category: "brandmarks",
    file: "avenro-brandmark-reversed",
  },
  brandmarkOneColorDark: {
    category: "brandmarks",
    file: "avenro-brandmark-one-color-dark",
  },
  brandmarkOneColorLight: {
    category: "brandmarks",
    file: "avenro-brandmark-one-color-light",
  },
  lockupHorizontal: {
    category: "lockups",
    file: "avenro-lockup-horizontal",
  },
  lockupHorizontalReversed: {
    category: "lockups",
    file: "avenro-lockup-horizontal-reversed",
  },
  lockupStacked: {
    category: "lockups",
    file: "avenro-lockup-stacked",
  },
  lockupStackedReversed: {
    category: "lockups",
    file: "avenro-lockup-stacked-reversed",
  },
} as const

export type AvenroLogoVariant = keyof typeof logos

export interface AvenroLogoSources {
  svg: string
  defaultWebp: string
  srcSet: string
  densitySrcSet: string
}

export function getAvenroLogoSources(
  variant: AvenroLogoVariant
): AvenroLogoSources {
  const { category, file } = logos[variant]
  const basePath = `/brand/avenro/${category}/${file}`

  const densitySrcSet = densities
    .map(({ descriptor }) => `${basePath}@${descriptor}.webp ${descriptor}`)
    .join(", ")

  const srcSet = densities
    .map(({ descriptor, width }) => `${basePath}@${descriptor}.webp ${width}w`)
    .join(", ")

  return {
    svg: `${basePath}.svg`,
    defaultWebp: `${basePath}@1x.webp`,
    srcSet,
    densitySrcSet,
  }
}
