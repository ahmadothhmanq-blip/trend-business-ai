# Video Studio C5 — Production Operations Readiness Report

**Date:** 2026-08-21  
**Scope:** Fail-closed production ops only. No product features added.  
**Verdict:** **C5 CLOSED.** Hidden operational startup paths are removed. Production paid renders and the cron worker refuse to start when required configuration is missing.

---

## What fail-closed means

In `NODE_ENV=production` (excluding Vercel preview):

| Missing item | Effect |
|---|---|
| Full-render provider (Gemini/Veo, Kling, Runway, or external API) | Paid render throws `ProviderNotConfiguredError`; cron returns **503** |
| `FFMPEG_PATH` / `FFMPEG_BINARY` | Same — paid render blocked; FFmpeg health reports unavailable |
| `VIDEO_PROVIDER_STRICT=1` | Same |
| `VIDEO_STUDIO_CRON_SECRET` | Cron **401**; paid render blocked |
| `SUPABASE_SERVICE_ROLE_KEY` | Paid render blocked; cron **503** if secret is present |
| TTS (`ELEVENLABS_API_KEY` or `OPENAI_API_KEY`) | Paid render blocked |

Development still warns instead of blocking so local tests and preview renders keep working. Preview mode (`mode=preview`) is unchanged.

---

## Operational dependency matrix

Status is **control (code)** vs **this development host** (2026-08-21 verify).

| Dependency | Control plane | This host | Notes |
|---|---|---|---|
| Env catalog + production blockers | **PASS** | n/a | `validateVideoStudioProductionEnv()` |
| Full-render provider (at least one) | **PASS** | **PASS** | Host has `GEMINI_API_KEY`; Kling/Runway/HeyGen unset (optional if Gemini/Veo is set) |
| Kling (`KLING_API_KEY`) | **PASS** | WARN | Optional when Veo/Gemini or Runway is configured |
| Veo (`GEMINI_API_KEY` / `VEO_API_KEY`) | **PASS** | **PASS** | Gemini set; dedicated `VEO_API_KEY` unset |
| Runway (`RUNWAY_API_KEY`) | **PASS** | WARN | Optional fallback |
| HeyGen (`HEYGEN_API_KEY` + avatar/voice) | **PASS** | WARN | Avatar lane only; not required for full render |
| ElevenLabs / OpenAI TTS | **PASS** | **FAIL for production** | Unset on this host — production would block until set |
| `FFMPEG_PATH` + binary + merge filters | **PASS** | **PASS** | ffmpeg 8.1.2; xfade/amix/ass/scale present |
| `VIDEO_PROVIDER_STRICT=1` | **PASS** | **FAIL for production** | Unset on this host — **must be 1** on the production deploy |
| `VIDEO_STUDIO_CRON_SECRET` | **PASS** | **PASS** | Timing-safe compare; missing secret is a hard deny |
| `SUPABASE_SERVICE_ROLE_KEY` | **PASS** | **PASS** | Required for cron and private bucket admin |
| Private `video-studio` bucket | **PASS** | **PASS** | `public=false` |
| Upload + signed download | **PASS** | **PASS** | Probe upload/sign/delete succeeded; unsigned `/object/public/` rejected |
| Upload policy (size + MIME) | **PASS** | **PASS** | Migration **098** applied: 256 MiB, 9 MIME types |
| Object lifecycle | **PASS** (signed-URL expiry) | **PASS** | 7-day signed URLs; no storage auto-delete lifecycle (by design) |
| Cron schedule | **PASS** | **PASS** | `vercel.json` `* * * * *` → `/api/video-studio/cron` |
| Cron worker execution | **PASS** | **PASS** (auth) | Unset secret → 401. Production incomplete ops → 503. On Vercel set `CRON_SECRET` = `VIDEO_STUDIO_CRON_SECRET` |
| Paid render gate | **PASS** | n/a | `runDomainRenderPipeline` refuses production start when blockers exist |
| Health operationalChecks | **PASS** | n/a | `GET /api/video-studio/health` (authenticated) returns PASS/FAIL/WARN |

---

## Verification run

| Check | Result |
|---|---|
| `npm run verify:video-studio` | **PASS** (0 issues). Warnings only for unset optional/provider keys on this host |
| Storage upload + signed download | **PASS** |
| FFmpeg `-version` + filters | **PASS** |
| Video Studio unit tests (C5 + C1–C4 suites) | **216 pass / 0 fail** (91 + 125) |
| ESLint on C5 sources | **PASS** (0 errors; pre-existing unused-var warnings) |
| `tsc --noEmit` | Repo still has **pre-existing** Video Studio and `.next` errors. **No new errors** in `env-config.ts`, `production-health.ts`, `media-storage.ts`, `cron-auth.ts`, or `assemble.ts` production code |

---

## Production host checklist (operator)

Copy into the production secret store before go-live:

```env
VIDEO_PROVIDER_STRICT=1
VIDEO_STUDIO_CRON_SECRET=<random>
CRON_SECRET=<same as VIDEO_STUDIO_CRON_SECRET>
FFMPEG_PATH=<ffmpeg binary on the runtime image>
SUPABASE_SERVICE_ROLE_KEY=<service role>
# at least one:
KLING_API_KEY=  # or GEMINI_API_KEY / VEO_API_KEY / RUNWAY_API_KEY
ELEVENLABS_API_KEY=  # or OPENAI_API_KEY
```

Apply `098_video_studio_bucket_policy.sql` on production if not already applied.

Confirm: authenticated `GET /api/video-studio/health` → `readyForProduction: true` and every `operationalChecks[].status` is PASS (HeyGen/Runway may stay WARN if unused).

---

## Stop

C5 is complete. No feature development follows this report.
