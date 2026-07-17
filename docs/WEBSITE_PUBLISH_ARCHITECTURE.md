# Website Builder — Safe Publish / Hosted URL Architecture

**Status:** Implemented (public go-live enabled by default)  
**Related:** D-017 (safe live preview + publish), D-004 (npm preview builder stays off)

---

## User flow

1. **Generate** website (SSE) → saved in `website_generations` + `preview/index.html`  
2. **Live preview** inside platform → `GET /api/website-builder/[id]/live-preview`  
3. **Improve with AI** → new linked generation  
4. **Publish public URL** → `POST /api/website-builder/[id]/publish` `{ "action": "publish" }`  
5. **Open** `/w/{slug}` (public, no auth)

---

## API

| Action | Body | Result |
|--------|------|--------|
| prepare | `{ "action": "prepare" }` | `status=prepared`, snapshot HTML |
| publish | `{ "action": "publish" }` (default) | `status=published`, public URL live |
| unpublish | `{ "action": "unpublish" }` | `status=unpublished`, public 404 |

Public route: `GET /w/[slug]` serves sanitized HTML when `status=published` and publishing is enabled.

---

## Enablement

- **ON** when `WEBSITE_PUBLISH_ENABLED` is unset or not `"false"`.  
- **OFF** only when `WEBSITE_PUBLISH_ENABLED=false`.  
- Requires migration `031_website_publications.sql` (`npm run db:apply -- --only 031`).

---

## Safety

- No npm install / Next build on the server for preview or publish.  
- Static HTML only, script-stripped, CSP on responses.  
- npm compile builder (`WEBSITE_PREVIEW_BUILDER_ENABLED`) remains fail-closed (D-004).
