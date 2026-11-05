---
version: alpha
name: Avenro
description: Design tokens for the Avenro web app (apps/web), taken from app/globals.css and the marketing components. Light values are the default theme; dark values are in the Themes table.
colors:
  brand-navy: "#222e44"
  brand-teal: "#1e6b70"
  brand-green: "#1b9c92"
  background: "oklch(0.99 0.003 250)"
  foreground: "#222e44"
  card: "oklch(1 0 0)"
  card-foreground: "#222e44"
  popover: "oklch(1 0 0)"
  popover-foreground: "#222e44"
  primary: "#222e44"
  primary-foreground: "oklch(0.99 0.003 250)"
  secondary: "oklch(0.95 0.025 185)"
  secondary-foreground: "#222e44"
  muted: "oklch(0.965 0.008 250)"
  muted-foreground: "oklch(0.48 0.025 250)"
  accent: "oklch(0.93 0.055 180)"
  accent-foreground: "#222e44"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.9 0.015 250)"
  input: "oklch(0.9 0.015 250)"
  ring: "#1b9c92"
  chart-1: "#222e44"
  chart-2: "#1e6b70"
  chart-3: "#1b9c92"
  chart-4: "oklch(0.62 0.1 190)"
  chart-5: "oklch(0.72 0.08 165)"
  sidebar: "oklch(0.975 0.008 250)"
  sidebar-foreground: "#222e44"
  sidebar-primary: "#222e44"
  sidebar-primary-foreground: "oklch(0.99 0.003 250)"
  sidebar-accent: "oklch(0.93 0.055 180)"
  sidebar-accent-foreground: "#222e44"
  sidebar-border: "oklch(0.9 0.015 250)"
  sidebar-ring: "#1b9c92"
typography:
  heading:
    fontFamily: Rubik
    fontWeight: 700
  body:
    fontFamily: Public Sans
  mono:
    fontFamily: Geist Mono
  h1:
    fontFamily: Rubik
    fontSize: 2.25rem
    lineHeight: 2.5rem
    fontWeight: 700
  h2:
    fontFamily: Rubik
    fontSize: 1.875rem
    lineHeight: 2.25rem
    fontWeight: 700
  h3:
    fontFamily: Rubik
    fontSize: 1.5rem
    lineHeight: 2rem
    fontWeight: 700
  h4:
    fontFamily: Rubik
    fontSize: 1.25rem
    lineHeight: 1.75rem
    fontWeight: 700
  h5:
    fontFamily: Rubik
    fontSize: 1.125rem
    lineHeight: 1.75rem
    fontWeight: 700
  h6:
    fontFamily: Rubik
    fontSize: 1rem
    lineHeight: 1.5rem
    fontWeight: 700
rounded:
  base: 0.625rem
---

## Overview

This document records the design tokens and application rules that govern the Avenro web app in `apps/web`. The token values come from `apps/web/app/globals.css`, and the rules come from the shared components and the marketing pages.

## Colors

The text and surface palette is navy on near-white. Teal and green are accents: `brand-teal` is the dark-theme primary, and `brand-green` is the focus ring in both themes.

- Use `foreground` and `primary` (navy) for text and primary buttons on light surfaces.
- Use `muted-foreground` for secondary text. It is the only muted text token.
- Chart colors `chart-1` to `chart-5` are defined for both themes. Use them in order.

## Themes

Dark mode is applied by the `.dark` class. Only the tokens that differ from the default theme are listed below. Use the same CSS variable names in both themes.

| Token | Dark value |
| --- | --- |
| `--background` | `oklch(0.17 0.02 250)` |
| `--foreground` | `oklch(0.96 0.01 240)` |
| `--card` | `oklch(0.21 0.02 250)` |
| `--card-foreground` | `oklch(0.96 0.01 240)` |
| `--popover` | `oklch(0.21 0.02 250)` |
| `--popover-foreground` | `oklch(0.96 0.01 240)` |
| `--primary` | `#1e6b70` (`--brand-teal`) |
| `--primary-foreground` | `oklch(0.99 0.003 250)` |
| `--secondary` | `oklch(0.29 0.025 225)` |
| `--secondary-foreground` | `oklch(0.96 0.01 240)` |
| `--muted` | `oklch(0.25 0.02 250)` |
| `--muted-foreground` | `oklch(0.74 0.02 220)` |
| `--accent` | `oklch(0.31 0.045 185)` |
| `--accent-foreground` | `oklch(0.96 0.01 240)` |
| `--destructive` | `oklch(0.704 0.191 22.216)` |
| `--border` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(1 0 0 / 15%)` |
| `--ring` | `#1b9c92` (`--brand-green`) |
| `--chart-1` | `oklch(0.76 0.09 185)` |
| `--chart-2` | `oklch(0.7 0.12 175)` |
| `--chart-3` | `oklch(0.62 0.1 190)` |
| `--chart-4` | `oklch(0.83 0.08 165)` |
| `--chart-5` | `oklch(0.58 0.08 225)` |
| `--sidebar` | `oklch(0.21 0.02 250)` |
| `--sidebar-foreground` | `oklch(0.96 0.01 240)` |
| `--sidebar-primary` | `#1b9c92` (`--brand-green`) |
| `--sidebar-primary-foreground` | `#222e44` (`--brand-navy`) |
| `--sidebar-accent` | `oklch(0.29 0.025 225)` |
| `--sidebar-accent-foreground` | `oklch(0.96 0.01 240)` |
| `--sidebar-border` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `#1b9c92` (`--brand-green`) |

Dark `primary` is `brand-teal` (`#1e6b70`). Used as text on the dark background, it may fall below WCAG AA 4.5:1 contrast. Check it before using it for text.

## Typography

- Headings use Rubik (`--font-heading`). Base heading sizes are h1 2.25rem down to h6 1rem, all bold.
- Body text uses Public Sans (`--font-sans`), set on `html`.
- Code uses Geist Mono (`--font-mono`), applied to `pre`.

## Layout

- Marketing sections sit in a `max-w-5xl` container with `px-6` side padding.
- Section vertical padding is `py-16` to `py-36` depending on the section. The footer uses `py-16`.
- The header is `fixed` with `py-3`. After scroll it gets a bottom border and a `bg-background/75` backdrop blur.

## Shapes

The base radius is `0.625rem`, from `--radius`. Radius steps are derived in `@theme inline` from this single value.

## Components

- Buttons come from `components/ui/button.tsx`. Use these variants:
  - `default` for the primary action.
  - `ghost` for secondary navigation such as Login.
  - `outline` and `secondary` for other actions.
  - `size="sm"` for compact header actions.
- The marketing header and the shared header use the logo, then links on the right. The footer uses the brandmark, then text links, then social icons.
