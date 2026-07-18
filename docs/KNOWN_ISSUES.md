# Known Issues Report

**Phase 11 — Final audit**  
**Date:** 2026-07-18  
**Related:** `docs/PHASE_11_FINAL_AUDIT.md`, D-030

Issues below are **documented for launch honesty**. CRITICAL code path for stream double-charge was fixed in Phase 11.

---

## Open — HIGH (post-launch backlog)

| ID | Issue | Impact | Mitigation |
|----|-------|--------|------------|
| H1 | Credits deducted before AI success; no automatic refund on failure (D-014) | Users may lose 1 credit on rare failed generations | Monitor support; schedule refund policy |
| H3 | Upstash unset → per-instance memory rate limits | Weaker multi-instance throttling | Set `UPSTASH_REDIS_*` before scale |
| H4 | Delivery honesty gaps if marketing overclaims | Trust | Use copy below |

---

## Known limitations (by design)

| ID | Limitation | Products |
|----|------------|----------|
| K1 | **Video Studio** delivers storyboard/script/production package — **not** a rendered MP4 | Video Studio |
| K2 | **Website publish** (`/w/[slug]`) is static HTML host; **ZIP** is full Next.js source | Website Builder |
| K3 | SEO + Performance Core layers run on Website / App / Landing only | Brand, Content, Video, Marketing |
| K4 | PayPal checkout disabled until `PAYPAL_*` env set; Free plan + credits still work | Billing |
| K5 | Preview builder (`WEBSITE_PREVIEW_BUILDER_ENABLED`) must stay **false** in production | Website Builder |
| K6 | Optional Sentry not wired; structured logger only | Ops |

---

## Resolved in Phase 11

| ID | Issue | Resolution |
|----|-------|------------|
| H2 | Stream → JSON fallback could double-charge Website Builder credits | Fallback only on 404/405 |

---

## Launch copy guidance

- Website: “Preview, improve with AI, publish a public URL, and download Next.js ZIP.”  
- Video: “AI video **concepts** / storyboards / scripts” — not “download finished MP4.”  
- Brand / Content / Marketing: finished kits and campaigns, not hosted sites.
