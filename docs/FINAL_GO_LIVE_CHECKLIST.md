# Final Go-Live Checklist

**Phase 13** — Complete every item before flipping production traffic / public announcement.  
**Related:** `docs/PRODUCTION_LAUNCH_REPORT.md`, `docs/LAUNCH_BLOCKERS.md`, `docs/FINAL_LAUNCH_CHECKLIST.md`

---

## A. Production environment

- [ ] `NEXT_PUBLIC_SITE_URL=https://your-domain` (no trailing slash)  
- [ ] Supabase URL + anon + **service role** on Vercel Production  
- [ ] `DEEPSEEK_API_KEY` (or OpenAI) set  
- [ ] `BILLING_OPTIONAL` not `true`  
- [ ] `WEBSITE_PREVIEW_BUILDER_ENABLED=false`  
- [ ] `ALLOW_INSECURE_PAYPAL_WEBHOOKS` not `true`  
- [ ] Upstash Redis set (recommended)  
- [ ] `npm run verify:golive -- --production` → **0 fail**  
- [ ] `npm run build` green on release commit  

---

## B. Database & storage

- [ ] Migrations applied through **033** (`npm run db:apply` / SQL Editor)  
- [ ] Tables: profiles, Core generation tables, `subscription_plans`, `ai_runs`  
- [ ] Buckets: `avatars`, `generation-uploads`, `website-assets`, `ai-assets`  
- [ ] RLS policies active (anon cannot read user generations)  

---

## C. Domain & deployment

- [ ] DNS points to Vercel (or host)  
- [ ] HTTPS / SSL valid on apex + www (if used)  
- [ ] Production deploy from release commit  
- [ ] `PRODUCTION_BASE_URL=https://…`  
  - [ ] `npm run verify:golive -- --production` with HTTP probes  
  - [ ] `npm run smoke:uat`  
- [ ] Routes: `/`, `/signup`, `/login`, `/pricing`, `/api/health`, product pages  
- [ ] Core APIs return 401/403 without session  
- [ ] Supabase Auth redirects: `/auth/callback`, `/reset-password`  
- [ ] Error monitoring: host logs reviewed; Sentry DSN optional  

---

## D. Billing activation

### Free plan
- [ ] New user receives starting credits  
- [ ] Dashboard shows live balance  
- [ ] Generate consumes credit  
- [ ] Zero credits → **402**  

### Paid (if monetizing day-one)
- [ ] `PAYPAL_MODE=live`  
- [ ] `PAYPAL_CLIENT_ID` / `SECRET` / `WEBHOOK_ID`  
- [ ] Webhook: `https://your-domain/api/webhooks/billing/paypal`  
- [ ] `npm run verify:golive -- --production --paid` → **0 fail**  
- [ ] Sandbox UAT passed before live cutover  
- [ ] PayPal wallet checkout  
- [ ] Visa/card via PayPal hosted  
- [ ] Subscription credits granted after payment  
- [ ] Invoice / billing history visible  

### Usage limits
- [ ] Rate limit returns **429** under burst (Upstash preferred)  

---

## E. Final UAT (each product once)

Journey: Register → Service → Idea → Generate → Quality → Preview → Save → Export/Publish

| Product | Pass |
|---------|------|
| Website Builder (incl. publish if enabled) | ☐ |
| App Builder | ☐ |
| Landing Page Builder | ☐ |
| Video Studio (package ≠ MP4) | ☐ |
| Brand Designer | ☐ |
| Content Studio | ☐ |
| Marketing AI | ☐ |

Honesty check:
- [ ] Marketing copy matches `docs/KNOWN_ISSUES.md`  

---

## F. Go / no-go

- [ ] `docs/LAUNCH_BLOCKERS.md` CRITICAL cleared  
- [ ] `docs/PRODUCTION_LAUNCH_REPORT.md` signed  
- [ ] Support / contact path live  
- [ ] Rollback plan known (previous Vercel deployment)  

**Decision:** ☐ GO   ☐ NO-GO  

**Engineering:** ____________  **Product:** ____________  **Ops:** ____________  
**Date/time (UTC):** __________
