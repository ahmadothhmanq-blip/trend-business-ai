"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FolderOpen, Loader2, Search, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WebsiteMediaAsset } from "@/lib/ai-core/website-management/types";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";
import { useTranslation } from "@/lib/i18n/client";
import { optimizeImageFile } from "@/lib/website/image-management/client-optimize";

type MediaLibraryPanelProps = {
  generationId: string;
  onSelect?: (asset: WebsiteMediaAsset) => void;
  compact?: boolean;
  className?: string;
};

export function MediaLibraryPanel({
  generationId,
  onSelect,
  compact,
  className,
}: MediaLibraryPanelProps) {
  const { wb } = useBuilderLocale();
  const { t } = useTranslation();
  const [assets, setAssets] = useState<WebsiteMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("uploads");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder) params.set("folder", folder);
      if (query) params.set("q", query);
      const res = await fetch(
        `/api/website-builder/${generationId}/media?${params}`,
      );
      const json = await res.json();
      if (res.ok) setAssets(json.assets || []);
    } finally {
      setLoading(false);
    }
  }, [generationId, folder, query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const optimized = await optimizeImageFile(file, {
        maxWidth: 1920,
        quality: 0.85,
        format: "webp",
      });
      const form = new FormData();
      form.append("file", optimized.blob, optimized.filename);
      form.append("folder", folder);
      const res = await fetch(`/api/website-builder/${generationId}/media`, {
        method: "POST",
        body: form,
      });
      if (res.ok) await load();
    } finally {
      setUploading(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of list) {
      await uploadFile(file);
    }
  }

  async function removeAsset(id: string) {
    await fetch(
      `/api/website-builder/${generationId}/media?assetId=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    await load();
  }

  return (
    <div
      className={cn("space-y-3", className)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
      }}
    >
      <div
        className={cn(
          "rounded-lg border border-dashed p-2 text-center text-[10px] text-white/45 transition",
          dragOver && "border-premium-gold/50 bg-premium-gold/5",
        )}
      >
        Drag & drop images to upload (WebP optimized)
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[140px] flex-1">
          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={wb("builder.media.searchPlaceholder")}
            className="h-8 border-white/10 bg-white/5 pl-8 text-white"
          />
        </div>
        <Input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder={wb("builder.media.title")}
          className="h-8 w-28 border-white/10 bg-white/5 text-white"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          size="sm"
          variant="outline"
          className="border-white/15 text-white"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {uploading ? wb("builder.media.uploading") : wb("builder.media.upload")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-white/40">
          <Loader2 className="size-4 animate-spin" />
          {t("common.loading")}
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-white/40">
          <FolderOpen className="mx-auto mb-2 size-6 opacity-40" />
          {wb("builder.media.empty")}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-2",
            compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
          )}
        >
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/30"
            >
              {asset.mime.startsWith("image/") ? (
                <Image
                  src={asset.url}
                  alt={asset.alt || asset.filename}
                  width={640}
                  height={360}
                  unoptimized
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-xs text-white/40">
                  {asset.mime}
                </div>
              )}
              <div className="p-2">
                <p className="truncate text-[11px] text-white/70">
                  {asset.filename}
                </p>
                <p className="text-[10px] text-white/30">{asset.folder}</p>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                {onSelect ? (
                  <Button
                    size="sm"
                    className="h-7 flex-1 bg-premium-gold text-[10px] text-black"
                    onClick={() => onSelect(asset)}
                  >
                    {wb("builder.blocks.insert")}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 border-red-500/30 px-2 text-red-300"
                  onClick={() => void removeAsset(asset.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
