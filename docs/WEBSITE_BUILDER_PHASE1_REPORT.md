# Website Builder — Phase 1 Implementation Report

**Date:** 2026-07-17  
**Branch:** `cursor/docs-ssot-audit-plan`  
**Scope:** AI Website Builder only (production-tool UX)

---

## Completed

1. **Safe visual product preview**  
   - Builds `preview/index.html` from blueprint (pages, sections, content, colors).  
   - Shown in iframe (`srcdoc`, no scripts) in the right panel and main Preview tab.  
   - Does **not** enable unsafe npm compile Live Preview (D-004 / H08 still hold).

2. **Workspace version save**  
   - Generations link to a `projects` row (`product_id: website-builder`).  
   - `parent_generation_id` + appended `prompt_versions` on regenerate/continue.  
   - History shows mode badges and “linked version”.

3. **Natural-language Improve with AI**  
   - Dedicated edit mode: clear brief → describe changes → Improve.  
   - Requires an explicit NL instruction (no silent auto-prefix).  
   - Creates a new saved version linked to the previous generation.

4. **Product framing**  
   - Registry copy updated toward complete website product + preview + AI edits + ZIP export.

---

## Remaining gaps (Phase 1 unfinished)

| Gap | Notes |
|-----|--------|
| True compiled Live Preview | Still gated (F01 / D-004) — needs sandboxed design |
| One-click publish / hosted URL | Future (F02 / F09) |
| WYSIWYG visual editor | NL edit only today |
| Richer media assets | Pipeline still MVP file-capped; images mostly structural/content |
| Soft-pass quality | Imperfect trees can still save under file cap |
| Full workspace hub UI | Website versions use `projects` + `website_generations`, not a unified `/dashboard/workspace` shell |

---

## User flow now

1. Describe website idea → **Create Website**  
2. AI generates MVP site (pages/design/content/structure + source files)  
3. **Preview** tab / side panel shows visual marketing preview  
4. **Improve with AI** → natural-language changes → new linked version  
5. **Download ZIP** for local run / self-host export  
