"use client";

import { useVideoEditorT } from "@/components/dashboard/video-studio/editor/use-video-editor-t";
import { cn } from "@/lib/utils";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";

export function EditorTimeline({
  scenes,
  selectedId,
  playhead,
  zoom,
  onSelect,
  onPlayhead,
  onReorder,
  onZoom,
}: {
  scenes: Scene[];
  selectedId: string | null;
  playhead: number;
  zoom: number;
  onSelect: (id: string) => void;
  onPlayhead: (sec: number) => void;
  onReorder: (orderedIds: string[]) => void;
  onZoom: (zoom: number) => void;
}) {
  const { et } = useVideoEditorT();
  const total = Math.max(1, scenes.reduce((sum, scene) => sum + scene.duration, 0));
  const blocks = scenes.reduce<Array<{ scene: Scene; start: number; end: number }>>(
    (acc, scene) => {
      const start = acc.length ? acc[acc.length - 1]!.end : 0;
      acc.push({ scene, start, end: start + scene.duration });
      return acc;
    },
    [],
  );

  return (
    <section className="border-t border-white/10 bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-white/50">
        <span>{et("timeline.label", { duration: total.toFixed(1) })}</span>
        <label className="flex items-center gap-2">
          {et("timeline.zoom")}
          <input
            type="range"
            min={0.6}
            max={2}
            step={0.1}
            value={zoom}
            onChange={(event) => onZoom(Number(event.target.value))}
            className="w-24 accent-premium-gold"
          />
        </label>
      </div>
      <div
        className="relative h-16 overflow-x-auto rounded-lg border border-white/10 bg-black/40"
        style={{ minWidth: `${Math.max(100, total * 24 * zoom)}px` }}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          onPlayhead(ratio * total);
        }}
      >
        {blocks.map((block, index) => (
          <button
            key={block.scene.id}
            type="button"
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/scene-id", block.scene.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const fromId = event.dataTransfer.getData("text/scene-id");
              if (!fromId || fromId === block.scene.id) return;
              const ids = scenes.map((scene) => scene.id);
              const from = ids.indexOf(fromId);
              const to = ids.indexOf(block.scene.id);
              if (from < 0 || to < 0) return;
              ids.splice(to, 0, ids.splice(from, 1)[0]!);
              onReorder(ids);
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(block.scene.id);
            }}
            className={cn(
              "absolute top-2 bottom-2 rounded-md border text-left text-[10px] text-white",
              selectedId === block.scene.id ? "border-premium-gold bg-premium-gold/20" : "border-white/10 bg-white/10",
            )}
            style={{
              left: `${(block.start / total) * 100}%`,
              width: `${(block.scene.duration / total) * 100}%`,
            }}
          >
            <span className="block truncate px-2 pt-1 font-semibold">{et("timeline.blockLabel", { index: index + 1 })}</span>
            <span className="block px-2 text-white/60">{block.scene.duration.toFixed(1)}s</span>
          </button>
        ))}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-premium-gold"
          style={{ left: `${(playhead / total) * 100}%` }}
        />
      </div>
    </section>
  );
}
