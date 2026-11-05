# Data retention

Each row is enforced by a pg_cron job in the database, or by the phase named in the row. Jobs call `private.retention_*` functions in `supabase/migrations/20261105000300_compliance.sql`.

| Data | Kept for | Enforced by |
| --- | --- | --- |
| Unconfirmed sign-ups (`auth.users`, `profiles`) | 7 days after sign-up | `retention-unconfirmed-users`, daily 03:00 |
| Notifications | 90 days | `retention-notifications`, daily 03:10 |
| Webhook delivery log | 30 days | `retention-webhook-deliveries`, daily 03:20 |
| Legal acceptances and privacy requests of deleted accounts | 3 years after deletion | `retention-deleted-profile-records`, daily 03:30 |
| Activity and audit events | 2 years | `retention-activity-logs`, daily 03:40 |
| Trial claims (fraud prevention) | 2 years | added in phase 13 |
| Stripe webhook events | 90 days | added in phase 13 |
| Lapsed workspaces, deleted 30 days after going read-only | 30 days after read-only | added in phase 13 |

Account deletion (`prepare_account_deletion`): the profile is scrubbed at once. Sole-member workspaces are archived, and the owner row is kept with its name and email scrubbed. Other memberships are removed. The `auth.users` row is removed by the Auth admin API (phase 10).
