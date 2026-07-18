# Production Launch Guide

**Status:** Phase 10 — Production Launch Prep  
**Related:** D-029–D-031, `DEPLOYMENT.md`, `docs/LAUNCH_CHECKLIST.md`, `docs/FINAL_LAUNCH_CHECKLIST.md`, `docs/STAGING_SETUP.md`, `docs/BILLING_ARCHITECTURE.md`, `docs/PRODUCTION_READINESS_REPORT.md`

This guide prepares **Trend Business AI** (all Core products) for public launch without changing the AI Core Engine or product API contracts.

---

## Architecture (do not rewrite)

```
Auth (Supabase)
→ Dashboard / APIs (requireUser + ownership)
→ AI Core LayerRunner / product generators
→ Rate limit + AI credits
→ Billing (PayPal + card hosted)
```

---

## 1. Authentication & users

| Flow | Route / notes |
|------|----------------|
| Sign up | `/signup` |
| Login | `/login` |
| Password reset | `/forgot-password` → `/reset-password` |
| Callback | `/auth/callback` |
| Profile | `/dashboard/profile` |
| Ownership | Every generation / `ai_runs` row is `user_id`-scoped + RLS |

**Supabase Dashboard → Authentication**

- Site URL: `https://your-domain`
- Redirect URLs:  
  - `https://your-domain/auth/callback`  
  - `https://your-domain/reset-password`  
  - localhost variants for local QA  

---

## 2. Billing

See `docs/BILLING_ARCHITECTURE.md`.

**Minimum for paid launch**

1. Migrations through `028` (and later) applied  
2. `SUPABASE_SERVICE_ROLE_KEY` set on Vercel  
3. `PAYPAL_CLIENT_ID` / `SECRET` / `WEBHOOK_ID` / `MODE=live`  
4. `BILLING_OPTIONAL` **not** `true`  
5. Webhook URL: `https://your-domain/api/webhooks/billing/paypal`  

Free plan + credits work without PayPal; checkout stays disabled until configured.

---

## 3. Security

See `docs/SECURITY_PRODUCTION.md`.

```bash
npm run verify:launch
```

---

## 4. Domain & deployment

| Step | Action |
|------|--------|
| Domain | Point DNS to Vercel project |
| Env | Copy from `.env.example`; set production values |
| Site URL | `NEXT_PUBLIC_SITE_URL=https://your-domain` (https, no trailing slash) |
| Deploy | Vercel Git integration → Production |
| Health | `GET /api/health` |

Migrations: `npm run db:apply` (or SQL Editor) — see `DEPLOYMENT.md` for order.

---

## 5. Error monitoring preparation

- Today: structured `logger` + `captureOperationalError`  
- Optional: add Sentry (`SENTRY_DSN`) and call from `lib/monitoring/errors.ts`  
- Keep `HEALTH_DETAILED` off in public production unless needed for ops  

---

## 6. Core product smoke

```bash
npm run smoke:ai-core
npm run smoke:core-products
npm run build
```

Authenticated journey (optional, env-gated):

```bash
# Requires E2E_EMAIL / E2E_PASSWORD against a staging project
node scripts/e2e-auth-bootstrap.mjs
```

Products covered by Core smoke:

1. Website Builder  
2. App Builder  
3. Landing Page Builder  
4. Video Studio  
5. Brand Designer  
6. Content Studio  
7. Marketing AI  

---

## 7. Post-deploy checklist

Use `docs/LAUNCH_CHECKLIST.md`.
