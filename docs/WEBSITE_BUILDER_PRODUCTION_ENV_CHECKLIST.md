# Website Builder — Production Environment Variables Checklist

**Purpose:** Ops-only checklist to set host env vars before public launch.  
**Source:** `docs/WEBSITE_BUILDER_DEPLOYMENT_READY.md` §1 / §5A  
**Verify after setting:** `npm run verify:wb-launch -- --production` (with host env loaded)  
**Do not commit real secrets.**

| Field | Value |
|-------|-------|
| Host (e.g. Vercel Production) | |
| Production domain | `https://` |
| Supabase project ref | |
| Operator | |
| Date | |

---

## How to fill this

1. Create/confirm the **production** Supabase project (same project for URL, anon, and service_role).  
2. Decide the **canonical HTTPS** app URL (no trailing slash).  
3. Paste values into the host’s **Production** environment (not Preview-only unless intentional).  
4. Redeploy so `NEXT_PUBLIC_*` values are baked into the client bundle.  
5. Run verify + health check on the production URL.

---

## P0 — required (Website Builder will not launch safely without these)

| ☐ | Variable | Where to get it | Exact production rule | Set? |
|---|----------|-----------------|----------------------|------|
| ☐ | `NEXT_PUBLIC_SITE_URL` | Your production domain | `https://YOUR_DOMAIN` only — **no** `http://`, **no** localhost, **no** trailing `/` | ☐ |
| ☐ | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | `https://<ref>.supabase.co` | ☐ |
| ☐ | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` / `publishable` | Full key (legacy JWT `eyJ…` usually 100+ chars, or `sb_publishable_…`). Do not truncate. | ☐ |
| ☐ | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` | Server-only. **Never** name it `NEXT_PUBLIC_*`. | ☐ |
| ☐ | `DEEPSEEK_API_KEY` | DeepSeek platform API keys | Valid key for default WB generate/improve | ☐ |

### P0 — flags (set intentionally)

| ☐ | Variable | Production value | Notes |
|---|----------|------------------|-------|
| ☐ | `WEBSITE_PREVIEW_BUILDER_ENABLED` | `false` or **omit** | Must stay off (D-004). Do **not** set `true`. |
| ☐ | `WEBSITE_PUBLISH_ENABLED` | omit / `true` for public `/w/{slug}`; `false` = kill-switch | Default is ON when unset. |
| ☐ | `BILLING_OPTIONAL` | omit or `false` | Must **not** be `true` in real production. |

---

## P1 — strongly recommended before public traffic

| ☐ | Variable | Where to get it | Production value |
|---|----------|-----------------|------------------|
| ☐ | `UPSTASH_REDIS_REST_URL` | Upstash console | REST URL |
| ☐ | `UPSTASH_REDIS_REST_TOKEN` | Upstash console | REST token |
| ☐ | `SUPABASE_DB_URL` | Supabase → Database → Connection string (session/direct) | For ops migrate/verify only (not required at runtime if migrations already applied) |
| ☐ | `LOG_LEVEL` | — | `info` |

---

## Optional (not required for default Website Builder path)

| ☐ | Variable | When needed |
|---|----------|-------------|
| ☐ | `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / … | Only if multi-provider fallback is required |
| ☐ | `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_WEBHOOK_ID` / `PAYPAL_MODE` | Paid credits / checkout go-live |

---

## Host paste template (replace placeholders)

```bash
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_FULL_ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_KEY
WEBSITE_PREVIEW_BUILDER_ENABLED=false
# WEBSITE_PUBLISH_ENABLED=true
# BILLING_OPTIONAL=false
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
LOG_LEVEL=info
```

---

## Post-set verification (same session)

| ☐ | Check | Pass criteria |
|---|--------|---------------|
| ☐ | All P0 rows above checked | No blanks / no placeholders |
| ☐ | `NEXT_PUBLIC_SITE_URL` uses HTTPS and matches the live domain | Exact origin match |
| ☐ | Service role not exposed as `NEXT_PUBLIC_*` | Host env inspection |
| ☐ | Redeploy completed after setting `NEXT_PUBLIC_*` | New deployment |
| ☐ | `GET https://YOUR_DOMAIN/api/health` | `{"status":"ok"}` |
| ☐ | `npm run verify:wb-launch -- --production` with host env | **0 FAIL** |
| ☐ | Published URL planner uses production origin (not localhost) | After one publish test |

---

## Common failures

| Symptom | Likely cause |
|---------|----------------|
| Confirm-email link opens localhost | `NEXT_PUBLIC_SITE_URL` still local or wrong |
| `verify:wb-launch --production` fails SITE_URL | Missing `https://` or using localhost |
| Generate/credits 503 in production | Missing `SUPABASE_SERVICE_ROLE_KEY` |
| Auth / API 401 after deploy | Wrong anon key or truncated key |
| Public hosting unexpectedly off | `WEBSITE_PUBLISH_ENABLED=false` |
| Rate limits flaky across instances | Upstash P1 vars missing |

---

## Sign-off

| Gate | Status |
|------|--------|
| All P0 variables set on production host | ☐ |
| Flags intentional | ☐ |
| Post-set verification PASS | ☐ |

**Env gate:** ☐ READY · ☐ BLOCKED  

**Blockers:**

1.  
2.  

---

*Ops checklist only — no product code changes. Next after this: Supabase Auth redirect allow-list + mailbox confirm proof (`WEBSITE_BUILDER_DEPLOYMENT_READY.md` §2 / §5B).*
