# Video Studio — Production Readiness Guide

**Goal:** Minimal manual steps to run Video Studio in production with Kling full renders, HeyGen avatars, FFmpeg assembly, and strict stub prevention.

---

## Quick start (5 env vars)

Add to `.env.local` or production secrets:

```env
KLING_API_KEY=your_kling_key
ELEVENLABS_API_KEY=your_elevenlabs_key
FFMPEG_PATH=C:/path/to/ffmpeg.exe
VIDEO_PROVIDER_STRICT=1
VIDEO_STUDIO_CRON_SECRET=your_random_secret
```

Also required (likely already set):

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Verify

```bash
npm run verify:video-studio
```

Authenticated health check:

```
GET /api/video-studio/health
```

Target: `readyForProduction: true`

Env template:

```
GET /api/video-studio/health?docs=1
```

---

## Provider routing

| Mode | Provider | Keys |
|------|----------|------|
| Preview | `preview` | None |
| Full / image-to-video | **Kling** | `KLING_API_KEY` |
| Avatar | **HeyGen** | `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID` |

---

## Cron worker

Schedule every 1–2 minutes:

```bash
curl -X POST "https://YOUR_APP/api/video-studio/cron?limit=10" \
  -H "Authorization: Bearer $VIDEO_STUDIO_CRON_SECRET"
```

---

## UI indicators

- **Video Studio list** — compact provider status chips
- **Production Studio overview** — full provider health panel
- **Full MP4 Render** — disabled until `KLING_API_KEY` is configured (preview still works)

---

## Stub prevention

Production renders (`full`, `avatar`, `image-to-video`):

- Reject preview provider clips
- Reject stub MP4 bytes (`TB-AI-VIDEO:`)
- FFmpeg assembly only receives real `video/*` clip assets
- `VIDEO_PROVIDER_STRICT=1` fails provider HTTP errors instead of stub fallbacks

---

## Related docs

- [VIDEO_STUDIO_LOCAL_SETUP.md](./VIDEO_STUDIO_LOCAL_SETUP.md) — FFmpeg on Windows
- [VIDEO_STUDIO_PROVIDER_SETUP.md](./VIDEO_STUDIO_PROVIDER_SETUP.md) — Kling / HeyGen keys

---

## Production checklist

| Step | Command / action |
|------|------------------|
| DB migrations | `npm run db:apply -- --only 044,045` |
| FFmpeg | `npm run verify:video-studio` section [3] |
| Kling key | Set `KLING_API_KEY` |
| TTS | Set `ELEVENLABS_API_KEY` or `OPENAI_API_KEY` |
| Strict mode | `VIDEO_PROVIDER_STRICT=1` |
| Cron | Schedule `/api/video-studio/cron` |
| Smoke test | Create project → Full MP4 Render → `assemblyManifest.method: ffmpeg` |
