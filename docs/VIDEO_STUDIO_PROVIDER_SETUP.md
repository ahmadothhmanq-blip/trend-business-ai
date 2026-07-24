# Video Studio — Provider Setup (Kling + HeyGen)

**Purpose:** Enable real AI video clips for full renders (Kling) and avatar renders (HeyGen).  
**Verify:** `npm run verify:video-studio`  
**Env template:** `GET /api/video-studio/health?docs=1` (authenticated)

FFmpeg assembly is documented separately in [VIDEO_STUDIO_LOCAL_SETUP.md](./VIDEO_STUDIO_LOCAL_SETUP.md). This guide covers **video generation providers only**.

---

## Provider routing (Phase A)

| Render mode | Provider | Env keys |
|-------------|----------|----------|
| `preview` | Preview stub (SVG / minimal MP4) | None |
| `full`, `image-to-video`, `batch-item` | **Kling** (primary) → Runway → external → preview | `KLING_API_KEY` |
| `avatar` | **HeyGen** only | `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID` |

Explicit `providerId` in the manage API overrides routing when the key is configured.

---

## Required environment variables

### Full render (Kling — recommended)

```env
KLING_API_KEY=your_kling_api_key
# Optional override:
# KLING_API_BASE_URL=https://api.klingai.com/v1
```

Obtain keys from [Kling AI developer console](https://app.klingai.com/).

### Avatar render (HeyGen — separate lane)

```env
HEYGEN_API_KEY=
HEYGEN_AVATAR_ID=    # from HeyGen dashboard — required for real avatars
HEYGEN_VOICE_ID=     # from HeyGen dashboard
```

Do **not** rely on HeyGen for scene B-roll; full renders use Kling when `KLING_API_KEY` is set.

### Voice / narration (full renders)

```env
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=   # optional
# or
OPENAI_API_KEY=
```

### Production hardening

```env
VIDEO_PROVIDER_STRICT=1
```

When set, provider HTTP errors and missing keys return **clear failures** instead of stub MP4 fallbacks.

### Background jobs (async Kling polls)

```env
VIDEO_STUDIO_CRON_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
```

Schedule `POST /api/video-studio/cron` every 1–2 minutes for long-running Kling tasks.

---

## Optional fallback providers

```env
RUNWAY_API_KEY=
RUNWAY_API_BASE_URL=
RUNWAY_MODEL=gen3a_turbo
VIDEO_PROVIDER_API_KEY=
VIDEO_PROVIDER_BASE_URL=
```

Used only when `KLING_API_KEY` is unset (full render lane).

---

## Local `.env.local` example

```env
# Video Studio — providers
KLING_API_KEY=
VIDEO_PROVIDER_STRICT=1

# Avatar lane (optional)
# HEYGEN_API_KEY=
# HEYGEN_AVATAR_ID=
# HEYGEN_VOICE_ID=

# Voice (optional for full render)
# ELEVENLABS_API_KEY=

# Assembly (see VIDEO_STUDIO_LOCAL_SETUP.md)
FFMPEG_PATH=C:/path/to/ffmpeg.exe
```

---

## Verification checklist

1. `npm run verify:video-studio` — `KLING_API_KEY` shows as set
2. `GET /api/video-studio/health` — `preferredProvider: "kling"`, `ffmpeg.available: true`
3. Create project → **Full MP4 Render** → job `provider: "kling"`
4. Expect clip assets with real MP4 URLs (not `TB-AI-VIDEO:` stubs)
5. Expect `assemblyManifest.method: "ffmpeg"` when FFmpeg is configured
6. With `VIDEO_PROVIDER_STRICT=1` and no keys → HTTP 400 with clear error (no silent stubs)

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Full render still uses `preview` | Set `KLING_API_KEY`; restart dev server after env change |
| HTTP 400 on full render | Read `error` field — likely missing `KLING_API_KEY` with strict mode on |
| `manifest-only` assembly | Clips are still stubs — confirm Kling jobs completed and returned URLs |
| Avatar render fails | Set `HEYGEN_API_KEY` + real avatar/voice IDs |
| Jobs stuck `processing` | Enable cron worker; use **Resume async jobs** in management UI |
