# Video Studio — Complete Production Audit

**Date:** 2026-08-21  
**Scope:** Entire Video Studio product (UI, APIs, AI pipeline, DB, storage, jobs, i18n, security).  
**Method:** Read-only inspection of source. No application code was changed.  
**Rule:** Findings below are tied to file paths. Items not found in the repo are marked as such.

---

## 1. Executive Summary

Video Studio already has a **real production engine**, not a demo wrapper: an AI Director, a domain state machine, live providers (Kling, Google Veo, Runway, HeyGen, Omni Flash), FFmpeg assembly, private signed storage, credit leases, and Postgres triggers that refuse stub MP4s.

That engine is **not what users get**. The live create page (`components/dashboard/video-studio/video-studio-tool.tsx`) uses identifiers that are never imported (`getOnePromptProduct`, `Textarea`, `TypeSelectorCard`, `OnePromptExperience`, `VIDEO_STYLES`, `CheckboxToggle`, `GlsGenerationLanguageSelect`, `ArrowRight`, `Sparkles`). A newer create wizard (`create/create-video-experience.tsx`) is imported and never rendered. Image-to-video, publish, and specialized modes therefore sit behind APIs with no working home-page path.

**Launch verdict for Video Studio as a competitor to Runway / Kling / Veo / HeyGen / InVideo: not ready.** Architecture is ahead of the product surface. Fix the compile-broken create UI, close the tenant-queue hole, stop unauthenticated FFmpeg probes, and fail closed when FFmpeg is missing — then the rest of this report is a sequenced product plan, not a rewrite.

Platform ops blockers in `docs/LAUNCH_BLOCKERS.md` (B1–B6) remain a separate public-launch NO-GO. They are not Video Studio architecture defects.

---

## 2. Strengths

| Strength | Evidence | Why it matters | Business impact |
|---|---|---|---|
| Stub / fake-MP4 prevention | `lib/ai-core/video-production-platform/providers/types.ts` (`isStubVideoBytes`), `domain/validation.ts` (`isValidVideoArtifact` rejects `preview`), `supabase/migrations/090_video_domain_persistence.sql` (`video_studio_guard_generation_state`) | A paying customer cannot be marked `video_rendered` / `published` on a 40-byte `TB-AI-VIDEO:` placeholder | Trust. This is the difference between a toy and a studio |
| Live providers, preview isolated | `provider-router/registry.ts` (veo, omni_flash, kling, runway, heygen, external); `providers/kling.ts`, `veo.ts`, `runway.ts`, `heygen.ts`; `providers/preview.ts` is the only stub and is rejected as a production provider in `provider-router/router.ts` | Product can actually generate clips when keys exist | Competitive parity on generation, not just storyboards |
| Honest assembly fallbacks | `assemble.ts` `assembleComposite` returns `ffmpeg` \| `first-clip` \| `manifest-only`; `export-production.ts` refuses unverified passthrough when FFmpeg is required | Failures are named, not disguised as success | Reduces chargeback / “where is my MP4?” support |
| State machine | `domain/contracts.ts` `VIDEO_PROJECT_STATES`; `domain/validation.ts` `ALLOWED_TRANSITIONS`; `state-machine/service.ts` `persistTransition` | Illegal jumps (e.g. assemble without a valid artifact) are blocked in app + DB | Safer multi-step jobs |
| Private storage | `media-storage.ts` `VIDEO_STUDIO_BUCKET = "video-studio"`, signed URLs, reject `/object/public/` | Clips are not world-readable by URL guess | Enterprise-ready media handling |
| Upload validation | `upload-validation.ts` + `upload-validation.test.ts`: extension, MIME, magic bytes, SVG/HTML reject, stub MP4 reject, 8 MiB stills / 256 MiB video | Stops obvious malware and fake renders at the door | Security baseline is real |
| Credit lease model | `runtime/video-credits.ts`: charge on success, refund on fail, no-op on reused/deferred; `honestProviderJobCost` never invents actuals | Aligns with “don’t bill a failed render” intent (partial — see H1 in launch blockers) | Fewer billing disputes than fire-and-forget debit |
| GLS on Director **text** | `app/api/video-studio/route.ts` `resolveRequestLanguage`; `director/llm.ts` `aiOutputLanguageDirective`; `director/normalize.ts` tags `dialogue.text.language` | Scripts/narration can follow the 32 GLS languages | Regional copy is possible |
| Editor domain API | `editor-mvp/` + `app/api/video-studio/projects/[id]/...` (save, reorder, split, duplicate, restore, regenerate) | Scene-level editing is implemented, not just a preview | Path to a real studio editor |
| Tests on core slices | `director.test.ts`, `lip-sync.test.ts`, `publish.test.ts`, `quality-control.test.ts`, `editor-mvp.test.ts`, `cron-auth.test.ts`, `video-credits.test.ts`, plus e2e scripts `scripts/e2e-video-studio-phase*.ts` | Domain logic is not untested vapor | Faster, safer Phase 1 fixes |

