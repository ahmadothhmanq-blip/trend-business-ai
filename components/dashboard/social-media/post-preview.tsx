"use client";

import type { SocialPost, SocialPostPlatform } from "@/types/social-media";
import { cn } from "@/lib/utils";
import { Hash, MessageSquare } from "lucide-react";

const PLATFORM_LABELS: Record<SocialPostPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  tiktok: "TikTok",
};

type Props = {
  post: Partial<SocialPost>;
  className?: string;
};

export function PostPreviewPanel({ post, className }: Props) {
  const platform = post.platform ?? "instagram";
  const text = post.caption || post.post_text || "";
  const hashtags = post.hashtags ?? [];

  return (
    <div className={cn("rounded-xl border border-white/[0.08] bg-white/[0.02] p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-premium-gold/80">
          {PLATFORM_LABELS[platform]} Preview
        </span>
        {post.recommended_post_time && (
          <span className="text-xs text-white/40">Best time: {post.recommended_post_time}</span>
        )}
      </div>

      {post.media_url ? (
        <div
          className="mb-3 flex items-center justify-center rounded-lg bg-white/5 text-xs text-white/30"
          style={{
            aspectRatio: post.media_width && post.media_height
              ? `${post.media_width}/${post.media_height}`
              : "1/1",
            maxHeight: 280,
          }}
        >
          Media attached
        </div>
      ) : (
        <div className="mb-3 flex aspect-square max-h-[200px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] text-xs text-white/30">
          No visual — use Generate Visual
        </div>
      )}

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{text || "Post preview will appear here…"}</p>

      {hashtags.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-1 text-xs text-premium-gold/70">
          <Hash className="mt-0.5 size-3 shrink-0" />
          {hashtags.map((h) => (
            <span key={h}>#{h.replace(/^#/, "")}</span>
          ))}
        </p>
      )}

      {post.cta && (
        <p className="mt-3 rounded-lg bg-premium-gold/10 px-3 py-2 text-sm font-medium text-premium-gold-light">
          {post.cta}
        </p>
      )}

      {post.content_angle && (
        <p className="mt-3 flex items-start gap-2 text-xs text-white/40">
          <MessageSquare className="mt-0.5 size-3 shrink-0" />
          Angle: {post.content_angle}
        </p>
      )}
    </div>
  );
}
