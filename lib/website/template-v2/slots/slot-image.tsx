"use client";

import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import {
  SLOT_LABELS,
  isBuilderEditorContext,
  resolveSlotImageStrict,
} from "@/lib/website/template-v2/slots/slot-utils";

export type SlotImageProps = {
  slot: ImageSlotKind;
  index?: number;
  preferred?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
};

/**
 * Image-independent template image: resolves a semantic slot only.
 * Renders nothing in production when unfilled (parents collapse layout).
 * Shows a labeled placeholder in the Website Builder editor only.
 */
export function SlotImage({
  slot,
  index = 0,
  preferred,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
  loading = "lazy",
  width,
  height,
}: SlotImageProps) {
  const src = resolveSlotImageStrict(slot, index, preferred);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : loading}
        fetchPriority={priority ? "high" : undefined}
        width={width}
        height={height}
      />
    );
  }

  const editor = isBuilderEditorContext();
  if (!editor) {
    return null;
  }

  const shellClass = [
    containerClassName || className,
    "df-slot-empty",
    editor
      ? "border border-dashed border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={shellClass}
      aria-hidden={!editor}
      data-slot-empty={slot}
      data-slot-index={index}
      role={editor ? "img" : undefined}
      aria-label={editor ? alt || SLOT_LABELS[slot] : undefined}
    >
      {editor ? (
        <div className="relative z-[1] flex h-full min-h-[inherit] w-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {SLOT_LABELS[slot]}
          </span>
          <span className="text-[0.5625rem] text-[var(--color-muted)] opacity-70">
            Slot {index + 1}
          </span>
        </div>
      ) : null}
    </div>
  );
}
