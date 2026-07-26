"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
  Copy,
  GripVertical,
  ImageIcon,
  Loader2,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  buildVisualDocument,
  createVisualHistory,
  deleteNode,
  documentToSaveActions,
  duplicateNode,
  insertMarketplaceComponent,
  moveNode,
  pushVisualHistory,
  redoVisualHistory,
  selectNode,
  setViewport,
  undoVisualHistory,
  updateNodeText,
  updateNodeImage,
  updateTokens,
  type VisualDocument,
  type VisualHistoryState,
  type VisualNode,
  type VisualNodeKind,
  type VisualViewport,
} from "@/lib/ai-core/visual-editor";
import type { MarketplaceComponent } from "@/lib/ai-core/component-marketplace";
import {
  ComponentLibraryPanel,
  decodeComponentDrag,
  DRAG_MIME,
} from "@/components/dashboard/visual-editor/component-library-panel";
import { MediaLibraryPanel } from "@/components/dashboard/website-builder/media-library-panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function kindFromSectionKind(kind: string): VisualNodeKind {
  if (kind === "hero") return "hero";
  if (kind === "header") return "header";
  if (kind === "footer") return "footer";
  if (kind === "cta") return "cta";
  if (kind === "testimonials" || kind === "brand-trust" || kind === "case-studies") {
    return "proof";
  }
  if (kind.includes("gallery") || kind === "video") return "media";
  return "section";
}

const VIEWPORT_WIDTH: Record<VisualViewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

type VisualWebsiteEditorProps = {
  generationId: string;
  files: GeneratedProjectFile[];
  project?: GeneratedWebsiteProject | null;
  disabled?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
};

