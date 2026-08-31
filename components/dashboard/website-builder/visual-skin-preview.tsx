"use client";

import { useEffect, useRef, useState } from "react";

import { getVisualSkin } from "@/lib/website/visual-skin/registry";
import { buildSkinPreviewAppPath } from "@/lib/website/visual-skin/skin-preview-url";
import { cn } from "@/lib/utils";

type VisualSkinPreviewProps = {
  skinId: string;
  className?: string;
  /** Hide the meta footer (label/swatches) — catalog chrome supplies it. */
  hideFooter?: boolean;
};

type PreviewState = "idle" | "loading" | "ready" | "missing" | "error";

/** Design viewport for catalog thumbs — narrower than full desktop so scale stays readable in cards. */
const PREVIEW_WIDTH = 960;
const PREVIEW_HEIGHT = 720;

/**
 * Catalog thumbnail — real template HTML (same pipeline as project apply).
 * Uses srcDoc (not blob:/iframe URL) so CSP + X-Frame-Options cannot blank the frame.
 * Scale is inline — Tailwind scale-* utilities are not emitted in this app build.
 */
export function VisualSkinPreview({
  skinId,
  className,
  hideFooter = false,
}: VisualSkinPreviewProps) {
  const skin = getVisualSkin(skinId);
  const previewPath = skin ? buildSkinPreviewAppPath(skin.id) : null;
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0.25);
  const [state, setState] = useState<PreviewState>("idle");
  const [srcDoc, setSrcDoc] = useState<string | null>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / PREVIEW_WIDTH);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !previewPath) {
      if (!previewPath) setState("error");
      return;
    }

    let cancelled = false;
    setState("loading");
    setSrcDoc(null);

    fetch(previewPath, { credentials: "same-origin" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 409) {
          setState("missing");
          return;
        }
        if (!res.ok) {
          setState("error");
          return;
        }
        const html = await res.text();
        if (cancelled) return;
        if (!html.includes("<html") && !html.includes("<!DOCTYPE")) {
          setState("error");
          return;
        }
        setSrcDoc(html);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [visible, previewPath]);

  if (!skin) return null;

  const swatchColors = [
    skin.tokens.primary,
    skin.tokens.accent,
    skin.tokens.signal ?? skin.tokens.secondary,
  ];

  const statusCopy =
    state === "missing"
      ? "المعاينة غير جاهزة لهذا القالب بعد."
      : state === "error"
        ? "تعذر تحميل المعاينة."
        : state === "loading" || state === "idle"
          ? "جاري تحميل المعاينة…"
          : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-black/20",
        className,
      )}
    >
      <div
        ref={frameRef}
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ background: skin.tokens.background }}
      >
        {srcDoc ? (
          <iframe
            title={`${skin.label} template preview`}
            srcDoc={srcDoc}
            className="pointer-events-none absolute left-0 top-0 border-0 bg-transparent"
            style={{
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : null}

        {state !== "ready" ? (
          <div
            className="absolute inset-0 z-[1] flex flex-col justify-between p-4"
            style={{ color: skin.tokens.foreground }}
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-tight">{skin.label}</p>
              <p className="max-w-[32ch] text-[10px] leading-relaxed opacity-55">
                {statusCopy ?? skin.description}
              </p>
            </div>
            <div className="flex gap-2">
              {swatchColors.map((color) => (
                <span
                  key={color}
                  className="h-8 flex-1 rounded-md border border-white/10"
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {!hideFooter ? (
        <div
          className="flex items-center justify-between gap-2 border-t px-3 py-2"
          style={{
            borderColor: `${skin.tokens.foreground}12`,
            background: skin.tokens.background,
            color: skin.tokens.foreground,
          }}
        >
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold">{skin.label}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            {[skin.tokens.primary, skin.tokens.accent].map((color) => (
              <span
                key={color}
                className="size-3 rounded-full border border-white/10"
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
