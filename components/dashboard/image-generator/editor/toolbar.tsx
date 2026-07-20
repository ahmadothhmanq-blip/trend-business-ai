"use client";

import {
  Type,
  Square,
  Image as ImageIcon,
  Star,
  Layers,
  Undo2,
  Redo2,
  Save,
  Download,
  Wand2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorToolbar(props: {
  busy: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: (format: string) => void;
  onAdd: (type: "text" | "shape" | "image" | "icon" | "logo" | "background") => void;
  onAiEdit: (operation: string) => void;
  onBrandPanel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" disabled={!props.canUndo} onClick={props.onUndo}><Undo2 className="size-3.5" /></Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" disabled={!props.canRedo} onClick={props.onRedo}><Redo2 className="size-3.5" /></Button>
      <Button size="sm" className="btn-gold rounded-lg font-bold text-luxury-black" disabled={props.busy} onClick={props.onSave}><Save className="size-3.5" /> Save</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onExport("png")}><Download className="size-3.5" /> PNG</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onExport("pdf")}>PDF</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onExport("project")}>Project</Button>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onAdd("text")}><Type className="size-3.5" /> Text</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onAdd("shape")}><Square className="size-3.5" /> Shape</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onAdd("image")}><ImageIcon className="size-3.5" /> Image</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onAdd("icon")}><Star className="size-3.5" /> Icon</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onAdd("logo")}><Layers className="size-3.5" /> Logo</Button>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={props.onBrandPanel}><Palette className="size-3.5" /> Brand Kit</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-premium-gold/20 text-premium-gold-light" onClick={() => props.onAiEdit("enhance")}><Wand2 className="size-3.5" /> Enhance</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onAiEdit("background_removal")}>Remove BG</Button>
      <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => props.onAiEdit("upscale")}>Upscale</Button>
    </div>
  );
}