---

## 3. Weaknesses

### 3.1 Create UI cannot compile (confirmed)

**Path:** `components/dashboard/video-studio/video-studio-tool.tsx`  
**Evidence:** The file uses `getOnePromptProduct("video-studio")` (line 270), `<Textarea>` (574, 758), `<OnePromptExperience>` (711), `<TypeSelectorCard>` (731), `<GlsGenerationLanguageSelect>` (771), `VIDEO_STYLES` (782), `<CheckboxToggle>` (830), `ArrowRight`, `Sparkles`. None of these are imported. `CreateVideoExperience` **is** imported (lines 42–45) and is **never rendered**.

**Why it matters:** `/dashboard/video-studio` is the product home.  
**Business impact:** Zero successful first-run creations through the documented UI.  
**Recommended fix:** Either restore the missing imports (matching Website Builder / other tools) **or** render `CreateVideoExperience` as the only create surface and delete the dead stepper. Do not keep both.

### 3.2 Two AI pipelines

| Pipeline | Entry | Used by |
|---|---|---|
| Director (production) | `director/service.ts` `runDirector` | `POST /api/video-studio` |
| Legacy plugin | `plugins/video-studio/index.ts` + `lib/ai/prompts/video-studio.ts` | `lib/video-generator.ts` → `image-to-video/route.ts`, `specialized/route.ts`, `batch/route.ts` |

**Why it matters:** Thumbnail generation and AI scene JSON live only on the plugin path (`plugins/video-studio/index.ts` ~157). Director hard-codes `thumbnailSvg: ""` and `subtitles: []` in `director/blueprint.ts`.  
**Business impact:** “Generate video” and “image-to-video” are different products with different quality and GLS coverage.  
**Recommended fix:** One pipeline. Director should own story + scenes + script; plugin should be an adapter or deleted after migration.

### 3.3 GLS + GCRI do not reach every stage

| Stage | GLS | GCRI | Path |
|---|---|---|---|
| Request bind | Yes | Yes (AsyncLocalStorage) | `lib/i18n/api.ts` via `route.ts` `resolveRequestLanguage` |
| Director LLM | Yes (`Language:` + `aiOutputLanguageDirective`) | Ambient only — `DirectorInput` has **no** `country` field (`director/contracts.ts`) | `director/llm.ts` |
| Scene dialogue tag | Yes | No structured field | `director/normalize.ts` |
| TTS | Language code passed | No | `audio-engine/from-plan.ts`, `tts/elevenlabs.ts` |
| Visual provider prompt | **No** | **No** | `provider-router/scene-to-provider.ts` `buildSceneProviderPrompt` |
| Lip-sync | Metadata only | No | `lip-sync/service.ts` |
| Thumbnail | Plugin only | Plugin only | `lib/ai/prompts/video-studio.ts` |

