# Deployment checklist

> **Phase 10 platform launch:** see [`docs/PRODUCTION_LAUNCH.md`](docs/PRODUCTION_LAUNCH.md) and [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).  
> Billing: [`docs/BILLING_ARCHITECTURE.md`](docs/BILLING_ARCHITECTURE.md) · Security: [`docs/SECURITY_PRODUCTION.md`](docs/SECURITY_PRODUCTION.md)  
> Quick verify: `npm run verify:launch` · Product smoke: `npm run smoke:core-products`

## Supabase

### 1. Run migrations (in order)

| # | File |
|---|------|
| 1 | `supabase/migrations/001_profiles.sql` |
| 2 | `supabase/migrations/002_business_ideas.sql` |
| 3 | `supabase/migrations/003_market_analyses.sql` |
| 4 | `supabase/migrations/004_reports.sql` |
| 5 | `supabase/migrations/005_favorites.sql` |
| 6 | `supabase/migrations/006_user_preferences.sql` |
| 7 | `supabase/migrations/007_storage_avatars.sql` |
| 8 | `supabase/migrations/008_website_generations.sql` |
| 9 | `supabase/migrations/009_website_favorites.sql` |

Or paste `supabase/schema.sql` into the SQL Editor on a fresh project.

Existing projects must still run every later migration in order. For the current
MVP runtime, `006_user_preferences.sql`, `007_storage_avatars.sql`, and
`009_website_favorites.sql` are required for Profile, avatar upload, Website
Builder favorites, and the Favorites dashboard page.

### Phase 14 — Organizations / Team (021–024)

```bash
# Add SUPABASE_DB_URL to .env.local (Database → Connection string URI, port 5432)
npm run db:apply -- --only 021,022,023,024
npm run db:verify
```

Or paste `supabase/APPLY_PHASE14.sql` into the Supabase SQL Editor once.

### Phase 16 — Billing (025)

```bash
npm run db:apply -- --only 025
```

Or paste `supabase/APPLY_PHASE16.sql` into the SQL Editor.

### Phase 18 — Security hardening (026) — required for production

```bash
npm run db:apply -- --only 026
```

Or paste `supabase/APPLY_PHASE18.sql` into the SQL Editor once.

This locks billing writes to the service role, hardens agent/prompt template policies, and blocks org owner escalation. See `SECURITY_AUDIT_PHASE18.md`.

### Phase 19 — Performance indexes (027)

```bash
npm run db:apply -- --only 027
```

Or paste `supabase/APPLY_PHASE19.sql` into the SQL Editor. Adds composite indexes for list/filter hot paths and billing webhook lookups. See `PERFORMANCE_REPORT_PHASE19.md`.

### Phase 20 — Production QA fixes (028)

```bash
npm run db:apply -- --only 028
```

Or paste `supabase/APPLY_PHASE20.sql` into the SQL Editor. Fixes org RLS recursion, checkout `processing` status, and hardened `consume_credits`. See `QA_REPORT_PHASE20.md`.

### 2. Auth settings (Supabase Dashboard → Authentication)

- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs** (add all):
  - `https://your-domain.vercel.app/auth/callback`
  - `https://your-domain.vercel.app/reset-password`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/reset-password`
- Enable **Email** provider
- Configure email templates for confirm / reset password if using custom SMTP

### 3. Verify database

```bash
npm run verify
```

Expect all tables, RLS checks, and `avatars` bucket to pass.

### 4. RLS summary

| Table | Policies |
|-------|----------|
| `profiles` | select, insert, update (own row) |
| `business_ideas` | select, insert, update, delete (own rows) |
| `market_analyses` | select, insert, update, delete (own rows) |
| `reports` | select, insert, update, delete (own rows) |
| `favorites` | select, insert, delete (own rows) |
| `user_preferences` | select, insert, update (own row) |
| `storage.objects` (avatars) | public read; insert/update/delete own folder |

---

## Vercel

### 1. Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon / publishable key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL, e.g. `https://your-app.vercel.app` |
| `DEEPSEEK_API_KEY` | Yes | Default AI provider for all text/code generation |
| `OPENAI_API_KEY` | Optional | Text fallback + DALL·E (AI Real Images) |
| `IMAGE_PROVIDER` | Optional | Preferred image engine: `openai` \| `replicate` \| `stability` |
| `REPLICATE_API_TOKEN` | Optional | Flux images via Replicate |
| `STABILITY_API_KEY` | Optional | Stability AI images |
| `UPSTASH_REDIS_REST_URL` | Recommended | Global per-user AI rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Global per-user AI rate limiting |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional | Google Search Console HTML tag verification |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Optional | Bing Webmaster Tools `msvalidate.01` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | GA4 measurement ID (`G-XXXXXXXX`) |
| `NEXT_PUBLIC_GTM_ID` | Optional | Google Tag Manager container (`GTM-XXXX`) |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Optional | Billing checkout (Phase 16) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Billing webhook fulfillment |

