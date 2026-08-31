"use client";

import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { Button } from "@/components/ui/button";
import { useVideoEditorT } from "@/components/dashboard/video-studio/editor/use-video-editor-t";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { ScenePatch, SceneTextOverlay } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
import { editorStateOf, overlaysOf } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

export function EditorCaptionsPanel({
  scene,
  onChange,
}: {
  scene: Scene | null;
  onChange: (patch: ScenePatch) => void;
}) {
  const { et } = useVideoEditorT();

  if (!scene) return <div className="p-3 text-sm text-white/50">{et("captions.selectScene")}</div>;
  const editor = editorStateOf(scene);
  const overlays = overlaysOf(scene);
  const update = (next: SceneTextOverlay[]) => onChange({ editor: { ...editor, overlays: next } });

  return (
    <div className="space-y-3 p-3 text-sm">
      <label className="flex items-center gap-2 text-xs text-white/70">
        <input
          type="checkbox"
          checked={editor.captionsEnabled !== false}
          onChange={(event) => onChange({ editor: { ...editor, captionsEnabled: event.target.checked } })}
        />
        {et("captions.captionsEnabled")}
      </label>
      {overlays.map((overlay) => (
        <div key={overlay.id} className="space-y-2 rounded-lg border border-white/10 p-2">
          <input
            className={dashboardInputClass}
            value={overlay.text}
            onChange={(event) =>
              update(overlays.map((item) => (item.id === overlay.id ? { ...item, text: event.target.value } : item)))
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className={dashboardInputClass}
              type="number"
              value={overlay.startSec}
              onChange={(event) =>
                update(overlays.map((item) => (item.id === overlay.id ? { ...item, startSec: Number(event.target.value) } : item)))
              }
            />
            <input
              className={dashboardInputClass}
              type="number"
              value={overlay.endSec}
              onChange={(event) =>
                update(overlays.map((item) => (item.id === overlay.id ? { ...item, endSec: Number(event.target.value) } : item)))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className={dashboardInputClass}
              type="number"
              min={0}
              max={100}
              value={overlay.xPct}
              onChange={(event) =>
                update(overlays.map((item) => (item.id === overlay.id ? { ...item, xPct: Number(event.target.value) } : item)))
              }
            />
            <input
              className={dashboardInputClass}
              type="number"
              min={0}
              max={100}
              value={overlay.yPct}
              onChange={(event) =>
                update(overlays.map((item) => (item.id === overlay.id ? { ...item, yPct: Number(event.target.value) } : item)))
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-2 text-xs"
              value={overlay.align}
              onChange={(event) =>
                update(
                  overlays.map((item) =>
                    item.id === overlay.id ? { ...item, align: event.target.value as SceneTextOverlay["align"] } : item,
                  ),
                )
              }
            >
              <option value="left">{et("captions.alignLeft")}</option>
              <option value="center">{et("captions.alignCenter")}</option>
              <option value="right">{et("captions.alignRight")}</option>
            </select>
            <input
              className={dashboardInputClass}
              type="number"
              value={overlay.fontSize}
              onChange={(event) =>
                update(overlays.map((item) => (item.id === overlay.id ? { ...item, fontSize: Number(event.target.value) } : item)))
              }
            />
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={overlay.enabled}
                onChange={(event) =>
                  update(overlays.map((item) => (item.id === overlay.id ? { ...item, enabled: event.target.checked } : item)))
                }
              />
              {et("captions.overlayOn")}
            </label>
          </div>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-white/15"
        onClick={() =>
          update([
            ...overlays,
            {
              id: crypto.randomUUID(),
              text: et("captions.defaultCaption"),
              startSec: 0,
              endSec: scene.duration,
              xPct: 50,
              yPct: 82,
              fontSize: 22,
              align: "center",
              enabled: true,
            },
          ])
        }
      >
        {et("captions.addTextOverlay")}
      </Button>
    </div>
  );
}
