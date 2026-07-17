# Website Builder — Phase 1 Implementation Report

**Date:** 2026-07-17  
**Branch:** `cursor/docs-ssot-audit-plan`  
**Scope:** AI Website Builder only (production-tool UX)

---

## Completed

1. **Safe visual product preview**  
   - Builds `preview/index.html` from blueprint (pages, sections, content, colors).  
   - Multi-page navigation via CSS `:target` (no scripts).

2. **In-platform live preview (D-017)**  
   - `GET /api/website-builder/[id]/live-preview`  
   - Side panel + Live preview tab + fullscreen viewer (desktop/tablet/mobile).  
   - npm compile builder remains off (D-004 / H08).

3. **Publish architecture prepared**  
   - Migration `031_website_publications.sql`  
   - `POST /api/website-builder/[id]/publish` prepares hosted path `/w/{slug}`  
   - Public `GET /w/[slug]` gated by `WEBSITE_PUBLISH_ENABLED` + `published` status  
   - See `WEBSITE_PUBLISH_ARCHITECTURE.md`

4. **Workspace version save**  
   - Generations link to a `projects` row (`product_id: website-builder`).  
   - `parent_generation_id` + appended `prompt_versions` on regenerate/continue.

5. **Natural-language Improve with AI**  
   - Edit mode + linked versions (D-016).

---

## Remaining gaps (Phase 1 unfinished)

| Gap | Notes |
|-----|--------|
| Public go-live | Needs migration apply + `WEBSITE_PUBLISH_ENABLED` + prepared→published action |
| Compiled Next.js runtime preview | Intentionally not shipped (unsafe); static sandbox is the product preview |
| WYSIWYG visual editor | NL edit only today |
| Richer media assets | MVP file-cap pipeline |
| Soft-pass quality | Imperfect trees can still save |
| Custom domains | Future F09 |

---

## User flow now

1. Describe website idea → **Create Website**  
2. AI generates MVP site (pages/design/content/structure + source files)  
3. **Live preview** inside the platform (navigate pages)  
4. **Improve with AI** → natural-language changes → new linked version  
5. **Prepare hosted URL** (architecture) / **Download ZIP** for export  
