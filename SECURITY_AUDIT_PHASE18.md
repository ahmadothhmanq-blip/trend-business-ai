# Phase 18 — Enterprise Security Audit Report

**Date:** 2026-07-16  
**Scope:** Full application security audit and production hardening  
**Constraint:** No feature rebuilds; business logic changed only where required for security

---

## Executive summary

Critical billing and template privilege-escalation paths were closed with RLS lockdown and service-role write paths. Auth error leakage, upload MIME spoofing, webhook race/idempotency, logging, and security headers were hardened. `npm audit` reported **0** known vulnerabilities at audit time.

**Operator action required:** apply `supabase/migrations/026_security_hardening.sql` (or `supabase/APPLY_PHASE18.sql`) and ensure `SUPABASE_SERVICE_ROLE_KEY` + `PAYPAL_WEBHOOK_ID` are set in production.

---

## 1. Issues found

### Critical

| ID | Issue | Risk |
|----|--------|------|
| C1 | Billing RLS allowed users to upsert credits / insert subscriptions / invoices / checkout rows via anon client | Self-grant credits / fake paid state |
| C2 | `agents` / `prompt_library` `FOR ALL` policies allowed mutating `is_template` / `is_public` rows | Cross-user template/prompt tampering |
| C3 | Website preview builder can run `npm install` on user `package.json` when enabled | Remote code execution if enabled in prod |

### High

| ID | Issue | Risk |
|----|--------|------|
| H1 | Soft-open when billing tables missing / credits fail | Free AI usage in production |
| H2 | Webhook double-fulfill race on concurrent events | Duplicate credit grants |
| H3 | Upload trusted client `Content-Type` | MIME spoofing |
| H4 | Auth errors returned raw Supabase messages | Account enumeration / info leak |
| H5 | Weak password minimum (6) | Brute-force / weak credentials |
| H6 | Org admin could escalate member to `owner` | Privilege escalation |
| H7 | AI provider API keys returned in plaintext on GET | Key exposure via XSS / logs |
| H8 | Health endpoint exposed internal dependency detail | Reconnaissance |
| H9 | PayPal webhook verification optional / raw bodies logged | Forged webhooks / secret leakage |
| H10 | Missing HSTS on security header set | Downgrade / MITM risk on HTTPS |

### Medium / Low

| ID | Issue | Risk |
|----|--------|------|
| M1 | Legacy AI prompts unsanitized | Prompt injection |
| M2 | Agents GET without explicit ownership filter | Defense-in-depth gap if RLS misapplied |
| M3 | Auth / webhook ingress lacked dedicated rate limits | Abuse / DoS |
| M4 | CSP allows `'unsafe-inline'` / `'unsafe-eval'` | XSS amplification (Next.js tradeoff) |
| M5 | Credits deducted before AI success | Fairness (not abuse of free usage) |
| M6 | In-memory rate limits are per-instance without Upstash | Weaker under multi-instance deploy |

---

## 2. Issues fixed

