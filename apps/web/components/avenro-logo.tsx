"use client"

import { cn } from "cn"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

import BrandmarkReversed from "@avenro/assets/brand/brandmark-inverted.webp"
import OneColorBrandMarkLight from "@avenro/assets/brand/brandmark-one-color-inverted.webp"
import OneColorBrandMarkDark from "@avenro/assets/brand/brandmark-one-color-primary.webp"
import BrandmarkPrimary from "@avenro/assets/brand/brandmark-primary.webp"

import LogoHorizontalDark from "@avenro/assets/brand/logo-inverted.webp"
import LogoHorizontalLight from "@avenro/assets/brand/logo-primary.webp"
import LogoStackedDark from "@avenro/assets/brand/logo-stacked-inverted.webp"
import LogoStackedLight from "@avenro/assets/brand/logo-stacked-primary.webp"

interface AvenroLogoProps {
  type?: "brandmark" | "logo" | "stacked"
  variant?: "one-color" | "default"
  height?: number
  width?: number
  className?: string
  priority?: boolean
}

const AvenroLogo = ({
  type = "brandmark",
  variant = "default",
  height,
  width,
  className,
  priority = false,
}: AvenroLogoProps) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
