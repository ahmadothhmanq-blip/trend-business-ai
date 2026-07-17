# Website Builder — Production Launch Checklist

**Purpose:** Prepare Website Builder for real public users.  
**Source:** `docs/WEBSITE_BUILDER_PRODUCTION_READINESS.md`  
**Related:** `docs/WEBSITE_PUBLISH_ARCHITECTURE.md`, `DEPLOYMENT.md`, `.env.example`  
**Rule:** Do not mark launch ready until every **P0** item is checked on the **target production (or staging-equivalent) environment**.

**Sign-off**

| Field | Value |
|-------|-------|
| Environment (URL) | |
| Date | |
| Operator | |
| Result | ☐ Ready to launch · ☐ Blocked (list gaps below) |

---

## 1. Environment variables

Set these in the **hosting provider** (e.g. Vercel Production), not only on a laptop.

### P0 — required

| Done | Variable | Expected value / check |
|------|----------|------------------------|
| ☐ | `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS origin, no trailing slash (e.g. `https://your-domain.com`). Required for auth redirects + absolute public URLs. |
| ☐ | `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase project URL (`https://*.supabase.co`) |
| ☐ | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Full anon/publishable key from Supabase Dashboard → Settings → API (verify length/format) |
| ☐ | `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only; never expose to client). Needed for billing/credits admin paths. |
| ☐ | `DEEPSEEK_API_KEY` | Valid production key for default AI generation (or confirmed alternate primary provider) |
| ☐ | `WEBSITE_PUBLISH_ENABLED` | Intentional: unset/`true` = public `/w/{slug}` ON; `false` = hosting OFF |
| ☐ | `WEBSITE_PREVIEW_BUILDER_ENABLED` | Must be unset or `false` (D-004 — do not enable npm compile builder) |

### P1 — strongly recommended

| Done | Variable | Expected value / check |
|------|----------|------------------------|
| ☐ | `UPSTASH_REDIS_REST_URL` | Configured for distributed rate limits |
| ☐ | `UPSTASH_REDIS_REST_TOKEN` | Paired with URL above |
| ☐ | `SUPABASE_DB_URL` / migrate access | Available to ops for `db:apply` / migration verification (not required at runtime if migrations already applied) |
| ☐ | `LOG_LEVEL` | `info` (or team standard) for production diagnostics |

### Verify after deploy

| Done | Check |
|------|--------|
| ☐ | `GET /api/health` → OK on production URL |
| ☐ | No localhost leftovers in auth redirect or published “Open public URL” links |
| ☐ | Service role **not** present in any `NEXT_PUBLIC_*` variable |

---

## 2. Authentication / email setup

Website Builder is behind authenticated dashboard routes. New users need a working signup → confirm → login path.

### P0

| Done | Check |
|------|--------|
| ☐ | Supabase Auth email confirmation enabled as intended for production |
| ☐ | Custom SMTP (or proven Supabase email delivery) configured for the production project |
| ☐ | Auth redirect allow-list includes `{NEXT_PUBLIC_SITE_URL}/auth/callback` |
| ☐ | Password reset redirect works: forgot password → email → `{SITE_URL}/auth/callback?next=/reset-password` |
| ☐ | Fresh signup receives confirmation email within a few minutes |
| ☐ | After confirm, user can sign in and open `/dashboard/website-builder` |
| ☐ | Unauthenticated `/dashboard/website-builder` redirects to login |

### P1

| Done | Check |
|------|--------|
| ☐ | Confirmation / reset emails use production branding and correct links (not `localhost`) |
| ☐ | Auth rate limits acceptable under expected signup spike |
| ☐ | Support path documented for “didn’t get confirmation email” |

---

## 3. Database migrations

### P0 — tables / RPCs Website Builder depends on

| Done | Check |
|------|--------|
| ☐ | Production DB migrations applied through **`031_website_publications`** |
| ☐ | `public.website_generations` exists |
| ☐ | `public.website_publications` exists (columns include `slug`, `status`, `preview_html`, `public_path`, …) |
| ☐ | `public.projects` exists (workspace link) |
| ☐ | `public.credit_balances` + `consume_credits` RPC available (generation uses credits) |
| ☐ | RLS policies allow owners to read/write their generations; public read of publications only via app route logic for `status=published` |

### Verify commands (ops)

| Done | Check |
|------|--------|
| ☐ | `npm run db:verify` (or equivalent) against production connection succeeds |
| ☐ | Publish against prod/staging returns 200, not `503` “table missing” |

---

## 4. AI provider production configuration

### P0

| Done | Check |
|------|--------|
| ☐ | Primary provider key valid in production (`DEEPSEEK_API_KEY` or chosen default) |
| ☐ | Test generate on production/staging completes with `event: complete` (or JSON fallback 200) |
| ☐ | Credits deduct correctly; insufficient credits returns clear `402` (not opaque 500) |
| ☐ | AI rate limit returns `429` under burst (confirm behavior with/without Upstash) |

### P1

| Done | Check |
|------|--------|
| ☐ | Fallback providers configured if product promises multi-provider resilience |
| ☐ | Cost alert / budget cap set on the AI vendor dashboard |
| ☐ | Soft timeout expectations documented (generate ~1–3 min; improve similar) |
| ☐ | `BILLING_OPTIONAL` is **not** `true` in real production |

---

## 5. Security checks

### P0

| Done | Check |
|------|--------|
| ☐ | `WEBSITE_PREVIEW_BUILDER_ENABLED` is off in production |
| ☐ | Live preview requires auth + ownership (`/api/website-builder/{id}/live-preview` → 401/404 for others) |
| ☐ | Public `/w/{slug}` serves only `status=published` rows; unpublished → 404 |
| ☐ | Published HTML has scripts stripped / CSP headers present |
| ☐ | Service role key never shipped to the browser bundle |
| ☐ | Publish can be emergency-disabled via `WEBSITE_PUBLISH_ENABLED=false` without redeploying app logic |

### P1

| Done | Check |
|------|--------|
| ☐ | Abuse plan: unpublish / takedown process for spam public URLs |
| ☐ | Upstash (or equivalent) active so rate limits are not per-instance only |
| ☐ | No secrets in git, PR logs, or client-visible env |
| ☐ | Marketing/docs do not promise unsafe “full Next.js compile on our servers” preview |

---

## 6. Final user journey testing

Run on **staging or production** with a real mailbox (not only local DB-confirmed users).

### P0 — customer journey

| Done | Step | Pass criteria |
|------|------|----------------|
| ☐ | Sign up | Account created; confirm-email path clear |
| ☐ | Confirm email | Link lands on production `/auth/callback` |
| ☐ | Login | Session established; dashboard loads |
| ☐ | Open Website Builder | `/dashboard/website-builder` usable |
| ☐ | Create website | Brief submitted; generation starts |
| ☐ | AI generation | Completes; project saved in workspace |
| ☐ | Preview | In-platform live preview shows multi-page HTML |
| ☐ | AI improvement | NL instruction creates a new linked version |
| ☐ | Publish | UI shows public URL; `status=published` |
| ☐ | Open public URL | Incognito `GET /w/{slug}` → 200 HTML |
| ☐ | Unpublish | Public URL returns 404 after unpublish |
| ☐ | ZIP export | Download succeeds for the active generation |

### P1 — regression spots

| Done | Check |
|------|--------|
| ☐ | Second improve still works (multi-iteration) |
| ☐ | Another user’s generation IDs are inaccessible (401/404) |
| ☐ | Mobile viewport of preview usable |
| ☐ | Credits block generate when balance is 0 |

---

## 7. Deployment readiness

### P0 — ship gate

| Done | Check |
|------|--------|
| ☐ | App builds cleanly (`npm run build`) on CI or host |
| ☐ | Production deploy of the Website Builder Phase 1 commit/tag |
| ☐ | Custom domain (if any) DNS + HTTPS OK; matches `NEXT_PUBLIC_SITE_URL` |
| ☐ | Supabase project is production (not a disposable dev project) |
| ☐ | Rollback plan: previous deploy + `WEBSITE_PUBLISH_ENABLED=false` if public hosting misbehaves |
| ☐ | Marketing copy matches Phase 1 (preview + NL edit + publish URL + ZIP; no custom domains / WYSIWYG claims) |

### P1 — day-0 operations

| Done | Check |
|------|--------|
| ☐ | Monitor errors on `/api/website-builder/stream`, `.../publish`, `/w/[slug]` |
| ☐ | On-call / owner known for AI outages and publish abuse |
| ☐ | Support macros: confirm email, credits, publish/unpublish |
| ☐ | Post-launch smoke scheduled within 1 hour of go-live |

---

## Launch decision

| Gate | Status |
|------|--------|
| §1 Environment variables (all P0) | ☐ |
| §2 Authentication / email (all P0) | ☐ |
| §3 Database migrations (all P0) | ☐ |
| §4 AI provider (all P0) | ☐ |
| §5 Security checks (all P0) | ☐ |
| §6 Final user journey (all P0) | ☐ |
| §7 Deployment readiness (all P0) | ☐ |

**Go / No-Go:** ☐ GO — public users allowed · ☐ NO-GO — do not announce Website Builder as live

**Blockers (if NO-GO):**

1.  
2.  
3.  

---

*Checklist only — no code changes. Keep in sync with `WEBSITE_BUILDER_PRODUCTION_READINESS.md` after each staging/prod run.*