**Why it matters:** The platform promises 32 GLS languages + GCRI country realism. Footage prompts sent to Kling/Veo/Runway are style/camera only.  
**Business impact:** Arabic/Japanese/RTL campaigns get local narration on English-looking clips. That is a product defect, not a translation miss.  
**Recommended fix:** Append GLS + GCRI directives to `buildSceneProviderPrompt`; persist `country` on the plan; map TTS voices per GLS language.

### 3.4 FFmpeg optional on the main assemble path

**Path:** `lib/ai-core/video-production-platform/assemble.ts` `assembleComposite`  
**Evidence:** Fallback chain `ffmpeg` → `first-clip` → `manifest-only`. Matches `docs/LAUNCH_BLOCKERS.md` **K1 | Video Studio ≠ MP4**.  
**Business impact:** Users (and credits) can complete a “render” without a merged MP4.  
**Recommended fix:** Production / billed `full` renders must set `requireFfmpeg: true` and fail if FFmpeg is missing (already the spirit of `export-production.ts`). Preview mode may stay soft.

### 3.5 Dual create UX + orphan APIs

- `components/dashboard/video-studio/create/*` (8 files): English-only wizard with image-to-video field — **unreachable**.
- `app/api/video-studio/image-to-video/route.ts`, `specialized/route.ts`, `projects/[id]/publish/route.ts`, `unpublish/route.ts`, `app/w/video/[slug]/route.ts`: implemented, **no button** in `components/dashboard/video-studio/**` for publish/unpublish; image-to-video only reachable if some other client calls the API.

---

## 4. Missing Features

Compared to Runway, Pika, Kling, Veo, Synthesia, HeyGen, Captions, InVideo, Luma Dream Machine — **only features absent or disconnected in this repo**:

| Feature | Leaders | This repo | Gap type |
|---|---|---|---|
| Image-to-video in create UI | Runway, Kling, Luma, Pika | `image-to-video.ts` + API; UI in unused `create-video-experience.tsx` | Disconnected |
| Video-to-video / restyle | Runway, Pika | Not found | Missing |
| Motion brush / region edit | Runway | Not found | Missing |
| Character identity lock | Kling Elements, HeyGen | QC `character_product_consistency` with `available: false` (`quality-control/inspect.ts`) | Stub QC |
| Timed ASR captions | Captions, InVideo | `voice-audio.ts` `rebuildSubtitlesFromScenes` copies `scene.script`; Director `subtitles: []` | Weak |
| Thumbnail on main path | InVideo / YouTube tools | Plugin option only | Missing on Director |
| Upscale / 4K export | Kling / pro suites | Not found | Missing |
| Native social posting | InVideo, Captions | `social-export.ts` packages files; no network publish | Missing |
| In-app public share | HeyGen | APIs + `app/w/video/[slug]/route.ts`, no UI | Disconnected |
| Talking-avatar first-class create | Synthesia, HeyGen | `providers/heygen.ts` + `lip-sync/heygen.ts` + manage `generate_avatar`; not on live create home | Disconnected |
| Duration > 3 minutes | Synthesia, InVideo | `director/contracts.ts` `MAX_PLAN_DURATION_SEC = 180` | Cap |
| Camera keyframes / elements | Kling | Camera is prompt text in `buildSceneProviderPrompt` | Missing |
| Prompt enhancement as a dedicated control | Most | OnePrompt + Director; unused create prompt panel has enhancer | Partial |
| Stock / generated music library | InVideo | Music is plan mood + mix (`audio-engine`); no catalog UI | Weak |

**Do not implement these until Phase 1 blockers are cleared.**

---

## 5. UX Improvements

