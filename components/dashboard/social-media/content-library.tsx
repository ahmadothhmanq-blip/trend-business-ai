"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SocialPost } from "@/types/social-media";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (post: SocialPost) => void;
  selectedId?: string | null;
};

export function ContentLibrary({ onSelect, selectedId }: Props) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites" | "draft">("all");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ limit: "50" });
    if (filter === "favorites") params.set("favorite", "true");
    if (filter === "draft") params.set("status", "draft");
    const res = await fetch(`/api/social-media/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleFavorite = async (post: SocialPost) => {
    await fetch(`/api/social-media/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !post.is_favorite }),
    });
    void load();
  };

  const duplicate = async (post: SocialPost) => {
    const res = await fetch(`/api/social-media/posts/${post.id}`, { method: "POST" });
    const data = await res.json();
    if (data.post) onSelect(data.post);
    void load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/social-media/posts/${id}`, { method: "DELETE" });
    void load();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(["all", "favorites", "draft"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-xs capitalize",
              filter === f ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="max-h-[420px] space-y-1 overflow-y-auto">
        {posts.map((post) => (
          <div
            key={post.id}
            className={cn(
              "group flex items-center gap-1 rounded-lg px-2 py-2",
              selectedId === post.id ? "bg-premium-gold/10" : "hover:bg-white/5",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(post)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm text-white/80">{post.title}</p>
              <p className="text-xs capitalize text-white/40">{post.platform} · {post.status}</p>
            </button>
            <button type="button" onClick={() => void toggleFavorite(post)} className="opacity-0 group-hover:opacity-100">
              <Star className={cn("size-3.5", post.is_favorite ? "fill-premium-gold text-premium-gold" : "text-white/30")} />
            </button>
            <button type="button" onClick={() => void duplicate(post)} className="opacity-0 group-hover:opacity-100">
              <Copy className="size-3.5 text-white/30" />
            </button>
            <button type="button" onClick={() => void remove(post.id)} className="opacity-0 group-hover:opacity-100">
              <Trash2 className="size-3.5 text-white/30" />
            </button>
          </div>
        ))}
        {posts.length === 0 && <p className="py-6 text-center text-xs text-white/30">No posts yet</p>}
      </div>
    </div>
  );
}
