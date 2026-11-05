# Phase 10 — Privacy center: access, deletion, marketing consent, unsubscribe

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 09 is committed.

Skills: `antislop-ui`, `fixing-accessibility`, `antislop-copywriting`, `antislop-code`, `karpathy-guidelines`.

Steps:
1. `app/account/privacy/page.tsx` (server): sections "Download your data", "Marketing email" (switch, reflects `marketing_consents`), "Delete your account", "Legal documents you accepted" (versions and dates).
2. `app/api/account/export/route.ts` (GET, authenticated): calls `export_my_data()` via the user's server client; responds `Content-Disposition: attachment; filename="avenro-export-YYYY-MM-DD.json"`; inserts a completed `access` row in `privacy_requests`.
3. Deletion: `AlertDialog` requiring the user to type `DELETE`; server action calls `prepare_account_deletion()`; on `sole_owner` show which workspaces need a new owner (link to transfer); on success call admin `auth.admin.deleteUser(id)`, sign out, redirect to `/` with a confirmation message. No retention-offer screens, no "are you really sure" chains beyond the one dialog.
4. Marketing: `set_marketing_consent` server action; unchecking takes effect immediately.
5. Unsubscribe: `lib/email/unsubscribe-token.ts` (`server-only`) HMAC-SHA256 over `profile_id` + issued date with `UNSUBSCRIBE_TOKEN_SECRET`, base64url, verify with `timingSafeEqual`, valid 1 year. `app/unsubscribe/route.ts` handles `POST` (RFC 8058 one-click: `List-Unsubscribe=One-Click` body) and `app/unsubscribe/page.tsx` handles `GET ?token=` with a single "Unsubscribe" button (GET alone never changes state, mail scanners prefetch links). Both use the admin client to set `opted_in=false, source='unsubscribe_link'`. No login required.
6. `lib/email/marketing.ts` (`server-only`): `buildMarketingHeaders(profileId)` returning `List-Unsubscribe: <SITE_URL/unsubscribe?token=…>, <mailto:privacyEmail?subject=unsubscribe>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, plus `assertMarketingAllowed(profileId)` that throws unless `opted_in` is true. Any future marketing sender must use both (phase 13 guard checks it).
7. Non-users: `/privacy` and `/contact` give `privacyEmail` for requests; owner logs them manually in `privacy_requests` via Studio.

Acceptance: export downloads JSON containing only the caller's data; deletion of a sole-member account removes the `auth.users` row and scrubs the profile; deletion as sole owner of a shared workspace is refused with guidance; unsubscribe POST with a valid token flips consent, with a tampered token returns 400.
