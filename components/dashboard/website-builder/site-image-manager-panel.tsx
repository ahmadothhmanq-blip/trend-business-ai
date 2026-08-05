"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Crop,
  ImageIcon,
  Loader2,
  Move,
  RefreshCw,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import { IMAGE_SLOT_KINDS } from "@/lib/ai-core/image-engine/slots";
import type { ManagedSiteImage } from "@/lib/website/image-management/operations";
import {
  optimizeImageFile,
  type ClientOptimizeOptions,
} from "@/lib/website/image-management/client-optimize";
import { MediaLibraryPanel } from "@/components/dashboard/website-builder/media-library-panel";
import type { WebsiteMediaAsset } from "@/lib/ai-core/website-management/types";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type SiteImageManagerPanelProps = {
  generationId: string;
  disabled?: boolean;
  onProjectUpdated?: (project: unknown) => void;
  className?: string;
};

type SlotGroup = {
  kind: ImageSlotKind;
  images: ManagedSiteImage[];
};

const SLOT_LABELS: Record<ImageSlotKind, string> = {
  hero: "Hero",
  gallery: "Gallery",
  about: "About",
  features: "Features",
  team: "Team",
  products: "Products",
  testimonials: "Testimonials",
  backgrounds: "Backgrounds",
  cta: "CTA",
};