| ID | Fix |
|----|-----|
| C1 | Migration `026`: billing tables SELECT-only for users; writes via service role + `consume_credits` RPC |
| C2 | Split SELECT / INSERT / UPDATE / DELETE policies; templates & public prompts read-only |
| C3 | Documented: keep `WEBSITE_PREVIEW_BUILDER_ENABLED=false` in production (default) |
| H1 | Production fail-closed for credits unless `BILLING_OPTIONAL=true`; `enforceAiUsage` returns 402/503 on any credit failure |
| H2 | Atomic checkout claim (`UPDATE … WHERE status='pending'`); webhook retries unprocessed duplicates; CAPTURE/ORDER COMPLETED only |
| H3 | Magic-byte MIME sniff, filename sanitization, mutation rate limit on uploads |
| H4 | Generic sign-in / sign-up / password-reset responses; no email enumeration on reset |
| H5 | Password minimum raised to **8** characters |
| H6 | Org member update `WITH CHECK` blocks non-owner granting `owner` |
| H7 | GET `/api/ai-settings` masks API keys; PUT preserves stored keys when masked placeholder is sent |
| H8 | `/api/health` returns `{ status: "ok" }` unless `HEALTH_DETAILED=true` |
| H9 | PayPal webhook ID required (insecure only with `ALLOW_INSECURE_PAYPAL_WEBHOOKS` in non-prod); cert URL host allowlist; no raw body logging |
| H10 | `Strict-Transport-Security` added in `lib/supabase/proxy.ts` and `next.config.ts` |
| M1 | `sanitizePromptInput` applied to legacy ideas/reports/market prompts |
| M2 | Agents GET filters `user_id` or `is_template` |
| M3 | Auth rate limit (10/min/email); webhook rate limit (120/min/provider); existing AI/billing/mutation limits retained |
| — | Logger redacts sensitive keys; truncates long strings; no stacks in production |
| — | Billing mutation routes use admin write client |

### New / updated artifacts

- `supabase/migrations/026_security_hardening.sql`
- `supabase/APPLY_PHASE18.sql`
- `SECURITY_AUDIT_PHASE18.md` (this report)
- `.env.example` security notes (`BILLING_OPTIONAL`, `HEALTH_DETAILED`, webhook flags)

---

## 3. Remaining recommendations

1. **Apply migration 026** on every environment before relying on billing lockdown.
2. **Configure Upstash Redis** in production for global auth/AI/webhook rate limits (memory fallback is per-instance).
3. **Tighten CSP** when moving off `'unsafe-inline'`/`'unsafe-eval'` (nonce-based scripts).
4. **Encrypt AI keys at rest** (KMS / vault) instead of storing in `ai_provider_settings.providers` JSON.
5. **Refund / reserve credits** so failed AI calls do not permanently consume balance (product fairness).
6. **Keep preview builder disabled**; if ever enabled, run in isolated sandbox with no host secrets.
7. **SSRF hardening** for user-configured outbound webhooks (URL allowlist / private IP block).
8. **Centralized audit log sink** (SIEM) for billing fulfillments, auth anomalies, and admin actions.
9. **Periodic `npm audit` / Dependabot** in CI; pin critical transitive deps.
10. **Penetration test** before major public launch (authz matrix + billing abuse cases).

---

## 4. Verification checklist

| Check | Expected |
|-------|----------|
| `npm audit` | 0 vulnerabilities |
| `npm run type-check` | 0 errors |
| `npx eslint . --quiet` | 0 errors |
| `npm run build` | Success |
| Migration 026 applied | Operator |
| `SUPABASE_SERVICE_ROLE_KEY` set | Production required |
| `PAYPAL_WEBHOOK_ID` set | Production required |
| `WEBSITE_PREVIEW_BUILDER_ENABLED` | `false` / unset |

---

## 5. Area coverage notes

| Area | Status |
|------|--------|
| Authentication | Session via Supabase cookies; generic errors; password ≥8; rate-limited auth; signOut clears session |
| Authorization | Route `requireUser`; org role checks; RLS owner/admin/user separation hardened |
| API security | Zod validation on inputs; sanitized errors via helpers; status codes reviewed on critical paths |
| Database / RLS | Billing write lockdown; template policies; usage insert check; org escalation check |
| Secrets | No service role in `NEXT_PUBLIC_*`; keys masked on AI settings GET |
| Rate limiting | AI, mutations, billing, auth, webhooks, uploads |
| Uploads | Magic bytes, size limits, sanitized names |
| Billing | PayPal verify + idempotent fulfill + service-role writes |
| AI | Prompt sanitize; usage enforcement; failover unchanged |
| Headers | CSP, HSTS, XFO, XCTO, Referrer, Permissions-Policy |
| Dependencies | `npm audit` clean at time of audit |
| Logging | Redaction + production-safe formatting |
