---
title: Owner generates marketing images; footer social icons stay inert until real URLs exist
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 7, tokens: 118394 }
id: l-8c4e31b4
scope: repo
status: active
src: agent
touches:
  - assets/LICENSES.md
  - assets/images/generated/hero-img.webp
  - components/marketing/call-to-action.tsx
  - components/marketing/faqs.tsx
  - components/marketing/features.tsx
  - components/marketing/footer.tsx
  - components/marketing/hero/hero-section-1.tsx
---

## Decided
- The owner makes the marketing images himself. An agent stops any background `agy` image run once the owner says so, and only wires in the file the owner drops in `assets/images/generated/`.
- Social icons with a placeholder URL render as non-interactive `aria-hidden` spans, not links, so no dead `href="#"` ships.

## Tried and ruled out
- Running `agy` in the background to make the hero image. The owner asked it to stop; the run was killed with TaskStop.
- Wrapping `agy` in `timeout`. macOS has no `timeout` binary; the shell reports "command not found". Use the Bash tool's own timeout parameter instead.

## Watch out
- In the code: `components/marketing/footer.tsx` links to `/pricing`, `/privacy`, `/terms`, `/cookies`, `/refunds`, `/subprocessors`, `/contact`. These 404 until phase 08 adds the pages.
- In the code: `components/marketing/hero/hero-section-1.tsx` uses `next/image` `fill`, so the frame needs `aspect-4/3` below `md`, or it collapses to zero height on phones.
- In the code: `assets/LICENSES.md` records the hero image as made with Gemini, prompt not recorded. Fill in the prompt if it is known.
