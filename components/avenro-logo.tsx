"use client"

import { useSyncExternalStore } from "react"
import Image from "next/image"
import { cn } from "cn"
import { useTheme } from "next-themes"
import BrandmarkReversed from "@/assets/brand/brandmark-inverted.webp"
import OneColorBrandMarkLight from "@/assets/brand/brandmark-one-color-inverted.webp"
import OneColorBrandMarkDark from "@/assets/brand/brandmark-one-color-primary.webp"
import BrandmarkPrimary from "@/assets/brand/brandmark-primary.webp"
import LogoHorizontalDark from "@/assets/brand/logo-inverted.webp"
import LogoHorizontalLight from "@/assets/brand/logo-primary.webp"
import LogoStackedDark from "@/assets/brand/logo-stacked-inverted.webp"
import LogoStackedLight from "@/assets/brand/logo-stacked-primary.webp"

interface AvenroLogoProps {
  type?: "brandmark" | "logo" | "stacked"
  variant?: "one-color" | "default"
  height?: number
  width?: number
  className?: string
  priority?: boolean
}

const emptySubscribe = () => () => {}

const AvenroLogo = ({
  type = "brandmark",
  variant = "default",
  height,
  width,
  className,
  priority = false,
}: AvenroLogoProps) => {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const isDark = mounted && resolvedTheme === "dark"

  const src =
    type === "brandmark"
      ? variant === "one-color"
        ? isDark
          ? OneColorBrandMarkDark
          : OneColorBrandMarkLight
        : isDark
          ? BrandmarkReversed
          : BrandmarkPrimary
      : type === "stacked"
        ? isDark
          ? LogoStackedDark
          : LogoStackedLight
        : isDark
          ? LogoHorizontalDark
          : LogoHorizontalLight

  const defaultHeight = type === "brandmark" ? 32 : 40
  const renderedHeight = height ?? defaultHeight
  const renderedWidth =
    width ?? Math.round(renderedHeight * (src.width / src.height))

  return (
    <Image
      src={src}
      width={renderedWidth}
      height={renderedHeight}
      style={{
        width: renderedWidth,
        height: renderedHeight,
      }}
      className={cn("shrink-0 object-contain", className)}
      alt="Avenro Logo"
      priority={priority}
    />
  )
}

export default AvenroLogo
