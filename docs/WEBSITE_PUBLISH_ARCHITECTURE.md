# Website Builder — Safe Publish / Hosted URL Architecture

**Status:** Prepared (go-live gated)  
**Related:** D-017 (safe live preview), D-004 (npm preview builder stays off), F02 / F09  

---

## Goals

1. Users view generated websites **inside the platform** (authenticated live preview).  
2. Users can **prepare** a hosted URL without executing untrusted `npm install` / `next build`.  
3. Public hosting goes live only when explicitly enabled.

---

## Delivery model (safe)

| Layer | Mechanism |
|-------|-----------|
| In-platform live preview | `GET /api/website-builder/[id]/live-preview` — sanitized static HTML from blueprint |
| Preview artifact | `preview/index.html` in generation files (multi-page CSS `:target` navigation, no scripts) |
| Publish prepare | `POST /api/website-builder/[id]/publish` → `website_publications` row (`status=prepared`) |
| Public URL | `GET /w/[slug]` — only when `WEBSITE_PUBLISH_ENABLED=true` **and** `status=published` |
| Forbidden | Enabling `WEBSITE_PREVIEW_BUILDER_ENABLED` (npm install RCE path) |

---

## Data

Migration `031_website_publications.sql`:

- `slug` (unique)  
- `generation_id` (unique)  
- `status`: prepared | published | unpublished  
- `public_path` e.g. `/w/my-site-abcd1234`  
- `planned_public_url` e.g. `https://app.example.com/w/...`  
- `preview_html` snapshot used for public serve  

---

## Go-live checklist

1. Apply migration `031`.  
2. Set `NEXT_PUBLIC_SITE_URL`.  
3. Review HTML sanitization / CSP.  
4. Set `WEBSITE_PUBLISH_ENABLED=true` only after security review.  
5. Add admin/user action to flip `prepared` → `published`.  
6. Optional: CDN / storage offload for large HTML; custom domains later (F09).  

---

## Non-goals (this phase)

- Compiling generated Next.js apps on the server  
- Arbitrary user package installs  
- Instant public publish without the gate  