| Finding | Path | Why it matters | Business impact | Recommended fix |
|---|---|---|---|---|
| Home page compile break | `video-studio-tool.tsx` | Users cannot create | Product is down | Restore imports **or** mount `CreateVideoExperience` |
| Two create flows | `create/*` vs stepper in `video-studio-tool.tsx` | Confusing, dead code | Engineering waste | One flow |
| Editor English-only | `editor/*.tsx` — no `useTranslation` | Breaks 31 UI locales | Non-English users bounce | `useProductT("videoStudio")` |
| Create wizard English-only | `create/*.tsx` hardcoded copy | Same | Same | i18n before mounting |
| English API toasts | `jobs/route.ts`, `[id]/manage/route.ts`, publish routes return `message: "Updated."` etc.; UI uses `json.message ?? p(...)` | Locale keys never win | Looks untranslated | Return error **codes**; UI always uses `p()` |
| Publish unreachable | `projects/[id]/publish/route.ts`, `app/w/video/[slug]/route.ts` | Share loop incomplete | Cannot show work | Editor/manage Publish button |
| Icon-only controls | `editor-actions.tsx` Undo/Redo; `editor-preview.tsx` play | a11y | Enterprise procurement fail | `aria-label` |
| Overlay no delete | `editor-captions-panel.tsx` | Incomplete editor | Support tickets | Remove control |
| Provider health swallow | `video-studio-provider-status.tsx` `catch { /* ignore */ }` | Failed health looks like “checking” | Users retry blind | Distinct failed state |
| Fetch ignore | `video-studio-tool.tsx` `fetchGenerations` `if (!res.ok) return` | Silent empty history | Looks like no projects | Surface `p("errors.loadFailed")` |
| Progress | `GenerationProgress` on generating step; batch has percent | OK for storyboard; render is async/cron | Users think generation hung | Job status feed from `/api/video-studio/jobs` |
| Onboarding | No first-run checklist in code | New users hit provider/FFmpeg gaps | Churn | Gate create on `health` report (`production-health.ts`) |
| Mobile | Breakpoints `sm:`/`lg:` present on tool + editor grid | Usable but editor is dense | Mobile is secondary | Keep; don’t block Phase 1 |
| Accessibility | Unused create/* has better ARIA than live editor | Irony | a11y debt | Copy ARIA from unused create cards onto live UI |

---

## 6. AI Improvements

| Stage | Path | Gap | Recommended fix |
|---|---|---|---|
| Prompt | `director/llm.ts` interpolates `input.prompt` raw; `sanitizePromptInput` not used in `director/` | Jailbreak text can land in scene prompts / TTS | Sanitize user fields; keep JSON schema (`DIRECTOR_LLM_SCHEMA`) |
| Planning | `runDirector` + 3 retries (`director/service.ts`, `generateJsonWithValidation`) | Solid | Keep; add `country` to `DirectorInput` |
| Story / scenes / script | One-shot Director draft | Plugin path still generates per-scene JSON sequentially (`plugins/video-studio/index.ts`) with empty fallback on catch | Delete empty-scene swallow; one pipeline |
| Voice | `elevenlabs.ts` `languages: ["en","ar","es","fr","de","it"]`; duration estimated from word count | 32 GLS languages unsupported; duration is fake | Use multilingual model + real duration from bytes/ffprobe (assemble already probes) |
| Subtitles | Derived from script, not ASR; burn-in in `assemble.ts` `buildAssFile` | Timing is scene-length buckets | Whisper/ASR or provider captions; keep burn-in |
| Thumbnail | Director `thumbnailSvg: ""` | No cover image on main path | Generate still from first scene or image engine |
| Image gen | No Video Studio image engine; product URL via `assertSafeRemoteFetchUrl` | I2V depends on user URL | Wire Image Generator / upload (`[id]/media/route.ts` already validates) |
| Video gen | Sequential `for` over scenes in `runtime/render-pipeline.ts` | Slow; 300s `maxDuration` on routes | Parallel `createJob`; poll in cron worker |
| Lip-sync | HeyGen `/v3/lipsyncs`; DB idempotency + in-memory `job-cache.ts` | Fine for MVP | Keep DB as source of truth |
| Final render | FFmpeg concat/xfade/amix/ASS | Quality depends on host binary | `docs/VIDEO_STUDIO_LOCAL_SETUP.md` + fail closed in prod |
| QC | `quality-control/inspect.ts` prompt_adherence / consistency often `available: false` but **passed: true** (info) | Looks like quality passed | Do not mark passed when unavailable; keep blockers for stubs/black frames |

---

## 7. Performance Improvements

| Finding | Path | Why it matters | Business impact | Recommended fix |
|---|---|---|---|---|
| Sequential scenes | `runtime/render-pipeline.ts` | Each clip waits on the previous provider round-trip | Multi-scene videos time out at 300s | Fan-out createJob; worker polls |
| Sequential batch | `app/api/video-studio/batch/route.ts` `for` over `toGenerate` | Batch of 20 is one long request | Failed mid-batch; poor UX | Enqueue items; cron processes |
| Sequential cron | `runtime/provider-job-worker.ts` `processDueProviderJobs` | Throughput = 1 job at a time per invocation | Queue backup under multi-user | Bounded `Promise.all` (e.g. 4) per cron tick |
| Duplicate drainers | `generation-pipeline.ts` `processPendingRenderJobs` and `processVideoStudioBackgroundQueue` | Two scanners, same table | Duplicate provider spend risk | One function |
| Lip-sync Map | `lip-sync/job-cache.ts` | Useless across serverless instances | Extra HeyGen calls (DB still protects billing) | Delete Map; keep DB lookup |
| Rate limit 5/min | `lib/api/rate-limit.ts` `beginAiUsage` for video-studio | Protects LLM/Director | Fine for create; not for editor spam | Keep for AI; add mutation limit |
| Token / cost | Flat `VIDEO_STUDIO_CREDIT_AMOUNT = 1` (`video-credits.ts`) vs Kling per-clip cost | Platform eats margin | Unsustainable vs HeyGen/Kling list prices | Price by scenes × duration × provider estimate |
| Caching | No prompt/plan cache beyond Director idempotency (`director/normalize.ts` `directorIdempotencyKey`) | Repeat identical briefs re-call LLM unless key hits | Cost | Keep idempotency; document it in UI (“same brief reused”) |
| FFmpeg probe every public GET | `design-platform/route.ts` `probeFfmpegCapabilities()` | Spawns 3 child processes | DoS + latency | Cache 60s; require auth |

---

## 8. Security Improvements

| Finding | Path | Why it matters | Business impact | Recommended fix |
|---|---|---|---|---|
| Cross-tenant job drain | `app/api/video-studio/jobs/route.ts` `mineOnly` default true, but `false` passes `userId: undefined` into queue processors | Any authenticated user can process **all** tenants’ `video_render_jobs` | Data integrity + stolen GPU/provider budget | Remove `mineOnly` or require admin role |
| Unauthenticated catalog + ffmpeg | `design-platform/route.ts`, `marketplace/route.ts` — no `requireUser` | Catalog leak is mild; ffmpeg spawn is not | Availability | Auth marketplace optionally; **must** auth design-platform |
| Prompt injection | `lib/ai/sanitize.ts` used in other products; **not** in `director/` | Injected instructions can flow to video/TTS vendors | Brand-unsafe footage | `sanitizePromptInput` on prompt/objective/audience/CTA |
| Cron secret `===` | `runtime/cron-auth.ts` | Timing side-channel (low practical risk) | Hardening | `crypto.timingSafeEqual` |
| Unmetered provider actions | `[id]/manage/route.ts` `synthesize_voice` (real), `generate_avatar`, `export_social`, `trim_scene`, `platform_health` skip `beginAiUsage` | Abuse = free ElevenLabs/HeyGen/FFmpeg | Margin + DoS | Rate limit + credits |
| Editor mutations unbounded | `projects/[id]/editor/save`, scenes PATCH/DELETE/split/duplicate/restore/reorder | Spam DB | Availability | `enforceMutationRateLimit` |
| Upload | `upload-validation.ts` + `[id]/media/route.ts` | Strong | Keep | No change |
| Storage ACL | `media-storage.ts` user-scoped signed URLs | Strong | Keep | No change |
| Cron deny if secret unset | `cron-auth.ts` | Strong | Keep | No change |
| Remote URL SSRF | `assertSafeRemoteFetchUrl` on product image (`route.ts`, `manage/route.ts`, `specialized/route.ts`) | Strong | Keep | Apply anywhere a user URL is fetched |

---

## 9. Scalability Improvements

| Finding | Path | Why it matters | Business impact | Recommended fix |
|---|---|---|---|---|
| Worker = Next.js route + cron | `app/api/video-studio/cron/route.ts` `maxDuration = 300`; docs say schedule every 1–2 min | No dedicated worker pool | Multi-user queues stall | Keep cron for v1; add concurrency cap; later a real worker |
| Retry | `PROVIDER_MAX_RETRY_COUNT = 2`, stale 12 min (`runtime/timeouts.ts`) | Reasonable | Keep | Alert on stale fail |
| Idempotency | `persistRoutedProviderJob` unique key | Prevents double-create races | Keep | — |
| Lip-sync isolated table | `095_video_lipsync_jobs.sql` | Clip worker won’t poll avatar jobs | Good | Keep |
| RLS | `018_video_generations.sql` and later migrations | Multi-user isolation at DB | Keep | Don’t bypass with service role except cron/admin |
| Sequential everything | render-pipeline, batch, cron | See performance | Cannot “Kling-scale” | Parallelize jobs, not architecture rewrite |
| Upstash optional | `docs/LAUNCH_BLOCKERS.md` H3; in-memory rate limit fallback | Per-instance limits in prod | Abuse across instances | Set Upstash |

**Do not redesign** the domain model. Confirmed blockers are UI compile, tenant jobs, public ffmpeg, and FFmpeg-optional billed renders — not the folder layout.

---

## 10. Production Blockers

These **prevent competing as a global AI video product** until fixed. Ops items from `docs/LAUNCH_BLOCKERS.md` are included only where they affect Video Studio.

| ID | Blocker | Evidence | Why it matters |
|---|---|---|---|
| C1 | Create home does not compile | `video-studio-tool.tsx` missing imports | No product |
| C2 | Any user can process all render jobs | `jobs/route.ts` `mineOnly: false` | Multi-tenant integrity |
| C3 | Public FFmpeg capability probe | `design-platform/route.ts` | DoS |
| C4 | Billed path can finish without MP4 | `assemble.ts` + K1 | “Video Studio ≠ MP4” |
| C5 | Production buckets / service role / cron | `LAUNCH_BLOCKERS` B2; cron 503 without admin client | Renders cannot persist in prod |
| C6 | Dual unused create surface | `CreateVideoExperience` never rendered | Image-to-video and wizard never ship |
| C7 | GLS/GCRI missing on visual providers | `scene-to-provider.ts` | International product claim is false for footage |

Editor i18n, publish UI, and credit-per-scene are **high**, not compile/security blockers.

---

## 11. Priority Matrix

### Critical

1. **C1** — Restore or replace `video-studio-tool.tsx` so `/dashboard/video-studio` builds and creates a Director plan.  
2. **C2** — Force `userId` on `jobs` queue processing unless admin.  
3. **C3** — Authenticate and cache `design-platform`.  
4. **C4** — Fail closed on billed full render without FFmpeg / playable composite.  
5. **C5** — Production env: `KLING_API_KEY` (or equivalent), `FFMPEG_PATH`, `VIDEO_STUDIO_CRON_SECRET`, `VIDEO_PROVIDER_STRICT=1`, Supabase bucket `video-studio` (`docs/VIDEO_STUDIO_PRODUCTION_READY.md`).

### High

6. Mount **one** create UX; wire image-to-video.  
7. Inject GLS+GCRI into `buildSceneProviderPrompt`.  
8. i18n editor + stop English `message` toasts.  
9. Publish / unpublish in UI.  
10. `sanitizePromptInput` on Director user fields.  
11. Parallel scene `createJob`; rely on cron for poll.  
12. Credit model vs real provider cost (`VIDEO_STUDIO_CREDIT_AMOUNT = 1` vs Kling/HeyGen).  
13. Rate-limit manage TTS/avatar/export and editor mutations.

### Medium

14. Collapse plugin vs Director pipelines.  
15. Timed captions; Director thumbnails.  
16. TTS voice map for 32 GLS languages.  
17. QC: don’t pass unavailable prompt/consistency checks.  
18. Tests for `assemble.ts` and `media-storage.ts`.  
19. Deduplicate queue drainers.  
20. `timingSafeEqual` on cron secret.

### Low

21. Video-to-video, upscale, motion brush.  
22. Duration > 180s.  
23. Native social network publish.  
24. Editor RTL timeline mirroring.  
25. In-memory lip-sync Map removal.

---

## 12. Recommended Implementation Roadmap

### Phase 1 — Make it run (no new features)

- Fix C1–C4 (UI compile, tenant jobs, public ffmpeg, MP4 fail-closed).  
- Confirm health: `GET /api/video-studio/health` + `npm run verify:video-studio`.  
- Smoke: one 3-scene Director plan → cron → playable MP4 in signed storage.  
- Hide or delete unreachable create/* until Phase 2 (do not leave two homes).

**Success:** A user can create and play a real MP4. No architecture redesign.

### Phase 2 — Make it a product

- Single create flow including image-to-video upload (`[id]/media` + `image-to-video/route.ts`).  
- GLS/GCRI on visual prompts; persist country on plan.  
- Editor + toast i18n; publish button → `/w/video/[slug]`.  
- Sanitize Director prompts; mutation rate limits.  
- Parallelize independent scene jobs.

**Success:** Matches a junior Runway/Kling “text + image to video + share link” loop.

### Phase 3 — Make it honest and international

- Credits by scene/duration/provider estimate; meter TTS/avatar.  
- TTS voices for GLS set; timed captions; thumbnails on Director path.  
- Merge or retire `plugins/video-studio` generation.  
- Tests: assemble fallbacks, storage signed-URL guards.  
- One queue drainer.

**Success:** 31 UI locales + 32 GLS languages are true for script **and** on-screen intent; billing matches cost.

### Phase 4 — Compete globally

- Character consistency, video-to-video, upscale, motion controls.  
- Worker fleet / higher cron concurrency.  
- Duration beyond 180s, native social publish, avatar-first templates.  
- Vision QC for prompt adherence (replace `available: false` info-pass).

**Success:** Feature conversation vs HeyGen/InVideo, not “does it export MP4?”

---

## Architecture snapshot (for implementers)

```
UI:  components/dashboard/video-studio/{video-studio-tool, create/*, editor/*, video-management-dashboard}
API: app/api/video-studio/** (22 routes) + app/w/video/[slug]
AI:  plugins/video-studio (legacy) | video-production-platform/director + runtime/render-pipeline
DB:  Supabase video_generations, video_plans, video_scenes, video_provider_jobs, video_media,
     video_audio_plans, video_lipsync_jobs, video_publications (migrations 018, 044–045, 089–096)
Jobs: POST /api/video-studio/cron → processVideoStudioBackgroundQueue → processDueProviderJobs
Render: providers → ingest → QC → assemble.ts (ffmpeg) → signed upload
```

**Code quality notes (not blockers):** `CreateVideoExperience` dead import; duplicate queue functions; unused `editor/save` from `use-video-editor.ts` (patches scenes one-by-one). Plugin `generateVideo` empty-scene catch is technical debt. `assemble.ts` / `media-storage.ts` lack unit tests.

---

*End of audit. No application code was modified. Next step is Phase 1 implementation only when product owners explicitly start it.*