export function SiteImageManagerPanel({
  generationId,
  disabled,
  onProjectUpdated,
  className,
}: SiteImageManagerPanelProps) {
  const { wb } = useBuilderLocale();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [industry, setIndustry] = useState("");
  const [images, setImages] = useState<ManagedSiteImage[]>([]);
  const [validation, setValidation] = useState<{
    passed: boolean;
    issues: string[];
    uniqueUrlCount: number;
  } | null>(null);
  const [selected, setSelected] = useState<ManagedSiteImage | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [positionDraft, setPositionDraft] = useState("center");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [cropAspect, setCropAspect] =
    useState<ClientOptimizeOptions["cropAspect"]>("free");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/site-images`);
      const json = await res.json();
      if (res.ok) {
        setImages(json.images ?? []);
        setIndustry(json.industry ?? "");
        setValidation(json.validation ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups: SlotGroup[] = IMAGE_SLOT_KINDS.map((kind) => ({
    kind,
    images: images.filter((img) => img.slot === kind && img.url),
  })).filter((g) => g.images.length > 0);

  async function runOperation(
    request: Record<string, unknown>,
    closeOnSuccess = false,
  ) {
    setBusy(true);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/site-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Operation failed");
      setImages(json.images ?? []);
      if (json.project) onProjectUpdated?.(json.project);
      if (closeOnSuccess) setSelected(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(files: FileList | File[], target?: ManagedSiteImage) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    for (let i = 0; i < list.length; i += 1) {
      const file = list[i]!;
      const optimized = await optimizeImageFile(file, {
        maxWidth: 1920,
        quality: 0.85,
        format: "webp",
        cropAspect,
      });
      const form = new FormData();
      form.append("file", optimized.blob, optimized.filename);
      form.append("folder", "site-images");
      const uploadRes = await fetch(`/api/website-builder/${generationId}/media`, {
        method: "POST",
        body: form,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.asset?.url) continue;

      const slotTarget =
        target ??
        images.find((img) => img.slot === "gallery" && !img.isUserOverride) ??
        images[0];
      if (!slotTarget) continue;

      const imageId =
        list.length > 1 && slotTarget.slot === "gallery"
          ? `gallery-${images.filter((img) => img.slot === "gallery").length + i + 1}`
          : slotTarget.id;

      await runOperation({
        action: "upload",
        imageId,
        slot: slotTarget.slot,
        url: uploadJson.asset.url,
        alt: slotTarget.alt,
      });
    }
  }

  function openEditor(image: ManagedSiteImage) {
    setSelected(image);
    setAltDraft(image.alt);
    setPositionDraft(image.objectPosition ?? "center");
    setGeneratePrompt(`${industry} ${image.slot} photography`);
  }

  return (
    <div className={cn("flex h-full flex-col gap-3", className)}>
      <div
        className={cn(
          "rounded-xl border border-dashed p-4 text-center transition",
          dragOver
            ? "border-premium-gold/60 bg-premium-gold/5"
            : "border-white/10 bg-white/[0.02]",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          void uploadFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="mx-auto mb-2 size-5 text-white/40" />
        <p className="text-xs text-white/60">
          Drag & drop images here, or upload multiple files
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void uploadFiles(e.target.files, selected ?? undefined);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="border-white/15 text-white"
            disabled={disabled || busy}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-1 size-3.5" />
            Multi upload
          </Button>
        </div>
      </div>

      {validation && !validation.passed ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
          Image validation: {validation.issues.slice(0, 2).join(" · ") || "Issues detected"}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-white/40">
          <Loader2 className="size-4 animate-spin" />
          Loading images…
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <section key={group.kind}>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                {SLOT_LABELS[group.kind]}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {group.images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => openEditor(image)}
                    className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-black/30 text-left transition hover:border-premium-gold/40"
                  >
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={image.alt}
                        width={320}
                        height={180}
                        unoptimized
                        className="aspect-video w-full object-cover"
                        style={{
                          objectPosition: image.objectPosition ?? "center",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center text-white/30">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="truncate text-[10px] text-white/70">{image.id}</p>
                      {image.isUserOverride ? (
                        <p className="text-[9px] text-premium-gold/80">Custom</p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg border-white/10 bg-[#0f1118] text-white">
          <DialogHeader>
            <DialogTitle>
              Edit {selected ? SLOT_LABELS[selected.slot] : "image"}
            </DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              {selected.url ? (
                <Image
                  src={selected.url}
                  alt={selected.alt}
                  width={640}
                  height={360}
                  unoptimized
                  className="w-full rounded-lg object-cover"
                  style={{ objectPosition: positionDraft }}
                />
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-1 size-3.5" />
                  Upload
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15"
                  disabled={busy}
                  onClick={() => setLibraryOpen(true)}
                >
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15"
                  disabled={busy}
                  onClick={() =>
                    void runOperation({
                      action: "generate",
                      imageId: selected.id,
                      slot: selected.slot,
                      generatePrompt,
                    })
                  }
                >
                  <Sparkles className="mr-1 size-3.5" />
                  AI Generate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15"
                  disabled={busy}
                  onClick={() =>
                    void runOperation({
                      action: "restore-default",
                      imageId: selected.id,
                      slot: selected.slot,
                    })
                  }
                >
                  <RefreshCw className="mr-1 size-3.5" />
                  Restore default
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15"
                  disabled={busy}
                  onClick={() =>
                    void runOperation({
                      action: "delete",
                      imageId: selected.id,
                      slot: selected.slot,
                    }, true)
                  }
                >
                  <Trash2 className="mr-1 size-3.5" />
                  Delete
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Crop aspect</Label>
                <div className="flex gap-2">
                  {(["free", "1:1", "16:9", "4:5"] as const).map((aspect) => (
                    <Button
                      key={aspect}
                      size="sm"
                      variant={cropAspect === aspect ? "default" : "outline"}
                      className="border-white/15"
                      onClick={() => setCropAspect(aspect)}
                    >
                      <Crop className="mr-1 size-3" />
                      {aspect}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Reposition</Label>
                <div className="flex gap-2">
                  <Input
                    value={positionDraft}
                    onChange={(e) => setPositionDraft(e.target.value)}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="center top"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15"
                    disabled={busy}
                    onClick={() =>
                      void runOperation({
                        action: "reposition",
                        imageId: selected.id,
                        slot: selected.slot,
                        objectPosition: positionDraft,
                      })
                    }
                  >
                    <Move className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">AI prompt</Label>
                <Textarea
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  className="border-white/10 bg-white/5 text-white"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Alt text</Label>
                <div className="flex gap-2">
                  <Input
                    value={altDraft}
                    onChange={(e) => setAltDraft(e.target.value)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15"
                    disabled={busy}
                    onClick={() =>
                      void runOperation({
                        action: "edit-alt",
                        imageId: selected.id,
                        slot: selected.slot,
                        alt: altDraft,
                      })
                    }
                  >
                    <Type className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#0f1118] text-white">
          <DialogHeader>
            <DialogTitle>{wb("builder.media.title")}</DialogTitle>
          </DialogHeader>
          <MediaLibraryPanel
            generationId={generationId}
            onSelect={(asset: WebsiteMediaAsset) => {
              if (!selected) return;
              void runOperation({
                action: "replace",
                imageId: selected.id,
                slot: selected.slot,
                url: asset.url,
                alt: asset.alt || selected.alt,
              });
              setLibraryOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
