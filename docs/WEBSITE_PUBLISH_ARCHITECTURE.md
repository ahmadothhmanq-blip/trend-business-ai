# Website Builder — Production Publish / Hosted URL Architecture

**Status:** Production-ready public hosting (SEO-connected)  
**Related:** D-017 (safe live preview + publish), D-004 (npm preview builder stays off), migration `039_website_publications_seo.sql`

---

## User flow

1. **Generate** website (SSE) → saved in `website_generations` + `preview/index.html`  
2. **Live preview** inside platform → static HTML preview panel  
3. **Quality report** → Design / SEO / Performance / UX scores + recommendations  
4. **Improve with AI** (optional) → new linked generation  
5. **Review quality & prepare** → `POST .../publish` `{ "action": "prepare" }`  
6. **Publish public URL** → `POST .../publish` `{ "action": "publish" }`  
7. **Open** `/w/{slug}` (public, indexable) + `/robots.txt` + `/sitemap.xml`

---

## API

| Action | Body | Result |
|--------|------|--------|
| prepare | `{ "action": "prepare" }` | `status=prepared`, SEO HTML snapshot + quality recommendations |
| publish | `{ "action": "publish" }` (default) | `status=published`, public URL live |
| unpublish | `{ "action": "unpublish" }` | `status=unpublished`, public 404 |

Public routes:
- `GET /w/[slug]` — HTML with title, meta, Open Graph, Twitter, JSON-LD (`index,follow`)
- `GET /w/[slug]/robots.txt`
- `GET /w/[slug]/sitemap.xml`

---

## SEO on publish

At prepare/publish, `resolveProductionPublishHtml` merges `blueprint.seoPackage` into the static HTML:
- `<title>`, meta description, keywords, robots, canonical  
- Open Graph + Twitter cards  
- Schema.org JSON-LD (scripts allowed; other scripts still stripped)  

Artifacts also stored on `website_publications` when migration 039 is applied:
- `seo_json`, `robots_txt`, `sitemap_xml`

---

## Enablement

- **ON** when `WEBSITE_PUBLISH_ENABLED` is unset or not `"false"`.  
- Set `NEXT_PUBLIC_SITE_URL` for absolute canonical / sitemap URLs.  
- Requires migration `031_website_publications.sql`.  
- SEO columns: `npm run db:apply -- --only 039` (graceful fallback if missing).

---

## Safety

- No npm install / Next build on the server for preview or publish.  
- Static HTML only; executable scripts stripped; JSON-LD preserved for SEO.  
- Public CSP allows `img-src data: https:` for hero assets.  
- Ownership: publications scoped by `user_id`; only `status=published` is anonymously readable.  
- npm compile builder (`WEBSITE_PREVIEW_BUILDER_ENABLED`) remains fail-closed (D-004).
