# Staging Setup Guide

**Phase 12**  
**Related:** D-031, `docs/STAGING_TEST_REPORT.md`, `docs/LAUNCH_BLOCKERS.md`, `.env.staging.example`

Prepare a staging (or Vercel Preview) environment that mirrors production closely enough to validate the real user journey before public launch.

---

## Architecture (unchanged)

```
Auth (Supabase)
→ Dashboard / APIs
→ AI Core LayerRunner
→ Credits + rate limits
→ Billing (PayPal sandbox)
```

Do **not** change AI Core or product API contracts for staging.

---

## 1. Create the staging stack

| Piece | Recommendation |
|-------|----------------|
| Host | Vercel **Preview** deployment on a staging branch, or a dedicated Vercel project |
| Supabase | Separate staging project (preferred) or isolated staging schema |
| Site URL | `https://staging.your-domain` or `https://….vercel.app` |
| PayPal | **sandbox** only (`PAYPAL_MODE=sandbox`) |
| Preview builder | `WEBSITE_PREVIEW_BUILDER_ENABLED=false` |

---

## 2. Environment variables

1. Copy `.env.staging.example` → `.env.staging` (local) or Vercel Preview env.  
2. Required for real UX:

| Variable | Staging requirement |
|----------|---------------------|
| `NEXT_PUBLIC_SITE_URL` | Staging HTTPS URL (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | Staging Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for credits/billing/bucket verify |
| `DEEPSEEK_API_KEY` | Required for generation |
| `PAYPAL_*` | Sandbox for checkout QA |
| `UPSTASH_REDIS_*` | Recommended before multi-instance |
| `WEBSITE_PREVIEW_BUILDER_ENABLED` | `false` |

3. Supabase Auth → Redirect URLs must include:

- `{SITE_URL}/auth/callback`
- `{SITE_URL}/reset-password`

---

## 3. Database

```bash
# Apply migrations to the staging Supabase project
npm run db:apply
# Optional platform table probe
npm run db:verify
```

Confirm Core tables exist (`profiles`, generation tables, `ai_runs`, billing tables through latest migration).

---

## 4. Storage buckets

Staging must include:

| Bucket | Migration |
|--------|-----------|
| `avatars` | `007` |
| `generation-uploads` | `011` |
| `website-assets` | `032` |
| `ai-assets` | `033` |

Verified by `npm run verify:staging` when `SUPABASE_SERVICE_ROLE_KEY` is set.

---

## 5. AI providers

- Prefer `DEEPSEEK_API_KEY` (default path).  
- `verify:staging` probes `https://api.deepseek.com/models` when the key is present.  
- Optional extras (`OPENAI_API_KEY`, etc.) are not required for Core products.

---

## 6. Verify staging

```bash
# Env + DB + buckets + AI (local .env.staging / .env.local)
npm run verify:staging

# Fail closed for deploy sign-off
npm run verify:staging -- --strict

# After deploy
set STAGING_BASE_URL=https://your-staging-host
npm run verify:staging -- --strict
npm run smoke:staging
npm run smoke:core-products
```

Windows PowerShell:

```powershell
$env:STAGING_BASE_URL="https://your-staging-host"
npm run verify:staging -- --strict
npm run smoke:staging
```

---

## 7. Manual UX sign-off

Complete the journey matrix in `docs/STAGING_TEST_REPORT.md`, then update `docs/LAUNCH_BLOCKERS.md`.

Pipeline to observe in the UI:

**Idea → Strategy → Design → Assets → Generation → Quality → SEO → Performance → Ready**

(SEO/Performance layers apply to Website / App / Landing; other products stop after Quality.)
