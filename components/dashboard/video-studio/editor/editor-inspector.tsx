"use client";

import { dashboardInputClass, dashboardTextareaClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { useVideoEditorT } from "@/components/dashboard/video-studio/editor/use-video-editor-t";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { ScenePatch } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

export function EditorInspector({
  scene,
  onChange,
}: {
  scene: Scene | null;
  onChange: (patch: ScenePatch, kind?: "text" | "duration" | "immediate") => void;
}) {
  const { p, et } = useVideoEditorT();

  if (!scene) {
    return <div className="p-4 text-sm text-white/50">{et("inspector.selectScene")}</div>;
  }
  return (
    <div className="space-y-3 overflow-auto p-3 text-sm">
      <label className="block text-xs text-white/50">{p("labels.prompt")}</label>
      <textarea
        className={dashboardTextareaClass}
        rows={4}
        value={scene.prompt}
        onChange={(event) => onChange({ prompt: event.target.value }, "text")}
      />
      <label className="block text-xs text-white/50">{et("inspector.durationSec")}</label>
      <input
        className={dashboardInputClass}
        type="number"
        min={0.5}
        step={0.5}
        value={scene.duration}
        onChange={(event) => onChange({ duration: Number(event.target.value) }, "duration")}
      />
      <label className="block text-xs text-white/50">{et("inspector.cameraMove")}</label>
      <input
        className={dashboardInputClass}
        value={scene.camera.move}
        onChange={(event) => onChange({ camera: { ...scene.camera, move: event.target.value } }, "text")}
      />
      <label className="block text-xs text-white/50">{et("inspector.visualStyle")}</label>
      <input
        className={dashboardInputClass}
        value={scene.visualStyle}
        onChange={(event) => onChange({ visualStyle: event.target.value }, "text")}
      />
      <label className="block text-xs text-white/50">{et("inspector.transition")}</label>
      <input
        className={dashboardInputClass}
        value={scene.transition}
        onChange={(event) => onChange({ transition: event.target.value }, "text")}
      />
      <label className="block text-xs text-white/50">{et("inspector.dialogue")}</label>
      <textarea
        className={dashboardTextareaClass}
        rows={3}
        value={scene.dialogue.text}
        onChange={(event) => onChange({ dialogue: { ...scene.dialogue, text: event.target.value } }, "text")}
      />
      <label className="flex items-center gap-2 text-xs text-white/70">
        <input
          type="checkbox"
          checked={Boolean(scene.voiceRequired || scene.audio.voiceRequired)}
          onChange={(event) => onChange({ voiceRequired: event.target.checked }, "immediate")}
        />
        {et("inspector.voiceRequired")}
      </label>
      <label className="block text-xs text-white/50">{et("inspector.providerPreference")}</label>
      <select
        className={dashboardSelectClass}
        value={scene.providerPreference === "omni_flash" ? "auto" : scene.providerPreference}
        onChange={(event) =>
          onChange({ providerPreference: event.target.value as Scene["providerPreference"] }, "immediate")
        }
      >
        {["auto", "veo", "kling", "runway", "heygen"].map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <label className="block text-xs text-white/50">{et("inspector.fallbackProvider")}</label>
      <select
        className={dashboardSelectClass}
        value={scene.fallbackProvider || ""}
        onChange={(event) =>
          onChange({ fallbackProvider: (event.target.value || null) as Scene["fallbackProvider"] }, "immediate")
        }
      >
        <option value="">{et("inspector.none")}</option>
        {["veo", "kling", "runway", "heygen", "external"].map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <label className="block text-xs text-white/50">{et("inspector.characters")}</label>
      <input
        className={dashboardInputClass}
        value={scene.characters.join(", ")}
        onChange={(event) =>
          onChange({ characters: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }, "text")
        }
      />
      <label className="block text-xs text-white/50">{et("inspector.products")}</label>
      <input
        className={dashboardInputClass}
        value={scene.products.join(", ")}
        onChange={(event) =>
          onChange({ products: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }, "text")
        }
      />
      <label className="block text-xs text-white/50">{et("inspector.referencesUri")}</label>
      <input
        className={dashboardInputClass}
        value={scene.references.map((item) => item.uri).join(", ")}
        onChange={(event) =>
          onChange(
            {
              references: event.target.value
                .split(",")
                .map((uri) => uri.trim())
                .filter(Boolean)
                .map((uri) => ({ kind: "image" as const, uri, role: "reference" })),
            },
            "text",
          )
        }
      />
    </div>
  );
}
