# Phase 11 — Accessibility, contrast, keyboard, alt text, bundle size

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 10 is committed.

Skills: `fixing-accessibility`, `antislop-human` (run its `contrast-check.py`), `antislop-layoutmobile`, `fixing-motion-performance`, `vercel-react-best-practices`, `vercel-react-view-transitions` (only if a page transition is added; it must respect reduced motion and add no dependency), `emil-design-eng`, `web-design-guidelines`, `baseline-ui`, `karpathy-guidelines`.

Steps:
1. Contrast: run `python3 .claude/skills/antislop-human/contrast-check.py` for every foreground/background token pair used in both themes (`foreground/background`, `muted-foreground/muted`, `muted-foreground/background`, `primary-foreground/primary`, `primary/background` as text, `destructive/background`, `ring/background` ≥ 3:1). Adjust only failing token values in `app/globals.css`, keeping hue; in dark mode give text-use of primary its own lighter token if needed. Record before/after ratios in `DESIGN.md`. Replace `opacity-50` on meaningful icons.
2. Keyboard: add a "Skip to content" link as the first focusable element in `app/layout.tsx`, target `<main id="main">`; visible `focus-visible` ring on every interactive element; remove the single-key `d` theme shortcut from `components/theme-provider.tsx` and add a labelled theme toggle button in the header and footer; confirm the accordion, dialogs and banner work with Tab, Shift+Tab, Enter, Space, Escape.
3. Alt text: decorative images `alt=""` (auth background); logo image `alt=""` inside links that carry `aria-label="Avenro home"`; any content image gets descriptive alt. Fix `aria-label="go home"` / `"home"` to `"Avenro home"`.
4. Forms: every input has a label, errors linked by `aria-describedby`, `aria-invalid` when invalid, status messages in `role="status"`/`role="alert"`.
5. Bundle: convert `components/avenro-logo.tsx` to a server component that renders both theme images with `dark:hidden` / `hidden dark:block` (removes `useTheme`, `useEffect` and the hydration swap); remove `"use client"` from `components/marketing/faqs.tsx` (the accordion primitive is already a client component); keep `HeroHeader` client but use a passive scroll listener; ensure `lib/highlighter.tsx` / `shiki` and `recharts` are not imported by any route. Run `pnpm build` and record First Load JS per route in the phase commit; target ≤ the pre-migration value for `/`.
6. Motion: respect `prefers-reduced-motion` for header transitions and `backdrop-blur` (fixing-motion-performance).
7. Mobile: auth layout hides the side image below `md` and the form fills the width; all tap targets ≥ 44 px; no horizontal scroll at 320 px.

Acceptance: contrast script passes for all listed pairs; axe-style manual check via browser pane on `/`, `/auth/sign-up`, `/privacy`, `/account/privacy` finds no missing labels or alt; keyboard-only walkthrough of sign-up and banner succeeds.
