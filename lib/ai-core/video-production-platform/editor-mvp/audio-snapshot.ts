import { ttsProviderHealthReport } from "@/lib/ai-core/video-production-platform/audio-engine/tts/registry";
import type { EditorAudioSnapshot } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function loadEditorAudioSnapshot(
  supabase: AnySupabase,
  projectId: string,
): Promise<EditorAudioSnapshot> {
  const health = ttsProviderHealthReport();
  const ready = health.find((row) => row.status === "ready");
  const ttsStatus = ready ? "ready" : "unavailable";
  const ttsReason = ready
    ? `${ready.id} is configured.`
    : "TTS unavailable. Set ELEVENLABS_API_KEY or OPENAI_API_KEY.";
  const empty: EditorAudioSnapshot = {
    language: null,
    voiceScript: null,
    voice: [],
    music: [],
    sfx: [],
    mixStatus: null,
    ttsStatus,
    ttsReason,
  };
  try {
    const planRes = await supabase.from("video_audio_plans").select("*").eq("project_id", projectId).limit(1);
    if (planRes.error) return empty;
    const plan = Array.isArray(planRes.data) ? planRes.data[0] : planRes.data;
    const trackRes = await supabase.from("video_audio_tracks").select("*").eq("project_id", projectId);
    const tracks = (trackRes.data || []) as Array<Record<string, unknown>>;
    const jobRes = await supabase.from("video_audio_jobs").select("*").eq("project_id", projectId).eq("kind", "mix");
    const jobs = (jobRes.data || []) as Array<Record<string, unknown>>;
    const mix = jobs[0];

    const voice = tracks
      .filter((row) => row.kind === "voice")
      .map((row) => {
        const meta = (row.metadata as Record<string, unknown>) || {};
        return {
          id: String(row.id),
          speaker: typeof meta.speaker === "string" ? meta.speaker : undefined,
          script: typeof meta.script === "string" ? meta.script : undefined,
          startSec: typeof meta.startSec === "number" ? meta.startSec : 0,
          durationSec: typeof meta.durationSec === "number" ? meta.durationSec : undefined,
          status: String(row.status || "queued"),
        };
      });
    const music = tracks
      .filter((row) => row.kind === "music")
      .map((row) => {
        const meta = (row.metadata as Record<string, unknown>) || {};
        return {
          id: String(row.id),
          mood: typeof meta.mood === "string" ? meta.mood : undefined,
          durationSec: typeof meta.durationSec === "number" ? meta.durationSec : undefined,
          status: String(row.status || "queued"),
        };
      });
    const sfx = tracks
      .filter((row) => row.kind === "sfx")
      .map((row) => {
        const meta = (row.metadata as Record<string, unknown>) || {};
        return {
          id: String(row.id),
          cue: typeof meta.cue === "string" ? meta.cue : undefined,
          timestampSec: typeof meta.timestampSec === "number" ? meta.timestampSec : undefined,
          durationSec: typeof meta.durationSec === "number" ? meta.durationSec : undefined,
          status: String(row.status || "queued"),
        };
      });

    return {
      language: plan ? String(plan.language || "") : null,
      voiceScript: plan ? String(plan.voice_script || "") : null,
      voice,
      music,
      sfx,
      mixStatus: mix ? String(mix.status || "") : null,
      ttsStatus,
      ttsReason,
    };
  } catch {
    return empty;
  }
}
