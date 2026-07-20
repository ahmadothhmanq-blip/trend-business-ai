"use client";

import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CanvasLayer } from "@/lib/ai-core/image-design-platform/editor/types";
import { cn } from "@/lib/utils";

export function LayersPanel(props: {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onAddLayer: () => void;
}) {
  const sorted = [...props.layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Layers</p>
        <Button size="sm" variant="outline" className="h-7 rounded-lg border-white/10 text-xs" onClick={props.onAddLayer}>
          Add
        </Button>
      </div>
      <div className="space-y-1">
        {sorted.map((layer) => (
          <div
            key={layer.id}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs",
              props.selectedLayerId === layer.id ? "border-premium-gold/40 bg-premium-gold/10" : "border-white/10 bg-white/[0.02]",
            )}
          >
            <button type="button" className="min-w-0 flex-1 truncate text-left text-white/80" onClick={() => props.onSelectLayer(layer.id)}>
              {layer.name} ({layer.elements.length})
            </button>
            <Button variant="ghost" size="icon-xs" onClick={() => props.onToggleVisibility(layer.id)}>
              {layer.visible ? <Eye className="size-3" /> : <EyeOff className="size-3 text-white/30" />}
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => props.onToggleLock(layer.id)}>
              {layer.locked ? <Lock className="size-3" /> : <Unlock className="size-3 text-white/30" />}
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => props.onDuplicate(layer.id)}><Copy className="size-3" /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => props.onMove(layer.id, "up")}><ChevronUp className="size-3" /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => props.onMove(layer.id, "down")}><ChevronDown className="size-3" /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => props.onRemove(layer.id)}><Trash2 className="size-3 text-red-400" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
