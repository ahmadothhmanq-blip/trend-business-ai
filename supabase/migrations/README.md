# Supabase migrations (execution order)

Run these files in order against your Supabase project (SQL Editor or CLI).

| Order | File | Creates |
| ----- | ---- | ------- |
| 1–9 | `001` … `009` | Core MVP tables |
| 10 | `010_workspace_generations.sql` | Workspace generations |
| 11 | `011_ai_engine_phase5.sql` | AI engine extensions |
| 12 | `012_ai_provider_settings.sql` | Provider settings |
| 13–20 | `013` … `020` | Create / Design / Video / Content / Business tables |
| 21 | `021_platform_infrastructure.sql` | Organizations, teams, API keys, webhooks, usage |
| 22 | `022_ai_agents_platform.sql` | Agents, workflows, executions |
| 23 | `023_security_hardening.sql` | RLS fixes, indexes, `updated_at` triggers |
| 24 | `024_organization_bootstrap.sql` | Org create + owner bootstrap policies |
| 44 | `044_video_studio_media.sql` | Video Studio media tables + `video-studio` bucket |
| 45 | `045_video_studio_media_update_rls.sql` | Video Studio `video_media` UPDATE RLS |
| 46 | `046_webapp_deployments.sql` | App Builder deployments (preview + production) |

## App Builder (046)

```bash
npm run db:apply -- --only 046
npm run verify:app-builder
```

## Video Studio (044–045)

```bash
npm run db:apply -- --only 044,045
npm run verify:video-studio
```

## Phase 14 — Organizations / Team (021–024)

**Option A — CLI (preferred):**

1. Add `SUPABASE_DB_URL` (or `DATABASE_URL`) to `.env.local` from Supabase → Settings → Database → Connection string (URI, port 5432).
2. Run:

```bash
npm run db:apply -- --only 021,022,023,024
npm run db:verify
```

**Option B — SQL Editor:**

Paste and run `supabase/APPLY_PHASE14.sql` once in the Supabase SQL Editor.

Verify with: `npm run db:verify`
