# Launch Checklist (Platform)

**Phase 10** — Tick every item before announcing public launch.

---

## A. Environment

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://…` (no trailing slash)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-only)
- [ ] `DEEPSEEK_API_KEY` (or other AI provider) set
- [ ] `BILLING_OPTIONAL` unset or `false`
- [ ] `ALLOW_INSECURE_PAYPAL_WEBHOOKS` unset or `false`
- [ ] `WEBSITE_PREVIEW_BUILDER_ENABLED` = `false`
- [ ] Upstash Redis set for multi-instance rate limits (recommended)
- [ ] `npm run verify:launch` reports **ready** (0 fail)

---

## B. Database

- [ ] Migrations applied through latest (`npm run db:apply` / `db:verify`)
- [ ] Billing tables present (`025`–`028`)
- [ ] `ai_runs` present (`033`)
- [ ] RLS policies enabled on user + billing tables

---

## C. Auth

- [ ] Supabase Site URL + redirect URLs configured
- [ ] Signup → email confirm (if enabled) → dashboard works
- [ ] Login / logout works
- [ ] Password reset works
- [ ] Profile save works (`/dashboard/profile`)
- [ ] Unauthenticated `/dashboard` redirects to login
- [ ] Unauthenticated AI POST returns **401**

---

## D. Billing

- [ ] Free plan credits appear on dashboard (live balance)
- [ ] PayPal sandbox: subscription checkout → complete / webhook
- [ ] Card (Visa) via PayPal hosted flow smoke-tested in sandbox
- [ ] Credit pack purchase grants ledger entry
- [ ] Zero-credit AI call returns **402** in production mode
- [ ] Cancel subscription path works
- [ ] Live PayPal credentials swapped only after sandbox pass

---

## E. Core products (manual or e2e)

For each: open dashboard tool → one-prompt / generate → result visible.

- [ ] Website Builder  
- [ ] App Builder  
- [ ] Landing Page Builder  
- [ ] Video Studio  
- [ ] Brand Designer (Brand Studio)  
- [ ] Content Studio  
- [ ] Marketing AI  

Also:

- [ ] `npm run smoke:core-products` passes  
- [ ] `npm run build` passes  

---

## F. Domain & ops

- [ ] Custom domain attached on Vercel
- [ ] HTTPS certificate valid
- [ ] `/api/health` returns ok
- [ ] Sitemaps / robots reachable
- [ ] Error logging reviewed (Sentry optional)
- [ ] Support / contact path documented for users

---

## G. Go / no-go

- [ ] No P0 security findings open
- [ ] AI Core Engine + product APIs unchanged this release
- [ ] Launch announcement copy matches **finished product** delivery (preview / export / publish honesty)

**Sign-off:** __________________  **Date:** __________
