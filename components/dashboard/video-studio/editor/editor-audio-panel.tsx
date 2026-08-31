"use client";

import { useVideoEditorT } from "@/components/dashboard/video-studio/editor/use-video-editor-t";
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
  const { et } = useVideoEditorT();
  const editor = scene ? editorStateOf(scene) : {};

  return (
    <div className="space-y-3 p-3 text-sm">
      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{et("audio.tts")}</p>
        <p className={audio.ttsStatus === "ready" ? "text-emerald-300" : "text-amber-300"}>
          {audio.ttsStatus === "ready" ? et("audio.ttsReady") : et("audio.ttsUnavailable")}
        </p>
        <p className="mt-1 text-xs text-white/50">{audio.ttsReason}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{et("audio.voice")}</p>
        {audio.voice.length ? (
          audio.voice.map((track) => (
            <p key={track.id} className="mt-1 text-xs text-white/70">
              {et("audio.trackVoice", {
                speaker: track.speaker || et("audio.narration"),
                status: track.status,
                startSec: track.startSec ?? 0,
              })}
            </p>
          ))
        ) : (
          <p className="mt-1 text-xs text-white/40">{audio.voiceScript || et("audio.noVoiceTrack")}</p>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{et("audio.music")}</p>
        {audio.music.length ? (
          audio.music.map((track) => (
            <p key={track.id} className="mt-1 text-xs text-white/70">
              {et("audio.trackMusic", { mood: track.mood || et("audio.score"), status: track.status })}
            </p>
          ))
        ) : (
          <p className="mt-1 text-xs text-white/40">{et("audio.noMusic")}</p>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{et("audio.sfx")}</p>
        {audio.sfx.length ? (
          audio.sfx.map((track) => (
            <p key={track.id} className="mt-1 text-xs text-white/70">
              {et("audio.trackSfx", { cue: track.cue || et("audio.cue"), timestampSec: track.timestampSec ?? 0 })}
            </p>
          ))
        ) : (
          <p className="mt-1 text-xs text-white/40">{et("audio.noSfx")}</p>
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
            {et("audio.muteVoice")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(editor.muteMusic)}
              onChange={(event) => onChange({ editor: { ...editor, muteMusic: event.target.checked } })}
            />
            {et("audio.muteMusic")}
          </label>
          <label>
            {et("audio.voiceLevel")}
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
            {et("audio.musicLevel")}
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
            {et("audio.muteSfx")}
          </label>
          <label>
            {et("audio.sfxLevel")}
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
      <p className="text-[11px] text-white/40">{et("audio.footerNote")}</p>
    </div>
  );
}
