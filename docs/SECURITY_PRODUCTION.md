# Security — Production Review (Phase 10)

**Related:** D-029, `SECURITY_AUDIT_PHASE18.md`, migrations `023` / `026` / `028`

---

## Authentication & users

| Control | Implementation |
|---------|----------------|
| Session | Supabase SSR cookies via `lib/supabase/server.ts` + `proxy.ts` |
| Dashboard gate | Unauthenticated `/dashboard/*` → `/login` |
| API gate | `requireUser()` → **401** |
| Ownership | Queries scoped with `.eq("user_id", user.id)`; RLS on user tables |
| Helper | `lib/auth/ownership.ts` → `assertUserOwnsResource` |
| Profile | `/dashboard/profile` + `/api/profile` (authenticated) |
| Auth rate limit | `enforceAuthRateLimit` on signup/signin/reset |

### Supabase Auth (ops)

- Site URL = production domain  
- Redirect URLs include `/auth/callback` and `/reset-password`  
- Email provider enabled  

---

## AI endpoint protection

All Core product generate routes use:

1. `requireUser()`
2. `enforceAiUsage(supabase, userId, resource)` — rate limit + credit consume  
3. Zod / schema validation on bodies  

Resources include: `website-builder`, `webapp-builder`, `landing-page-builder`, `brand-identity`, `content-studio`, `video-studio`, `workspace`, `ai-core`, etc.

---

## API protection checklist

- [x] JSON body parse hardened (`parseJsonBody`)  
- [x] UUID params validated (`parseUuidParam`)  
- [x] Open redirects blocked (`safeRedirectPath`)  
- [x] Billing writes restricted to service role (migration 026)  
- [x] Preview builder hard-disabled in production  
- [x] PayPal webhook signature required when configured  
- [ ] Upstash Redis set for multi-instance rate limits (recommended)  
- [ ] `ALLOW_INSECURE_PAYPAL_WEBHOOKS` unset / false  

---

## Environment variables

See `.env.example` and `docs/PRODUCTION_LAUNCH.md`.

**Never** expose `SUPABASE_SERVICE_ROLE_KEY`, `PAYPAL_CLIENT_SECRET`, or provider API keys via `NEXT_PUBLIC_*`.

Run:

```bash
npm run verify:launch
```

---

## Error monitoring

Structured logging via `lib/logger` + `captureOperationalError` (`lib/monitoring/errors.ts`).  
Optional Sentry: set `SENTRY_DSN` and wire the SDK into `captureOperationalError` without changing API contracts.
