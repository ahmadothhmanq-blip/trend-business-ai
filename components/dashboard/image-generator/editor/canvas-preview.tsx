"use client";

import type { CSSProperties } from "react";
import type { CanvasElement, CanvasLayer } from "@/lib/ai-core/image-design-platform/editor/types";

export function CanvasPreview(props: {
  width: number;
  height: number;
  backgroundColor: string;
  layers: CanvasLayer[];
  selectedElementIds: string[];
  onSelectElement: (id: string) => void;
}) {
  const scale = Math.min(1, 720 / props.width, 520 / props.height);
  const viewW = props.width * scale;
  const viewH = props.height * scale;

  const renderElement = (el: CanvasElement) => {
    const t = el.transform;
    const selected = props.selectedElementIds.includes(el.id);
    const base: CSSProperties = {
      position: "absolute",
      left: t.x * scale,
      top: t.y * scale,
      width: t.width * scale,
      height: t.height * scale,
      transform: `rotate(${t.rotation}deg)`,
      opacity: t.opacity,
      outline: selected ? "2px solid #C9A227" : undefined,
      cursor: "pointer",
    };

    if (el.type === "background") {
      return (
        <div
          key={el.id}
          style={{ ...base, background: el.gradient || el.fill, left: 0, top: 0, width: viewW, height: viewH }}
          onClick={() => props.onSelectElement(el.id)}
        />
      );
    }
    if (el.type === "text") {
      return (
        <div
          key={el.id}
          style={{
            ...base,
            color: el.color,
            fontFamily: el.fontFamily,
            fontSize: el.fontSize * scale,
            fontWeight: el.fontWeight,
            textAlign: el.align,
            lineHeight: el.lineHeight,
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => props.onSelectElement(el.id)}
        >
          {el.content}
        </div>
      );
    }
    if (el.type === "shape") {
      return (
        <div
          key={el.id}
          style={{
            ...base,
            background: el.fill,
            border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
            borderRadius: el.shape === "circle" ? "50%" : el.cornerRadius,
          }}
          onClick={() => props.onSelectElement(el.id)}
        />
      );
    }
    if (el.type === "image" || el.type === "logo") {
      const src = el.type === "image" ? el.src : el.svg ? `data:image/svg+xml,${encodeURIComponent(el.svg)}` : el.src;
      if (!src) {
        return (
          <div key={el.id} style={{ ...base, background: "rgba(255,255,255,0.08)" }} onClick={() => props.onSelectElement(el.id)} />
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={el.id} src={src} alt={el.name} style={{ ...base, objectFit: el.type === "image" ? el.fit : "contain" }} onClick={() => props.onSelectElement(el.id)} />
      );
    }
    if (el.type === "icon") {
      return (
        <div key={el.id} style={{ ...base, color: el.color, fontSize: t.height * scale * 0.6, display: "grid", placeItems: "center" }} onClick={() => props.onSelectElement(el.id)}>
          ★
        </div>
      );
    }
    return null;
  };

  const sortedLayers = [...props.layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="flex items-center justify-center rounded-xl border border-white/10 bg-black/30 p-4">
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{ width: viewW, height: viewH, background: props.backgroundColor }}
      >
        {sortedLayers.map((layer) =>
          layer.visible ? layer.elements.map((el) => renderElement(el)) : null,
        )}
      </div>
    </div>
  );
}
