"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { EditorScenePreview } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
import { overlaysOf } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

function isSvgUrl(url?: string) {
  if (!url) return false;
  return url.includes("image/svg") || url.endsWith(".svg") || url.startsWith("data:image/svg");
}

export function EditorPreview({
  scene,
  preview,
  compositeUrl,
  playhead,
  onPlayhead,
}: {
  scene: Scene | null;
  preview: EditorScenePreview | null;
  compositeUrl?: string | null;
  playhead: number;
  onPlayhead: (sec: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const playableUrl =
    preview?.hasPlayable && preview.url && !isSvgUrl(preview.url)
      ? preview.url
      : compositeUrl && !isSvgUrl(compositeUrl)
        ? compositeUrl
        : null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (Math.abs(el.currentTime - playhead) > 0.35) el.currentTime = playhead;
  }, [playhead, playableUrl]);

  return (
    <section className="flex min-h-[280px] flex-1 flex-col bg-black/40">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {playableUrl ? (
          <>
            <video
              ref={videoRef}
              className="max-h-[420px] w-full bg-black object-contain"
              src={playableUrl}
              playsInline
              onTimeUpdate={(event) => onPlayhead(event.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {scene &&
              overlaysOf(scene)
                .filter((overlay) => overlay.enabled && playhead >= overlay.startSec && playhead <= overlay.endSec)
                .map((overlay) => (
                  <div
                    key={overlay.id}
                    className="pointer-events-none absolute max-w-[80%] text-white drop-shadow"
                    style={{
                      left: `${overlay.xPct}%`,
                      top: `${overlay.yPct}%`,
                      fontSize: overlay.fontSize,
                      textAlign: overlay.align,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {overlay.text}
                  </div>
                ))}
          </>
        ) : (
          <div className="max-w-xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-gold/80">Scene preview</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{scene?.visualStyle || "Storyboard"}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {scene?.prompt || "Select a scene to preview its storyboard. SVG is not treated as video."}
            </p>
            <p className="mt-4 text-xs text-white/40">
              {scene?.camera.move} · {scene?.duration.toFixed(1)}s · {scene?.status}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-white/10 px-3 py-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/15"
          onClick={() => {
            const el = videoRef.current;
            if (!el) return;
            if (el.paused) void el.play();
            else el.pause();
          }}
          disabled={!playableUrl}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <input
          type="range"
          min={0}
          max={Math.max(preview?.durationSec || scene?.duration || 1, 1)}
          step={0.1}
          value={playhead}
          onChange={(event) => {
            const next = Number(event.target.value);
            onPlayhead(next);
            if (videoRef.current) videoRef.current.currentTime = next;
          }}
          className="flex-1 accent-premium-gold"
        />
        <span className="w-24 text-right text-xs tabular-nums text-white/60">
          {playhead.toFixed(1)}s / {(preview?.durationSec || scene?.duration || 0).toFixed(1)}s
        </span>
      </div>
    </section>
  );
}
