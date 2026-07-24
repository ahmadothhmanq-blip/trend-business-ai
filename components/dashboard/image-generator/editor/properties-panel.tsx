"use client";

import { Input } from "@/components/ui/input";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { CanvasElement } from "@/lib/ai-core/image-design-platform/editor/types";

export function PropertiesPanel(props: {
  element: CanvasElement | null;
  onChange: (patch: Partial<CanvasElement>) => void;
}) {
  const p = useProductT("imageGenerator");
  const el = props.element;
  if (!el) {
    return <p className="text-sm text-white/40">{p("editor.properties.selectElement")}</p>;
  }

  const t = el.transform;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{p("editor.properties.title", { name: el.name })}</p>
      <div className="grid grid-cols-2 gap-2">
        {(["x", "y", "width", "height", "rotation", "opacity"] as const).map((key) => (
          <div key={key}>
            <label className="mb-1 block text-[10px] uppercase text-white/40">{key}</label>
            <Input
              type="number"
              step={key === "opacity" ? 0.1 : 1}
              value={t[key]}
              onChange={(e) =>
                props.onChange({
                  transform: { ...t, [key]: Number(e.target.value) },
                } as Partial<CanvasElement>)
              }
              className="h-8 rounded-lg border-white/10 bg-white/5 text-xs"
            />
          </div>
        ))}
      </div>

      {el.type === "text" && (
        <div className="space-y-2">
          <label className="block text-[10px] uppercase text-white/40">{p("editor.properties.content")}</label>
          <Input value={el.content} onChange={(e) => props.onChange({ content: e.target.value } as Partial<CanvasElement>)} className="rounded-lg border-white/10 bg-white/5 text-xs" />
          <label className="block text-[10px] uppercase text-white/40">{p("editor.properties.fontFamily")}</label>
          <Input value={el.fontFamily} onChange={(e) => props.onChange({ fontFamily: e.target.value } as Partial<CanvasElement>)} className="rounded-lg border-white/10 bg-white/5 text-xs" />
          <label className="block text-[10px] uppercase text-white/40">{p("editor.properties.fontSize")}</label>
          <Input type="number" value={el.fontSize} onChange={(e) => props.onChange({ fontSize: Number(e.target.value) } as Partial<CanvasElement>)} className="rounded-lg border-white/10 bg-white/5 text-xs" />
          <label className="block text-[10px] uppercase text-white/40">{p("editor.properties.color")}</label>
          <Input value={el.color} onChange={(e) => props.onChange({ color: e.target.value } as Partial<CanvasElement>)} className="rounded-lg border-white/10 bg-white/5 text-xs" />
          <label className="block text-[10px] uppercase text-white/40">{p("editor.properties.alignment")}</label>
          <select
            value={el.align}
            onChange={(e) => props.onChange({ align: e.target.value as "left" | "center" | "right" } as Partial<CanvasElement>)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white"
          >
            <option value="left">{p("editor.properties.alignLeft")}</option>
            <option value="center">{p("editor.properties.alignCenter")}</option>
            <option value="right">{p("editor.properties.alignRight")}</option>
          </select>
        </div>
      )}

      {(el.type === "shape" || el.type === "background") && (
        <div>
          <label className="mb-1 block text-[10px] uppercase text-white/40">{p("editor.properties.fill")}</label>
          <Input value={el.fill} onChange={(e) => props.onChange({ fill: e.target.value } as Partial<CanvasElement>)} className="rounded-lg border-white/10 bg-white/5 text-xs" />
        </div>
      )}
    </div>
  );
}
