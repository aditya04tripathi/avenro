# Phase 12 — License audit

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 11 is committed.

Skills: `karpathy-guidelines`, `antislop-copywriting`.

Steps:
1. Dependencies: `pnpm licenses list --prod --json > docs/legal/licenses.json`; summarise in `docs/legal/THIRD_PARTY_NOTICES.md`. Flag anything not MIT/ISC/BSD/Apache-2.0/OFL/MPL-2.0 for the owner. Apache-2.0 packages with a NOTICE file: copy notices in. Confirm no GPL/AGPL in the production bundle.
2. Fonts: Rubik, Public Sans, Geist Mono are SIL OFL 1.1; record source and license in notices.
3. UI code: shadcn/ui (MIT) and the marketing blocks from Tailark ("Mist"), open source per the owner. Find the upstream repository and its license file (search `tailark` on GitHub), record repo URL, license name and copyright holder in `THIRD_PARTY_NOTICES.md`, and keep any attribution the license requires (MIT needs the copyright and permission notice kept with copies of the code: add it to the notices file). If the license found is not open source, stop and record a blocker.
4. Images: `assets/LICENSES.md` with source, author, license, and whether AI-generated for every file in `assets/` and `public/`. `auth-background*.jpg` and `woman-meditating-in-mountains.jpg` are open source per the owner (5 Nov 2026): record them as "open source, owner-declared", and add the upstream URL and license if the agent can find it. `strava.png` is a third-party trademark logo; an open copyright license does not grant trademark use, so delete it. Avenro brand files are owner-made. New images come from `agy` (step 5).
5. Generating images with agy (`~/.local/bin/agy`). Run one image per call, non-interactive, scoped to one output folder:
   ```bash
   agy -p "Generate a 1600x1200 PNG illustration: <subject>. Abstract, no text, no logos, no real people or brands. Colors: navy #222e44, teal #1e6b70, green #1b9c92 on near-white. Save it as assets/images/generated/<name>.png and print only the saved path." --add-dir assets/images/generated --mode accept-edits --output-format json
   ```
   Then: confirm the file exists and opens (`file assets/images/generated/<name>.png`); view it with the Read tool and reject anything with text, logos, faces or artefacts; convert to WebP if larger than 300 KB; record prompt, `agy` model (`agy models`), date and "AI-generated" in `assets/LICENSES.md`. Never pass `--dangerously-skip-permissions`. If `agy` cannot produce an image file, stop and record a blocker; do not substitute stock images. Subjects: hero (connected meeting notes, decisions and board cards), auth background (calm abstract shapes), up to three feature-card illustrations.
6. AI-generated content: any image or copy marked AI-generated in `assets/LICENSES.md` gets a visible caption "AI-generated image" next to it (small `text-muted-foreground` text that still passes contrast) and `data-ai-generated="true"`. Decorative AI images keep `alt=""` but still show the caption. Legal pages are human-reviewed and never AI-labelled as authoritative.

Acceptance: every runtime dependency and asset has a license entry; no unlicensed asset is referenced (`rg` image imports vs `assets/LICENSES.md`).
