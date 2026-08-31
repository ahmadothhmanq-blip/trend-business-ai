"use client";

import type { EditorAudioSnapshot } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { editorStateOf } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
import type { ScenePatch } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

export function EditorAudioPanel({
  audio,
  scene,
  onChange,
}: {
  audio: EditorAudioSnapshot;
  scene: Scene | null;
  onChange: (patch: ScenePatch) => void;
}) {
  const editor = scene ? editorStateOf(scene) : {};
  return (
    <div className="space-y-3 p-3 text-sm">
      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">TTS</p>
        <p className={audio.ttsStatus === "ready" ? "text-emerald-300" : "text-amber-300"}>
          {audio.ttsStatus === "ready" ? "TTS ready" : "TTS unavailable"}
        </p>
        <p className="mt-1 text-xs text-white/50">{audio.ttsReason}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Voice</p>
        {audio.voice.length ? (
          audio.voice.map((track) => (
            <p key={track.id} className="mt-1 text-xs text-white/70">
              {track.speaker || "Narration"} · {track.status} · {track.startSec ?? 0}s
            </p>
          ))
        ) : (
          <p className="mt-1 text-xs text-white/40">{audio.voiceScript || "No voice track on the audio plan yet."}</p>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Music</p>
        {audio.music.length ? (
          audio.music.map((track) => (
            <p key={track.id} className="mt-1 text-xs text-white/70">
              {track.mood || "Score"} · {track.status}
            </p>
          ))
        ) : (
          <p className="mt-1 text-xs text-white/40">No music ingested.</p>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">SFX</p>
        {audio.sfx.length ? (
          audio.sfx.map((track) => (
            <p key={track.id} className="mt-1 text-xs text-white/70">
              {track.cue || "Cue"} @ {track.timestampSec ?? 0}s
            </p>
          ))
        ) : (
          <p className="mt-1 text-xs text-white/40">No SFX ingested.</p>
        )}
      </div>
      {scene ? (
        <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(editor.muteVoice)}
              onChange={(event) => onChange({ editor: { ...editor, muteVoice: event.target.checked } })}
            />
            Mute voice
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(editor.muteMusic)}
              onChange={(event) => onChange({ editor: { ...editor, muteMusic: event.target.checked } })}
            />
            Mute music
          </label>
          <label>
            Voice level
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={editor.voiceLevel ?? 1}
              onChange={(event) => onChange({ editor: { ...editor, voiceLevel: Number(event.target.value) } })}
            />
          </label>
          <label>
            Music level
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={editor.musicLevel ?? 0.28}
              onChange={(event) => onChange({ editor: { ...editor, musicLevel: Number(event.target.value) } })}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(editor.muteSfx)}
              onChange={(event) => onChange({ editor: { ...editor, muteSfx: event.target.checked } })}
            />
            Mute SFX
          </label>
          <label>
            SFX level
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={editor.sfxLevel ?? 1}
              onChange={(event) => onChange({ editor: { ...editor, sfxLevel: Number(event.target.value) } })}
            />
          </label>
        </div>
      ) : null}
      <p className="text-[11px] text-white/40">Audio is displayed from the existing Audio Engine. This panel does not generate TTS.</p>
    </div>
  );
}