export function VisualWebsiteEditor({
  generationId,
  files,
  project,
  disabled,
  onDirtyChange,
  onSaved,
}: VisualWebsiteEditorProps) {
  const pt = useProductT("visualEditor");
  const initial = useMemo(
    () =>
      buildVisualDocument({
        generationId,
        files,
        project,
      }),
    [generationId, files, project],
  );

  const [baseline, setBaseline] = useState<VisualDocument>(initial);
  const [history, setHistory] = useState<VisualHistoryState>(() =>
    createVisualHistory(initial),
  );
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropAspect, setCropAspect] = useState<"free" | "1:1" | "16:9">("free");
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function optimizeAndUpload(file: File) {
    if (!selected) return;
    setUploadingImage(true);
    try {
      const optimized = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const maxW = 1920;
          const scale = Math.min(1, maxW / img.width);
          let sw = img.width;
          let sh = img.height;
          let sx = 0;
          let sy = 0;
          if (cropAspect === "1:1") {
            const side = Math.min(img.width, img.height);
            sw = side;
            sh = side;
            sx = (img.width - side) / 2;
            sy = (img.height - side) / 2;
          } else if (cropAspect === "16:9") {
            const target = img.width / (16 / 9);
            if (target <= img.height) {
              sh = target;
              sy = (img.height - target) / 2;
            } else {
              sw = img.height * (16 / 9);
              sx = (img.width - sw) / 2;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(sw * scale);
          canvas.height = Math.round(sh * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas unavailable"));
            return;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Optimize failed"))),
            "image/webp",
            0.85,
          );
        };
        img.onerror = () => reject(new Error("Invalid image"));
        img.src = url;
      });

      const form = new FormData();
      form.append("file", optimized, file.name.replace(/\.\w+$/, ".webp"));
      form.append("folder", "editor");
      const res = await fetch(`/api/website-builder/${generationId}/media`, {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as { asset?: { url?: string }; error?: string };
      if (!res.ok || !json.asset?.url) {
        throw new Error(json.error || "Upload failed");
      }
      commit(
        updateNodeImage(doc, selected.id, json.asset.url),
        pt("history.replaceImage"),
      );
      toast.success(pt("toasts.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pt("toasts.saveFailed"));
    } finally {
      setUploadingImage(false);
    }
  }

  // Rebuild when generation / files change
  useEffect(() => {
    const doc = buildVisualDocument({ generationId, files, project });
    setBaseline(doc);
    setHistory(createVisualHistory(doc));
  }, [generationId, files, project]);

  const doc = history.present;
  const selected =
    doc.nodes.find((n) => n.id === doc.selectedNodeId) || doc.nodes[0] || null;

  useEffect(() => {
    onDirtyChange?.(doc.dirty);
  }, [doc.dirty, onDirtyChange]);

  useEffect(() => {
    if (!doc.dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [doc.dirty]);

  const commit = useCallback((next: VisualDocument, label: string) => {
    setHistory((h) => pushVisualHistory(h, next, label));
  }, []);

  const onUndo = () => setHistory((h) => undoVisualHistory(h));
  const onRedo = () => setHistory((h) => redoVisualHistory(h));

  const onDrop = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }
    commit(moveNode(doc, dragIndex, toIndex), pt("history.moveSection"));
    setDragIndex(null);
  };

  const insertFromLibrary = (component: MarketplaceComponent, index?: number) => {
    commit(
      insertMarketplaceComponent(doc, {
        exportName: component.exportName,
        path: component.path,
        kind: kindFromSectionKind(component.sectionKind),
        label: component.name,
        text: component.name,
        index,
      }),
      pt("history.insert", { name: component.name }),
    );
    toast.message(pt("toasts.componentAdded", { name: component.name }));
  };

  const onCanvasLibraryDrop = (e: DragEvent, index?: number) => {
    const raw = e.dataTransfer.getData(DRAG_MIME);
    if (!raw) return;
    e.preventDefault();
    const payload = decodeComponentDrag(raw);
    if (!payload) return;
    commit(
      insertMarketplaceComponent(doc, {
        exportName: payload.exportName,
        path: payload.path,
        kind: kindFromSectionKind(payload.sectionKind),
        label: payload.name,
        text: payload.name,
        index,
      }),
      pt("history.insert", { name: payload.name }),
    );
    toast.message(pt("toasts.componentAdded", { name: payload.name }));
  };

  const save = async () => {
    if (!doc.dirty) {
      toast.message(pt("toasts.noChanges"));
      return;
    }
    const actions = documentToSaveActions(baseline, doc);
    if (!actions.length) {
      toast.message(pt("toasts.nothingToPersist"));
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        `/api/website-builder/${generationId}/edit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actions, applyAi: false }),
        },
      );
      const data = (await response.json()) as {
        project?: GeneratedWebsiteProject;
        generation?: WebsiteGeneration;
        error?: string;
        editResult?: { summary?: string };
      };
      if (!response.ok || !data.project || !data.generation) {
        throw new Error(data.error || pt("toasts.saveError"));
      }
      const nextDoc = buildVisualDocument({
        generationId: data.generation.id,
        files: data.project.files,
        project: data.project,
      });
      setBaseline(nextDoc);
      setHistory(createVisualHistory(nextDoc));
      onSaved({ project: data.project, generation: data.generation });
      toast.success(data.editResult?.summary || pt("toasts.saved"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pt("toasts.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-[720px] flex-col bg-[#050505]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] px-3 py-2">
        <p className="mr-auto text-[12px] font-semibold text-white/70">
          {pt("title")}
          {doc.dirty ? (
            <span className="ml-2 text-premium-gold">{pt("unsaved")}</span>
          ) : null}
        </p>
        {(
          [
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ] as const
        ).map(([key, Icon]) => (
          <Button
            key={key}
            size="sm"
            variant={doc.viewport === key ? "default" : "outline"}
            className={cn(
              "h-8",
              doc.viewport === key
                ? "bg-premium-gold text-black"
                : "border-white/15 text-white",
            )}
            onClick={() =>
              setHistory((h) => ({
                ...h,
                present: setViewport(h.present, key),
              }))
            }
            disabled={disabled}
          >
            <Icon className="size-3.5" />
            {pt(`viewports.${key}`)}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="border-white/15 text-white"
          onClick={onUndo}
          disabled={disabled || !history.past.length}
        >
          <Undo2 className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/15 text-white"
          onClick={onRedo}
          disabled={disabled || !history.future.length}
        >
          <Redo2 className="size-3.5" />
        </Button>
        <Button
          size="sm"
          className="bg-premium-gold text-black hover:bg-premium-gold/90"
          onClick={() => void save()}
          disabled={disabled || saving || !doc.dirty}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          {pt("save")}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_200px_minmax(0,1fr)_260px]">
        {/* Component marketplace */}
        <aside className="border-r border-white/[0.08] bg-black/40 p-3">
          <ComponentLibraryPanel
            compact
            onInsert={(c) => insertFromLibrary(c)}
          />
        </aside>

        {/* Layers */}
        <aside className="border-r border-white/[0.08] bg-black/30 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            {pt("layers")}
          </p>
          <ul className="space-y-1">
            {doc.nodes.map((node, index) => (
              <li
                key={node.id}
                draggable={!node.locked && !disabled}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                  if (Array.from(e.dataTransfer.types).includes(DRAG_MIME)) {
                    onCanvasLibraryDrop(e, index);
                    return;
                  }
                  onDrop(index);
                }}
                onClick={() =>
                  setHistory((h) => ({
                    ...h,
                    present: selectNode(h.present, node.id),
                  }))
                }
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 text-[12px] transition-colors",
                  doc.selectedNodeId === node.id
                    ? "border-premium-gold/40 bg-premium-gold/10 text-white"
                    : "border-transparent text-white/55 hover:bg-white/[0.04]",
                )}
              >
                <GripVertical className="size-3.5 shrink-0 opacity-40" />
                <span className="min-w-0 flex-1 truncate">{node.label}</span>
                <span className="text-[9px] uppercase text-white/25">
                  {node.kind}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Canvas */}
        <div
          className="overflow-auto bg-[#080808] p-4"
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types).includes(DRAG_MIME)) {
              e.preventDefault();
            }
          }}
          onDrop={(e) => onCanvasLibraryDrop(e)}
        >
          <div className="mx-auto transition-all" style={{ width: VIEWPORT_WIDTH[doc.viewport], maxWidth: "100%" }}>
            <div
              className="overflow-hidden rounded-xl border border-white/10 shadow-2xl"
              style={{
                background: doc.tokens.background,
                color: doc.tokens.foreground,
                fontFamily: `"${doc.tokens.bodyFont}", system-ui, sans-serif`,
              }}
            >
              {doc.nodes.map((node, index) => (
                <CanvasBlock
                  key={node.id}
                  node={node}
                  tokens={doc.tokens}
                  selected={doc.selectedNodeId === node.id}
                  onSelect={() =>
                    setHistory((h) => ({
                      ...h,
                      present: selectNode(h.present, node.id),
                    }))
                  }
                  onTextChange={(text) =>
                    commit(updateNodeText(doc, node.id, text), pt("history.editText"))
                  }
                  onDragStart={() => setDragIndex(index)}
                  onDrop={(e) => {
                    if (
                      e?.dataTransfer &&
                      Array.from(e.dataTransfer.types).includes(DRAG_MIME)
                    ) {
                      onCanvasLibraryDrop(e, index);
                      return;
                    }
                    onDrop(index);
                  }}
                  disabled={disabled}
                />
              ))}
              {!doc.nodes.length ? (
                <div className="flex h-48 items-center justify-center text-sm text-white/40">
                  {pt("emptyCanvas")}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Properties */}
        <aside className="space-y-4 border-l border-white/[0.08] bg-black/30 p-3">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              {pt("properties")}
            </p>
            {selected ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-white/40">{pt("component")}</p>
                  <p className="text-sm font-semibold text-white">
                    {selected.label}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-white/40">{pt("canvasText")}</p>
                  <Input
                    value={selected.text || ""}
                    onChange={(e) =>
                      commit(
                        updateNodeText(doc, selected.id, e.target.value),
                        pt("history.editText"),
                      )
                    }
                    disabled={disabled || selected.locked}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder={pt("headlinePlaceholder")}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-white/40">{pt("imageUrl")}</p>
                  <Input
                    value={selected.imageUrl || ""}
                    onChange={(e) =>
                      commit(
                        updateNodeImage(doc, selected.id, e.target.value),
                        pt("history.replaceImage"),
                      )
                    }
                    disabled={disabled || selected.locked}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder={pt("imagePlaceholder")}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      value={cropAspect}
                      onChange={(e) =>
                        setCropAspect(e.target.value as "free" | "1:1" | "16:9")
                      }
                      className="h-8 rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
                      disabled={disabled || selected.locked}
                    >
                      <option value="free">Crop: Free</option>
                      <option value="1:1">Crop: 1:1</option>
                      <option value="16:9">Crop: 16:9</option>
                    </select>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void optimizeAndUpload(file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 text-white"
                      disabled={disabled || selected.locked || uploadingImage}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {uploadingImage ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      Upload
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 text-white"
                      disabled={disabled || selected.locked}
                      onClick={() => setMediaOpen(true)}
                    >
                      <ImageIcon className="size-3.5" />
                      Library
                    </Button>
                    {selected.imageUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 text-white"
                        disabled={disabled || selected.locked}
                        onClick={() =>
                          commit(
                            updateNodeImage(doc, selected.id, ""),
                            pt("history.replaceImage"),
                          )
                        }
                      >
                        <X className="size-3.5" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/15 text-white"
                    disabled={disabled || selected.locked}
                    onClick={() =>
                      commit(duplicateNode(doc, selected.id), pt("history.duplicate"))
                    }
                  >
                    <Copy className="size-3.5" />
                    {pt("duplicate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-300"
                    disabled={disabled || selected.locked}
                    onClick={() =>
                      commit(deleteNode(doc, selected.id), pt("history.delete"))
                    }
                  >
                    <Trash2 className="size-3.5" />
                    {pt("delete")}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-white/35">{pt("selectLayer")}</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              {pt("designTokens")}
            </p>
            <div className="space-y-2">
              {(
                [
                  ["primary", pt("tokens.primary")],
                  ["secondary", pt("tokens.secondary")],
                  ["accent", pt("tokens.accent")],
                  ["background", pt("tokens.background")],
                  ["foreground", pt("tokens.foreground")],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-2 text-[11px] text-white/50"
                >
                  {label}
                  <input
                    type="color"
                    value={normalizeHex(doc.tokens[key])}
                    disabled={disabled}
                    onChange={(e) =>
                      commit(
                        updateTokens(doc, { [key]: e.target.value }),
                        pt("history.color", { label }),
                      )
                    }
                    className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                </label>
              ))}
              <label className="block text-[11px] text-white/50">
                {pt("tokens.headingFont")}
                <Input
                  value={doc.tokens.headingFont}
                  disabled={disabled}
                  onChange={(e) =>
                    commit(
                      updateTokens(doc, { headingFont: e.target.value }),
                      pt("history.headingFont"),
                    )
                  }
                  className="mt-1 border-white/10 bg-white/5 text-white"
                />
              </label>
              <label className="block text-[11px] text-white/50">
                {pt("tokens.bodyFont")}
                <Input
                  value={doc.tokens.bodyFont}
                  disabled={disabled}
                  onChange={(e) =>
                    commit(
                      updateTokens(doc, { bodyFont: e.target.value }),
                      pt("history.bodyFont"),
                    )
                  }
                  className="mt-1 border-white/10 bg-white/5 text-white"
                />
              </label>
              <label className="block text-[11px] text-white/50">
                {pt("tokens.spacing")}
                <select
                  value={
                    doc.tokens.sectionY.includes("4")
                      ? "compact"
                      : doc.tokens.sectionY.includes("7") ||
                          doc.tokens.sectionY.includes("8")
                        ? "airy"
                        : "balanced"
                  }
                  disabled={disabled}
                  onChange={(e) => {
                    const map = {
                      compact: "4.5rem",
                      balanced: "5.75rem",
                      airy: "7.5rem",
                    } as const;
                    commit(
                      updateTokens(doc, {
                        sectionY: map[e.target.value as keyof typeof map],
                      }),
                      pt("history.spacing"),
                    );
                  }}
                  className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-white"
                >
                  <option value="compact">{pt("tokens.compact")}</option>
                  <option value="balanced">{pt("tokens.balanced")}</option>
                  <option value="airy">{pt("tokens.airy")}</option>
                </select>
              </label>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-[#0a0a0a] text-white">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
          </DialogHeader>
          <MediaLibraryPanel
            generationId={generationId}
            compact
            onSelect={(asset) => {
              if (!selected) return;
              commit(
                updateNodeImage(doc, selected.id, asset.url),
                pt("history.replaceImage"),
              );
              setMediaOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CanvasBlock(props: {
  node: VisualNode;
  tokens: VisualDocument["tokens"];
  selected: boolean;
  onSelect: () => void;
  onTextChange: (text: string) => void;
  onDragStart: () => void;
  onDrop: (e?: DragEvent) => void;
  disabled?: boolean;
}) {
  const pt = useProductT("visualEditor");
  const { node, tokens, selected, onSelect, onTextChange, onDragStart, onDrop, disabled } =
    props;
  const isHero = node.kind === "hero";
  return (
    <section
      draggable={!node.locked && !disabled}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e)}
      onClick={onSelect}
      className={cn(
        "relative border-b border-white/5 px-5 py-6 transition-shadow",
        selected && "ring-2 ring-inset ring-premium-gold/70",
        isHero && "min-h-[200px]",
      )}
      style={{
        paddingTop: isHero ? "3rem" : undefined,
        paddingBottom: isHero ? "3rem" : undefined,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-40">
          {node.label}
        </span>
        {!node.locked ? (
          <GripVertical className="size-3.5 opacity-30" />
        ) : null}
      </div>
      {isHero ? (
        <div
          contentEditable={!disabled}
          suppressContentEditableWarning
          onBlur={(e) =>
            onTextChange(e.currentTarget.textContent?.trim() || node.text || "")
          }
          className="outline-none"
          style={{
            fontFamily: `"${tokens.headingFont}", Georgia, serif`,
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            maxWidth: "16ch",
          }}
        >
          {node.text || pt("headlineFallback", { label: node.label })}
        </div>
      ) : (
        <div
          contentEditable={!disabled && !node.locked}
          suppressContentEditableWarning
          onBlur={(e) =>
            onTextChange(e.currentTarget.textContent?.trim() || node.text || "")
          }
          className="outline-none"
          style={{
            fontFamily: `"${tokens.headingFont}", Georgia, serif`,
            fontSize: "1.25rem",
            fontWeight: 600,
          }}
        >
          {node.text || node.label}
        </div>
      )}
      {node.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.imageUrl}
          alt={node.label}
          className="mt-3 h-32 w-full rounded-lg object-cover"
        />
      ) : (
        <div
          className="mt-3 h-16 rounded-lg opacity-80"
          style={{
            background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary} 55%, ${tokens.accent})`,
          }}
        />
      )}
      <p className="mt-3 max-w-prose text-[12px] opacity-55">
        {pt("canvasHint")}
      </p>
    </section>
  );
}

function normalizeHex(value: string): string {
  const m = value.match(/#([0-9a-fA-F]{3,8})\b/);
  if (!m) return "#d4af37";
  let hex = m[1]!;
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${hex.slice(0, 6)}`;
}
