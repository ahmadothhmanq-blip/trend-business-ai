"use client";

import { useVideoEditorT } from "@/components/dashboard/video-studio/editor/use-video-editor-t";
import { cn } from "@/lib/utils";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";

export function EditorSceneList({
  scenes,
  selectedId,
  onSelect,
}: {
  scenes: Scene[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { p, et } = useVideoEditorT();

  return (
    <aside className="flex h-full min-h-[220px] w-full flex-col border-b border-white/10 bg-black/20 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/50">
        {p("management.scenes")}
      </div>
      <ol className="flex-1 space-y-1 overflow-auto p-2">
        {scenes.map((scene, index) => (
          <li key={scene.id}>
            <button
              type="button"
              onClick={() => onSelect(scene.id)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left transition",
                selectedId === scene.id
                  ? "border-premium-gold/40 bg-premium-gold/10 text-white"
                  : "border-white/10 bg-black/20 text-white/80 hover:border-white/20",
              )}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold">{et("scenes.sceneLabel", { index: index + 1 })}</span>
                <span className="text-white/50">{scene.duration.toFixed(1)}s</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-white/60">{scene.prompt}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-white/40">
                {scene.artifactId ? et("scenes.playableClip") : et("scenes.storyboardOnly")}
              </p>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
