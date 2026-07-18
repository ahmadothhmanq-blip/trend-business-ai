# Billing Architecture

**Status:** Production-ready (PayPal-first)  
**Related:** D-029, migrations `025`–`028`, `lib/billing/`

---

## Plans

| Plan | Credits (seed) | Checkout |
|------|----------------|----------|
| **Free** | 50 starting credits | No payment |
| **Paid (Pro / Business)** | Subscription grant per plan seed | PayPal Checkout |
| **Credit packs** | One-time top-ups | PayPal Checkout |

Plan rows live in `subscription_plans` (see `025_billing_system.sql`). Free users always get a `credit_balances` row via `ensureCreditBalance`.

---

## Payment providers

| Provider ID | Role |
|-------------|------|
| `paypal` | Primary wallet / PayPal account checkout |
| `card` | Visa / Mastercard / Amex via **PayPal hosted card / guest** flow |

Architecture is adapter-based (`BillingProviderAdapter` in `lib/billing/adapters/`). Stripe is **not** required for launch; a future Stripe adapter can implement the same interface without changing product APIs.

Env:

```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_MODE=sandbox|live
SUPABASE_SERVICE_ROLE_KEY=   # required for credit grants / webhooks
BILLING_OPTIONAL=false       # never true in production
```

---

## AI credits & usage limits

1. **Rate limits** — `enforceAiUsage` in `lib/api/rate-limit.ts` (Upstash when configured; memory fallback otherwise).
2. **Credits** — same helper calls `consumeCreditsForUsage` after/at generation gates.
3. **Zero balance** — AI endpoints return **402** when credits are exhausted (production fail-closed when billing tables + service role are present).

Dashboard home shows **live** balances from `BillingManager.getStatus` (Phase 10).

---

## API surface (unchanged contracts)

| Method | Path |
|--------|------|
| `GET` | `/api/platform/billing` |
| `POST` | `/api/platform/billing/checkout` |
| `POST` | `/api/platform/billing/complete` |
| `POST` | `/api/platform/billing/cancel` |
| `GET` | `/api/platform/billing/credits` |
| `GET` | `/api/platform/billing/invoices` |
| `POST` | `/api/webhooks/billing/[provider]` |

Product generate APIs stay as-is; they continue to call `enforceAiUsage`.
