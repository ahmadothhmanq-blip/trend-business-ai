# App Builder — Production Launch Checklist

Use this checklist before enabling Web App Builder for paying customers.

## 1. Database migrations

Apply App Builder migrations in order:

```bash
npm run db:apply -- --only 046,076,097
```

| Migration | Purpose |
|-----------|---------|
| 046 | Web app deployments (preview + production deploy records) |
| 076 | App platform foundation (Copilot idempotency, revision, platform tables) |
| 097 | Public app publications (`/w/app/{slug}`) |

## 2. Environment variables

Copy `.env.example` and configure:

| Variable | Required | Notes |
|----------|----------|-------|
| `DEEPSEEK_API_KEY` | **Yes** | App generation, assistant agent, App Copilot AI commands |
| `SUPABASE_URL` + `SUPABASE_ANON_KEY` | **Yes** | Auth, generations, deploy records |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Deploy worker, health checks, cron if added |
| `WEBAPP_DEPLOY_ENABLED` | Production | Set `true` to allow deploy actions from management |
| `WEBAPP_PUBLISH_ENABLED` | Production | Set `true` for public HTML host at `/w/app/{slug}` |
| `SITE_URL` | Production | Canonical base for preview/deploy links |

Optional planner flags (default OFF — enable only after validation):

- `UNIVERSAL_PLANNER_ENABLED=1`
- `UNIVERSAL_PLANNER_APP_ENABLED=1`

## 3. Product surfaces

| Surface | URL / route |
|---------|-------------|
| Builder tool | Dashboard → Web App Builder |
| Live preview (authenticated) | `/api/webapp-builder/{id}/live-preview` |
| App management | `/dashboard/webapp-builder/{id}/manage` |
| App Copilot API | `POST /api/webapp-builder/{id}/copilot/commands` (+ `/stream`, `/undo`) |
| Public published app | `/w/app/{slug}` |
| Full Next.js project | ZIP export (platform does **not** `npm build` customer apps — D-004) |

## 4. Verification

```bash
# Core platform wiring
npm run verify:app-builder

# App Copilot routes + panel
node scripts/verify-app-copilot.mjs

# Generated scaffold typecheck (~3 min)
npm run verify:app-builder:scaffold

# Optional: full scaffold next build
npm run verify:app-builder:scaffold:build

# Strict launch gate (files + i18n + unit tests)
npm run verify:app-builder:launch
```

Smoke-test one workflow end-to-end:

1. Generate app from prompt
2. Open live preview + management dashboard
3. Run an App Copilot command (e.g. change brand color)
4. Export ZIP
5. Deploy preview → production → open `/w/app/{slug}`

Optional deep E2E (requires `DEEPSEEK_API_KEY`, ~5–15 min):

```bash
npm run e2e:app-builder
```

## 5. Trust & delivery gates

Before treating a generation as deliverable, the pipeline runs:

- **Deterministic hardener** (`lib/ai/webapp-harden.ts`) — auth contract, UI exports, route collisions
- **Trust readiness** (`lib/ai/webapp-readiness.ts`) — no fake login routes, canonical `{ sessionId, userId, email }`
- **Scaffold verify** — `npm run verify:app-builder:scaffold` on representative output

`provision_backend` generates sketch Prisma/API files; customers run migrations in their exported ZIP.

## 6. i18n & Copilot UX

- UI strings: `products.webappBuilder` in `locales/en.json` + `locales/ar.json`
- App Copilot panel: `products.webappBuilder.copilot.*`
- **31 languages** supported for generation output via GLS (`getGlsGenerationLanguageOptions("webapp-builder")`)
- Site UI language (`tba_locale`) is separate from generation language (`tba_generation_language`)

## 7. Feature notes

- **App Copilot**: natural-language edits to structured app model; undo stack depth 5
- **DeepSeek-only stack**: recommended until multi-provider routing is configured
- **Production deploy**: public HTML preview host at `/w/app/{slug}` — not a managed Node runtime for customer Next.js apps
- **Managed Next.js hosting**: **not offered** (D-004 — platform never `npm build`s customer apps). Production path = ZIP + self-host + register HTTPS URL
- **Backend provision**: scaffolding only — not a hosted database service
- **Mobile stores**: every export includes `mobile-store/` (Capacitor + Google Play TWA) and PWA manifest — user builds `.aab`/iOS archive locally; platform does not upload to Play Console / App Store Connect. Packaging health notes appear after Sync packaging.

## 9. Mobile store publishing (Google Play, App Store, others)

Each generated app ZIP includes:

| Path | Purpose |
|------|---------|
| `public/manifest.webmanifest` | Installable PWA |
| `public/.well-known/assetlinks.json` | Android TWA domain verification (update SHA256) |
| `mobile-store/capacitor.config.ts` | Capacitor shell (Android + iOS) |
| `mobile-store/twa-manifest.json` | Bubblewrap / Google Play TWA template |
| `mobile-store/GOOGLE_PLAY.md` | Play Console checklist |
| `mobile-store/APPLE_APP_STORE.md` | App Store Connect checklist |

Workflow:

1. Deploy app to public HTTPS URL
2. Download ZIP from App Management
3. Update production URL in `mobile-store/capacitor.config.ts`
4. Replace icons with 512×512 PNG
5. Run build commands in `mobile-store/README.md`
6. Submit to Google Play / App Store / Samsung Galaxy Store

Dashboard: **Deploy tab → Mobile stores** section with step-by-step guidance.

## 8. Public URLs

Canonical published app URL: `/w/app/{slug}`  
Live preview remains authenticated under `/api/webapp-builder/{id}/live-preview`.
