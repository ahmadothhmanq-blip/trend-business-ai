import { nowIso } from "@/lib/ai-core/video-production-platform/ids";
import type { AudioPlan } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type {
  AudioArtifact,
  AudioMixJob,
  AudioProductionPlan,
} from "@/lib/ai-core/video-production-platform/domain/audio";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import {
  audioProductionPlanFromSource,
  toLegacyAudioPlan,
  type AudioPlanSource,
} from "@/lib/ai-core/video-production-platform/audio-engine/from-plan";
import {
  applyArtifactToMusic,
  applyArtifactToSfx,
  applyArtifactToVoice,
  findAudioJobByIdempotencyKey,
  insertAudioJob,
  insertAudioPlan,
  insertAudioTracks,
  listAudioJobsForProject,
  loadAudioArtifact,
  mixJobFromRecord,
  persistAudioArtifact,
  signAudioArtifactUrl,
  updateAudioJob,
  updateAudioTrack,
  type AudioJobRecord,
} from "@/lib/ai-core/video-production-platform/audio-engine/persist";
import { mixAudio, type MixInput, type MixResult, type MixSettings } from "@/lib/ai-core/video-production-platform/audio-engine/mixer";
import type { TtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";
import { resolveTtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/registry";
import { buildAudioIdempotencyKey } from "@/lib/ai-core/video-production-platform/audio-engine/validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const DEFAULT_MIX: MixSettings = {
  voiceLevel: 1,
  musicLevel: 0.28,
  sfxLevel: 0.45,
  ducking: true,
  normalize: true,
  fadeInSec: 0.12,
  fadeOutSec: 0.2,
  targetDurationSec: 8,
};

export type ProduceAudioInput = {
  supabase: AnySupabase;
  userId: string;
  source: AudioPlanSource | AudioProductionPlan;
  mix?: Partial<MixSettings>;
  musicBytes?: Uint8Array | null;
  sfxSources?: Array<{ cue?: string; bytes: Uint8Array }>;
  tts?: TtsProvider;
  mixFn?: (input: MixInput) => MixResult | Promise<MixResult>;
};

export type ProduceAudioResult = {
  plan: AudioProductionPlan;
  legacyAudioPlan: AudioPlan;
  voiceArtifact: AudioArtifact | null;
  musicArtifact: AudioArtifact | null;
  sfxArtifacts: AudioArtifact[];
  mixArtifact: AudioArtifact | null;
  mixJob: AudioMixJob | null;
  jobs: AudioJobRecord[];
  reused: boolean;
  estimatedCost: number;
  actualCost: number;
};

function isProductionPlan(source: ProduceAudioInput["source"]): source is AudioProductionPlan {
  return "voiceTracks" in source && "musicTracks" in source && "sfxTracks" in source;
}

function settleCost(input: { reused: boolean; succeeded: boolean; estimated: number }): number {
  if (input.reused) return 0;
  if (!input.succeeded) return 0;
  return input.estimated;
}

async function reuseOrInsertJob(
  supabase: AnySupabase,
  input: Parameters<typeof insertAudioJob>[1],
): Promise<{ job: AudioJobRecord; reused: boolean }> {
  const existing = await findAudioJobByIdempotencyKey(supabase, input.idempotencyKey);
  if (existing) return { job: existing, reused: true };
  const job = await insertAudioJob(supabase, input);
  return { job, reused: false };
}

export async function produceAudio(input: ProduceAudioInput): Promise<ProduceAudioResult> {
  const plan = isProductionPlan(input.source)
    ? input.source
    : audioProductionPlanFromSource(input.source);
  const settings: MixSettings = {
    ...DEFAULT_MIX,
    ...input.mix,
    targetDurationSec: input.mix?.targetDurationSec ?? plan.targetDurationSec,
  };

  await insertAudioPlan(input.supabase, { userId: input.userId, plan, status: "processing" });
  await insertAudioTracks(input.supabase, { userId: input.userId, plan });

  let voiceArtifact: AudioArtifact | null = null;
  let musicArtifact: AudioArtifact | null = null;
  const sfxArtifacts: AudioArtifact[] = [];
  let estimatedCost = 0;
  let actualCost = 0;
  let reusedAny = false;
  const voice = plan.voiceTracks[0] || null;

  if (voice) {
    let provider: TtsProvider;
    try {
      provider = input.tts ?? resolveTtsProvider(voice.provider || undefined);
    } catch (error) {
      const failedJob = await insertAudioJob(input.supabase, {
        userId: input.userId,
        projectId: plan.projectId,
        audioPlanId: plan.id,
        trackId: voice.id,
        kind: "tts",
        provider: voice.provider || "unconfigured",
        status: "failed",
        idempotencyKey: buildAudioIdempotencyKey({
          projectId: plan.projectId,
          kind: "tts",
          provider: "unconfigured",
          fingerprint: `${voice.script}|${voice.language}`,
        }),
        estimatedCost: 0,
      });
      await updateAudioJob(input.supabase, {
        id: failedJob.id,
        status: "failed",
        actualCost: 0,
        errorCode: "unconfigured",
        errorMessage: error instanceof Error ? error.message : "TTS unconfigured",
        completedAt: nowIso(),
      });
      await updateAudioTrack(input.supabase, { id: voice.id, status: "failed" });
      throw error;
    }
    const estimate = provider.estimateCost({ characters: voice.script.length });
    const fingerprint = `${voice.script}|${voice.language}|${voice.speaker}|${voice.tone}|${provider.id}`;
    const idempotencyKey = buildAudioIdempotencyKey({
      projectId: plan.projectId,
      kind: "tts",
      provider: provider.id,
      fingerprint,
    });
    const queued = await reuseOrInsertJob(input.supabase, {
      userId: input.userId,
      projectId: plan.projectId,
      audioPlanId: plan.id,
      trackId: voice.id,
      kind: "tts",
      provider: provider.id,
      status: "processing",
      idempotencyKey,
      estimatedCost: estimate.credits,
    });
    reusedAny = reusedAny || queued.reused;
    if (!queued.reused) estimatedCost += estimate.credits;

    if (queued.reused && queued.job.status === "succeeded" && queued.job.artifactId) {
      voice.artifactId = queued.job.artifactId;
      voice.provider = provider.id;
      voice.status = "succeeded";
      voiceArtifact = await loadAudioArtifact(input.supabase, {
        userId: input.userId,
        artifactId: queued.job.artifactId,
      });
    } else if (queued.reused && queued.job.status === "failed") {
      const retryKey = buildAudioIdempotencyKey({
        projectId: plan.projectId,
        kind: "tts",
        provider: provider.id,
        fingerprint,
        attempt: queued.job.attempt + 1,
      });
      const retryJob = await insertAudioJob(input.supabase, {
        userId: input.userId,
        projectId: plan.projectId,
        audioPlanId: plan.id,
        trackId: voice.id,
        kind: "tts",
        provider: provider.id,
        status: "processing",
        attempt: queued.job.attempt + 1,
        idempotencyKey: retryKey,
        estimatedCost: estimate.credits,
      });
      estimatedCost += estimate.credits;
      const handle = await runTtsJob({
        supabase: input.supabase,
        userId: input.userId,
        projectId: plan.projectId,
        provider,
        voice,
        job: retryJob,
        estimated: estimate.credits,
      });
      voiceArtifact = handle.artifact;
      actualCost += handle.actualCost;
      Object.assign(voice, applyArtifactToVoice(voice, handle.artifact));
    } else if (!queued.reused || queued.job.status !== "succeeded") {
      const handle = await runTtsJob({
        supabase: input.supabase,
        userId: input.userId,
        projectId: plan.projectId,
        provider,
        voice,
        job: queued.job,
        estimated: queued.reused ? 0 : estimate.credits,
      });
      voiceArtifact = handle.artifact;
      actualCost += handle.actualCost;
      Object.assign(voice, applyArtifactToVoice(voice, handle.artifact));
    }
  }

  const music = plan.musicTracks[0] || null;
  if (music) {
    if (!input.musicBytes?.byteLength) {
      music.status = "failed";
      await updateAudioTrack(input.supabase, { id: music.id, status: "failed" });
    } else {
      const musicJob = await reuseOrInsertJob(input.supabase, {
        userId: input.userId,
        projectId: plan.projectId,
        audioPlanId: plan.id,
        trackId: music.id,
        kind: "music",
        provider: music.provider || "ingest",
        status: "processing",
        idempotencyKey: buildAudioIdempotencyKey({
          projectId: plan.projectId,
          kind: "music",
          provider: "ingest",
          fingerprint: `${music.mood}|${music.style}|${music.durationSec}`,
        }),
        estimatedCost: 0,
      });
      reusedAny = reusedAny || musicJob.reused;
      if (musicJob.reused && musicJob.job.status === "succeeded" && musicJob.job.artifactId) {
        music.artifactId = musicJob.job.artifactId;
        music.status = "succeeded";
      } else {
        try {
          musicArtifact = await persistAudioArtifact(input.supabase, {
            userId: input.userId,
            projectId: plan.projectId,
            kind: "music",
            bytes: input.musicBytes,
            durationSec: music.durationSec,
            provider: "ingest",
          });
          await updateAudioJob(input.supabase, {
            id: musicJob.job.id,
            status: "succeeded",
            actualCost: 0,
            artifactId: musicArtifact.id,
            completedAt: nowIso(),
          });
          await updateAudioTrack(input.supabase, { id: music.id, status: "succeeded", artifactId: musicArtifact.id });
          Object.assign(music, applyArtifactToMusic(music, musicArtifact));
        } catch (error) {
          await updateAudioJob(input.supabase, {
            id: musicJob.job.id,
            status: "failed",
            actualCost: 0,
            errorCode: error instanceof AudioEngineError ? error.code : "invalid_audio",
            errorMessage: error instanceof Error ? error.message : "Music ingest failed.",
            completedAt: nowIso(),
          });
          throw error;
        }
      }
    }
  }

  for (const [index, sfx] of plan.sfxTracks.entries()) {
    const source = input.sfxSources?.[index];
    if (!source?.bytes?.byteLength) {
      sfx.status = "failed";
      await updateAudioTrack(input.supabase, { id: sfx.id, status: "failed" });
      continue;
    }
    const sfxJob = await reuseOrInsertJob(input.supabase, {
      userId: input.userId,
      projectId: plan.projectId,
      audioPlanId: plan.id,
      trackId: sfx.id,
      kind: "sfx",
      provider: "ingest",
      status: "processing",
      idempotencyKey: buildAudioIdempotencyKey({
        projectId: plan.projectId,
        kind: "sfx",
        provider: "ingest",
        fingerprint: `${sfx.cue}|${sfx.timestampSec}|${index}`,
      }),
      estimatedCost: 0,
    });
    reusedAny = reusedAny || sfxJob.reused;
    if (sfxJob.reused && sfxJob.job.status === "succeeded" && sfxJob.job.artifactId) {
      sfx.artifactId = sfxJob.job.artifactId;
      sfx.status = "succeeded";
      continue;
    }
    const artifact = await persistAudioArtifact(input.supabase, {
      userId: input.userId,
      projectId: plan.projectId,
      kind: "sfx",
      bytes: source.bytes,
      durationSec: sfx.durationSec,
      provider: "ingest",
    });
    sfxArtifacts.push(artifact);
    await updateAudioJob(input.supabase, {
      id: sfxJob.job.id,
      status: "succeeded",
      actualCost: 0,
      artifactId: artifact.id,
      completedAt: nowIso(),
    });
    await updateAudioTrack(input.supabase, { id: sfx.id, status: "succeeded", artifactId: artifact.id });
    Object.assign(sfx, applyArtifactToSfx(sfx, artifact));
  }

  const hasStem = Boolean(
    voiceArtifact ||
      voice?.artifactId ||
      musicArtifact ||
      music?.artifactId ||
      sfxArtifacts.length ||
      plan.sfxTracks.some((track) => track.artifactId),
  );
  if (!hasStem) {
    throw new AudioEngineError("Audio pipeline produced no playable stems.", "mix_failed");
  }

  const mixIdempotency = buildAudioIdempotencyKey({
    projectId: plan.projectId,
    kind: "mix",
    provider: "ffmpeg",
    fingerprint: `${voice?.artifactId || voiceArtifact?.id || ""}|${music?.artifactId || musicArtifact?.id || ""}|${settings.targetDurationSec}|${settings.ducking}`,
  });
  const mixQueued = await reuseOrInsertJob(input.supabase, {
    userId: input.userId,
    projectId: plan.projectId,
    audioPlanId: plan.id,
    kind: "mix",
    provider: "ffmpeg",
    status: "processing",
    idempotencyKey: mixIdempotency,
    estimatedCost: 0,
  });
  reusedAny = reusedAny || mixQueued.reused;

  let mixArtifact: AudioArtifact | null = null;
  if (mixQueued.reused && mixQueued.job.status === "succeeded" && mixQueued.job.artifactId) {
    mixArtifact = await loadAudioArtifact(input.supabase, {
      userId: input.userId,
      artifactId: mixQueued.job.artifactId,
    });
  } else {
    const mixFn = input.mixFn || mixAudio;
    try {
      const mixed = await mixFn({
        voice: voiceArtifact?.bytes || null,
        music: musicArtifact?.bytes || null,
        sfx: sfxArtifacts.map((artifact, index) => ({
          bytes: artifact.bytes || new Uint8Array(),
          timestampSec: plan.sfxTracks[index]?.timestampSec || 0,
          intensity: plan.sfxTracks[index]?.intensity || 1,
        })).filter((cue) => cue.bytes.byteLength > 0),
        settings,
      });
      mixArtifact = await persistAudioArtifact(input.supabase, {
        userId: input.userId,
        projectId: plan.projectId,
        kind: "mix",
        bytes: mixed.bytes,
        mimeType: mixed.mimeType,
        durationSec: mixed.durationSec,
        provider: mixed.method === "ffmpeg" ? "ffmpeg" : "pcm-mix",
      });
      await updateAudioJob(input.supabase, {
        id: mixQueued.job.id,
        status: "succeeded",
        actualCost: 0,
        artifactId: mixArtifact.id,
        completedAt: nowIso(),
      });
    } catch (error) {
      await updateAudioJob(input.supabase, {
        id: mixQueued.job.id,
        status: "failed",
        actualCost: 0,
        errorCode: error instanceof AudioEngineError ? error.code : "mix_failed",
        errorMessage: error instanceof Error ? error.message : "Mix failed.",
        completedAt: nowIso(),
      });
      throw error;
    }
  }

  const jobs = await listAudioJobsForProject(input.supabase, plan.projectId);
  const mixRecord = jobs.find((job) => job.id === mixQueued.job.id) || mixQueued.job;
  return {
    plan,
    legacyAudioPlan: toLegacyAudioPlan(plan),
    voiceArtifact,
    musicArtifact,
    sfxArtifacts,
    mixArtifact,
    mixJob: mixJobFromRecord(mixRecord, settings),
    jobs,
    reused: reusedAny,
    estimatedCost,
    actualCost,
  };
}

async function runTtsJob(input: {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  provider: TtsProvider;
  voice: AudioProductionPlan["voiceTracks"][number];
  job: AudioJobRecord;
  estimated: number;
}): Promise<{ artifact: AudioArtifact; actualCost: number }> {
  let handle;
  try {
    handle = await input.provider.createJob({
      projectId: input.projectId,
      trackId: input.voice.id,
      script: input.voice.script,
      language: input.voice.language,
      voiceId: input.voice.speaker,
      tone: input.voice.tone,
      idempotencyKey: input.job.idempotencyKey,
    });
    if (handle.status === "processing") {
      handle = await input.provider.pollJob(input.job.id, input.job.idempotencyKey);
    }
  } catch (error) {
    const code = error instanceof AudioEngineError ? error.code : "provider_failed";
    await updateAudioJob(input.supabase, {
      id: input.job.id,
      status: "failed",
      actualCost: 0,
      errorCode: code,
      errorMessage: error instanceof Error ? error.message : "TTS failed.",
      completedAt: nowIso(),
    });
    await updateAudioTrack(input.supabase, { id: input.voice.id, status: "failed" });
    throw error;
  }

  if (handle.status !== "succeeded" || !handle.bytes?.byteLength) {
    await updateAudioJob(input.supabase, {
      id: input.job.id,
      status: "failed",
      actualCost: 0,
      errorCode: handle.errorCode || "provider_failed",
      errorMessage: handle.message,
      completedAt: nowIso(),
    });
    await updateAudioTrack(input.supabase, { id: input.voice.id, status: "failed" });
    throw new AudioEngineError(handle.message || "TTS provider failed.", "provider_failed");
  }

  try {
    const artifact = await persistAudioArtifact(input.supabase, {
      userId: input.userId,
      projectId: input.projectId,
      kind: "voice",
      bytes: handle.bytes,
      mimeType: handle.mimeType,
      durationSec: handle.durationSec || input.voice.durationSec,
      provider: input.provider.id,
    });
    const charged = settleCost({ reused: false, succeeded: true, estimated: input.estimated });
    await updateAudioJob(input.supabase, {
      id: input.job.id,
      status: "succeeded",
      actualCost: charged,
      artifactId: artifact.id,
      errorCode: null,
      errorMessage: null,
      completedAt: nowIso(),
    });
    await updateAudioTrack(input.supabase, { id: input.voice.id, status: "succeeded", artifactId: artifact.id });
    return { artifact, actualCost: charged };
  } catch (error) {
    await updateAudioJob(input.supabase, {
      id: input.job.id,
      status: "failed",
      actualCost: 0,
      errorCode: error instanceof AudioEngineError ? error.code : "invalid_audio",
      errorMessage: error instanceof Error ? error.message : "TTS artifact rejected.",
      completedAt: nowIso(),
    });
    await updateAudioTrack(input.supabase, { id: input.voice.id, status: "failed" });
    throw error;
  }
}

export { signAudioArtifactUrl, mixAudio };