If Upstash is not configured, production API routes use a per-instance in-memory
fallback limit. Configure Upstash before public launch if the deployment uses
multiple serverless instances or expected traffic is not tightly controlled.

### 2. Deploy

- Connect GitHub repo to Vercel
- Framework preset: **Next.js**
- Build command: `npm run build`
- Output: default (`.next`)

### 3. Post-deploy smoke test

- [ ] Landing page loads (`/`)
- [ ] Sign up → email confirm → login
- [ ] `/dashboard` loads when authenticated
- [ ] Generate business ideas, market analysis, report
- [ ] Generate and favorite a website blueprint
- [ ] History and Favorites pages load for the signed-in user
- [ ] Profile update and avatar upload
- [ ] Password reset flow
- [ ] Unauthenticated `/dashboard/*` redirects to `/login`
- [ ] `/sitemap.xml` and `/robots.txt` resolve
- [ ] Specialized sitemaps under `/sitemaps/*.xml` resolve

### 4. Local pre-deploy

```bash
npm run lint
npm run build
npm run verify
```

---

## SEO & organic growth (Phase 17)

> Note: Billing is Phase 16. SEO / organic growth is Phase 17. The enterprise SEO Engine upgrade lives in `lib/seo/*`, `components/seo/*`, and `/dashboard/seo`.

### Public discovery endpoints

| URL | Purpose |
|-----|---------|
| `/sitemaps/index.xml` | **Sitemap index** (preferred Search Console entry) |
| `/sitemap.xml` | Combined XML sitemap (all published URLs) |
| `/sitemaps/pages.xml` | Core + legal pages |
| `/sitemaps/tools.xml` | Product / tool landings |
| `/sitemaps/services.xml` | Category + service landings |
| `/sitemaps/images.xml` | Image-enriched product URLs |
| `/sitemaps/blog.xml` | Blog hub + published posts |
| `/sitemaps/templates.xml` | Templates hub |
| `/sitemaps/knowledge.xml` | Learn / docs / resources + use-cases |
| `/sitemaps/industries.xml` | Industry programmatic pages |
| `/sitemaps/countries.xml` | Country / market pages |
| `/robots.txt` | Production allows indexing; preview/dev disallows all |
| `/manifest.webmanifest` | PWA / brand manifest |

### SEO Engine surfaces

| Surface | Path |
|---------|------|
| SEO Health Dashboard + Analyzer | `/dashboard/seo` |
| Analyze API | `POST /api/seo/analyze` |
| Health API | `GET /api/seo/health` |
| Dynamic metadata / robots / social | `lib/seo/dynamic-engine.ts` |
| Breadcrumb engine | `lib/seo/breadcrumbs.ts` |
| JSON-LD builders | `lib/seo/json-ld.ts` |
| Internal linking | `lib/seo/internal-links.ts` |
| Programmatic / industry / country | `lib/seo/programmatic.ts`, `industries.ts`, `countries.ts` |

### Search Console & analytics

1. Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin.
2. Add Google / Bing verification env vars, redeploy, then verify the property.
3. Submit `https://your-domain/sitemaps/index.xml` (or `/sitemap.xml`) in Google Search Console and Bing Webmaster Tools.
4. Optionally set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and/or `NEXT_PUBLIC_GTM_ID` (CSP already allows Google Tag domains).

### URL rules

- Canonical product URLs live under `/products/*`.
- Programmatic clusters: `/use-cases/*`, `/compare/*`, `/services/*`, `/industries/*`, `/countries/*`.
- Legacy `/solutions/:slug` permanently redirects to `/products/:slug`.
- Dashboard, API, and auth routes are `noindex` / robots-disallowed.

### Content publishing rules

- Blog posts, knowledge entries, industries, countries, and programmatic landings only enter sitemaps when `status: "published"`.
- Use `SeoService` (`lib/seo/engine.ts`) and `generate*SeoMetadata` helpers for new public pages — do not invent thin duplicate URLs.
- Quality gate: `assertProgrammaticQuality()` before flipping draft → published.

---

## Growth Engine (Phase 21)

> Phase 17 is SEO. This Growth / marketing engine is **Phase 21**.

### Surfaces

| Surface | Path |
|---------|------|
| Growth dashboard | `/dashboard/growth` |
| Dashboard API | `GET /api/growth/dashboard` |
| Lead capture | `POST /api/growth/leads` |
| Newsletter | `POST /api/growth/newsletter` |
| Event tracking | `POST /api/growth/events` |
| Referrals | `POST /api/growth/referrals` |
| CRM | `POST/PATCH /api/growth/crm` |
| Campaigns / A/B / automations | `POST /api/growth/actions` |

### Migration

```bash
npm run db:apply -- --only 029
# or run supabase/APPLY_PHASE21.sql in the SQL editor
```

---

## Architecture notes

- Session refresh and route protection: `proxy.ts` → `lib/supabase/proxy.ts`
- API routes enforce auth via `requireUser()` in `lib/api/helpers.ts`
- Do not rely on proxy alone for API security — each route validates the session
- Central SEO: `lib/seo/*` + `components/seo/*`