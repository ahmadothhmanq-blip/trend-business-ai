# Video Studio — Local Rendering Setup (Windows)

**Purpose:** Enable multi-scene merge, voice mux, subtitle burn-in, and export on a Windows dev machine.  
**Verify:** `npm run verify:video-studio`  
**Health API:** `GET /api/video-studio/health` (authenticated)

Video Studio invokes **FFmpeg as an external binary** (`child_process.spawn`). It is not an npm package. Without FFmpeg, renders fall back to `first-clip` or `manifest-only` assembly.

---

## 1. Install FFmpeg (Windows)

### Option A — winget (recommended)

```powershell
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
```

After install, **open a new terminal** so PATH picks up the WinGet shim, then:

```powershell
ffmpeg -version
```

### Option B — Manual download

1. Download a **full** build from [https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/) (includes `libx264`, `xfade`, `ass`).
2. Extract to e.g. `C:\ffmpeg`.
3. Use `C:\ffmpeg\bin\ffmpeg.exe` as `FFMPEG_PATH` (see §2).

---

## 2. Configure `FFMPEG_PATH` in `.env.local`

The app resolves the binary in this order (`lib/ai-core/video-production-platform/assemble.ts`):

1. `FFMPEG_PATH`
2. `FFMPEG_BINARY` (alias)
3. `"ffmpeg"` on system PATH

**Recommended for Windows dev:** set an explicit path so renders work even before PATH is refreshed.

```env
# Video Studio — local assembly (see docs/VIDEO_STUDIO_LOCAL_SETUP.md)
FFMPEG_PATH=C:/Users/PC/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe
# Optional; derived automatically from FFMPEG_PATH if omitted:
# FFPROBE_PATH=C:/.../bin/ffprobe.exe
```

Use **forward slashes** in `.env.local` paths on Windows.

### Find your WinGet install path

```powershell
Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe |
  Select-Object -First 1 -ExpandProperty FullName
```

Update `FFMPEG_PATH` when FFmpeg is upgraded (the folder name includes the version).

---

## 3. Verify installation

```powershell
# From repo root (loads .env.local automatically)
npm run verify:video-studio
```

Expected **section [3] FFmpeg**:

- `✓ ffmpeg` with version line
- `✓ filter:merge/xfade`, `filter:audio mix`, `filter:subtitle burn`, `filter:scale/re-encode`

Quick manual check using the same path as the app:

```powershell
$env:FFMPEG_PATH = "C:/path/to/ffmpeg.exe"
& $env:FFMPEG_PATH -version
```

---

## 4. What works locally without provider keys

| Feature | Without provider keys | With FFmpeg only |
|---------|----------------------|------------------|
| UI / planning / preview mode | Yes | Yes |
| Multi-scene FFmpeg merge | No (needs real clips) | Yes (once clips exist) |
| TTS voice | Silent preview WAV | Silent preview WAV |
| Real AI video clips | Stub MP4 (`preview` provider) | Stub MP4 until keys added |
| `readyForProduction` | `false` | `false` (needs providers + TTS + strict mode) |

Provider keys (`KLING_API_KEY`, `RUNWAY_API_KEY`, `HEYGEN_API_KEY`, `ELEVENLABS_API_KEY`, etc.) are **not required** for local FFmpeg assembly testing.

---

## 5. Real video providers (Kling)

Full renders use **Kling** when `KLING_API_KEY` is set. See [VIDEO_STUDIO_PROVIDER_SETUP.md](./VIDEO_STUDIO_PROVIDER_SETUP.md) for complete env vars, avatar (HeyGen) lane, and strict mode.

| Variable | Purpose |
|----------|---------|
| `KLING_API_KEY` | Primary provider for full / image-to-video renders |
| `VIDEO_PROVIDER_STRICT=1` | Clear errors instead of stub MP4 fallbacks |
| `ELEVENLABS_API_KEY` or `OPENAI_API_KEY` | Voice synthesis |
| `VIDEO_STUDIO_CRON_SECRET` | Background job worker auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron cross-user job processing (already set locally) |

Env template: `GET /api/video-studio/health?docs=1`

DB migrations: `npm run db:apply -- --only 044,045`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ffmpeg — not found` in verify | Set `FFMPEG_PATH` in `.env.local`; restart terminal |
| `filter:merge/xfade — not found` | Install a **full** FFmpeg build, not a minimal build |
| PATH works in new terminal but not IDE | Set explicit `FFMPEG_PATH` in `.env.local` |
| Assembly returns `manifest-only` | FFmpeg failed at runtime — check path and temp disk space under `%TEMP%` |
