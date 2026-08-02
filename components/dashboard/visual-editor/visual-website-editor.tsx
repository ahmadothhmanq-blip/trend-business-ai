"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
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
  moveNodeDown,
  moveNodeToPosition,
  moveNodeUp,
  pushVisualHistory,
  redoVisualHistory,
  selectNode,
  selectButton,
  selectLink,
  selectIcon,
  setViewport,
  undoVisualHistory,
  updateNodeText,
  updateNodeImage,
  updateNodeSectionBackground,
  updateNodeSectionConfig,
  updateNodeButton,
  updateNodeLink,
  updateNodeIcon,
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
import { SectionPropertiesPanel } from "@/components/dashboard/visual-editor/section-properties-panel";
import { ButtonPropertiesPanel } from "@/components/dashboard/visual-editor/button-properties-panel";
import { IconPropertiesPanel } from "@/components/dashboard/visual-editor/icon-properties-panel";
import { LinkPropertiesPanel } from "@/components/dashboard/visual-editor/link-properties-panel";
import { resolveLucideIcon } from "@/components/dashboard/visual-editor/icon-render";
import {
  listAnchorSections,
  listInternalPageRoutes,
} from "@/lib/ai-core/visual-editor/link-extract";
import { hasBlockingLinkSaveErrors } from "@/lib/ai-core/visual-editor/link-validate";
import { resolveButtonPreviewStyle } from "@/lib/ai-core/visual-editor/button-styles";
import { resolveIconPreviewStyle } from "@/lib/ai-core/visual-editor/icon-styles";
import {
  resolveSectionBgImageStyle,
  resolveSectionBgOverlayStyle,
  sectionBgPreviewUrl,
  sectionHeightClass,
} from "@/lib/ai-core/visual-editor/section-bg-styles";
import {
  createDefaultSectionBackground,
} from "@/lib/ai-core/visual-editor/section-bg-types";
import { createDefaultSectionConfig } from "@/lib/ai-core/visual-editor/section-types";
import {
  resolveSectionPreviewStyle,
  sectionIsVisible,
  sectionPreviewClassName,
} from "@/lib/ai-core/visual-editor/section-styles";
import type { WebsiteEditAction } from "@/lib/ai-core/website-editor/types";
import type { ButtonPreviewState, VisualButton } from "@/lib/ai-core/visual-editor/button-types";
import type { IconPreviewState } from "@/lib/ai-core/visual-editor/icon-types";
import {
  createBuilderAutosaveScheduler,
} from "@/lib/website/builder/autosave";
import type { BuilderAutosaveState } from "@/lib/website/builder/types";

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
  chrome?: "full" | "workspace";
  autosaveEnabled?: boolean;
  onAutosaveStateChange?: (state: BuilderAutosaveState) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSelectionChange?: (selection: {
    nodeId: string;
    nodeLabel: string;
    sectionKind?: string;
    componentExportName?: string;
  } | null) => void;
  onSaved: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
  }) => void;
  onTokensChange?: (tokens: VisualDocument["tokens"]) => void;
};

export type VisualWebsiteEditorHandle = {
  save: (options?: { silent?: boolean }) => Promise<boolean>;
  selectNode: (nodeId: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  insertBlock: (block: {
    exportName: string;
    path: string;
    sectionKind: string;
    name: string;
  }) => void;
  getTokens: () => VisualDesignTokens;
  updateTokens: (patch: Partial<VisualDesignTokens>) => void;
  getViewport: () => VisualViewport;
  setViewport: (viewport: VisualViewport) => void;
};

type VisualDesignTokens = VisualDocument["tokens"];

export const VisualWebsiteEditor = forwardRef<
  VisualWebsiteEditorHandle,
  VisualWebsiteEditorProps
>(function VisualWebsiteEditor(
  {
    generationId,
    files,
    project,
    disabled,
    chrome = "full",
    autosaveEnabled = false,
    onAutosaveStateChange,
    onDirtyChange,
    onSelectionChange,
    onSaved,
    onTokensChange,
  },
  ref,
) {
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
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [libraryInsertIndex, setLibraryInsertIndex] = useState<number | undefined>(
    undefined,
  );
  const pendingSectionAiActionsRef = useRef<WebsiteEditAction[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropAspect, setCropAspect] = useState<"free" | "1:1" | "16:9">("free");
  const [buttonPreviewState, setButtonPreviewState] =
    useState<ButtonPreviewState>("normal");
  const [iconPreviewState, setIconPreviewState] =
    useState<IconPreviewState>("normal");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const autosaveSchedulerRef = useRef(createBuilderAutosaveScheduler());
  const isWorkspace = chrome === "workspace";

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
        updateNodeSectionBackground(doc, selected.id, {
          url: json.asset.url,
          source: "upload",
        }),
        pt("backgroundEditor.history"),
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
  const selectedButton: VisualButton | null =
    selected?.buttons?.find((b) => b.id === doc.selectedButtonId) ?? null;
  const selectedLink =
    selected?.links?.find((l) => l.id === doc.selectedLinkId) ??
    selected?.links?.find((l) => l.id === doc.selectedButtonId) ??
    null;
  const selectedIcon =
    selected?.icons?.find((i) => i.id === doc.selectedIconId) ?? null;
  const internalRoutes = useMemo(
    () => listInternalPageRoutes(files),
    [files],
  );
  const anchorSections = useMemo(() => listAnchorSections(files), [files]);

  useEffect(() => {
    onTokensChange?.(doc.tokens);
  }, [doc.tokens, onTokensChange]);

  useEffect(() => {
    onDirtyChange?.(doc.dirty);
  }, [doc.dirty, onDirtyChange]);

  useEffect(() => {
    if (!onSelectionChange) return;
    if (!selected) {
      onSelectionChange(null);
      return;
    }
    onSelectionChange({
      nodeId: selected.id,
      nodeLabel: selected.label || selected.exportName || selected.kind,
      sectionKind: selected.kind,
      componentExportName: selected.exportName,
    });
  }, [
    selected?.id,
    selected?.label,
    selected?.exportName,
    selected?.kind,
    onSelectionChange,
  ]);

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

  const patchSelectedLink = useCallback(
    (patch: Partial<NonNullable<typeof selectedLink>>) => {
      if (!selected || !selectedLink) return;
      commit(
        updateNodeLink(doc, selected.id, selectedLink.id, patch),
        pt("linkEditor.history"),
      );
    },
    [commit, doc, pt, selected, selectedLink],
  );

  const patchSelectedButton = useCallback(
    (patch: Partial<VisualButton>) => {
      if (!selected || !selectedButton) return;
      commit(
        updateNodeButton(doc, selected.id, selectedButton.id, patch),
        pt("buttonEditor.history"),
      );
    },
    [commit, doc, pt, selected, selectedButton],
  );

  const patchSelectedIcon = useCallback(
    (patch: Partial<NonNullable<typeof selectedIcon>>) => {
      if (!selected || !selectedIcon) return;
      commit(
        updateNodeIcon(doc, selected.id, selectedIcon.id, patch),
        pt("iconEditor.history"),
      );
    },
    [commit, doc, pt, selected, selectedIcon],
  );

  const patchSelectedBackground = useCallback(
    (patch: Partial<NonNullable<typeof selected.sectionBackground>>) => {
      if (!selected) return;
      commit(
        updateNodeSectionBackground(doc, selected.id, patch),
        pt("backgroundEditor.history"),
      );
    },
    [commit, doc, pt, selected],
  );

  const selectedSectionConfig = useMemo(() => {
    if (!selected) return null;
    return (
      selected.sectionConfig ??
      createDefaultSectionConfig({
        id: `${selected.exportName}-section`,
        sectionExportName: selected.exportName,
        sectionType:
          selected.kind === "hero"
            ? "hero"
            : selected.kind === "header"
              ? "header"
              : selected.kind === "footer"
                ? "footer"
                : selected.kind === "cta"
                  ? "cta"
                  : "custom",
        kind: selected.kind,
      })
    );
  }, [selected]);

  const selectedNodeIndex = selected
    ? doc.nodes.findIndex((n) => n.id === selected.id)
    : -1;

  const patchSelectedSectionConfig = useCallback(
    (patch: Parameters<typeof updateNodeSectionConfig>[2]) => {
      if (!selected) return;
      commit(
        updateNodeSectionConfig(doc, selected.id, patch),
        pt("sectionEditor.history"),
      );
    },
    [commit, doc, pt, selected],
  );

  const queueSectionAiAction = useCallback(
    (action: WebsiteEditAction) => {
      if (!selected) return;
      pendingSectionAiActionsRef.current.push({
        ...action,
        target: action.target ?? selected.exportName,
      });
      commit(
        {
          ...doc,
          dirty: true,
          updatedAt: new Date().toISOString(),
        },
        pt("sectionEditor.aiQueued"),
      );
      toast.message(pt("sectionEditor.aiQueuedHint"));
    },
    [commit, doc, pt, selected],
  );

  const confirmDeleteSection = useCallback(() => {
    if (!selected) return;
    commit(deleteNode(doc, selected.id), pt("history.delete"));
    setDeleteConfirmOpen(false);
    toast.message(pt("sectionEditor.deleted"));
  }, [commit, doc, pt, selected]);

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
    setTemplatesOpen(false);
    setLibraryInsertIndex(undefined);
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

  const save = async (options?: { silent?: boolean }) => {
    if (!doc.dirty) {
      if (!options?.silent) toast.message(pt("toasts.noChanges"));
      return true;
    }
    const linkCtx = {
      internalRoutes: internalRoutes.map((r) => r.path),
      anchorIds: anchorSections.map((a) => a.id),
    };
    const baselineLinks = baseline.nodes.flatMap((n) => n.links ?? []);
    const currentLinks = doc.nodes.flatMap((n) => n.links ?? []);
    if (hasBlockingLinkSaveErrors(baselineLinks, currentLinks, linkCtx)) {
      if (!options?.silent) {
        toast.error(pt("linkEditor.validationBlocked"));
      }
      return false;
    }
    const actions = [
      ...documentToSaveActions(baseline, doc),
      ...pendingSectionAiActionsRef.current,
    ];
    const applyAi = pendingSectionAiActionsRef.current.length > 0;
    if (!actions.length) {
      if (!options?.silent) toast.message(pt("toasts.nothingToPersist"));
      return true;
    }
    setSaving(true);
    onAutosaveStateChange?.("saving");
    try {
      const response = await fetch(
        `/api/website-builder/${generationId}/edit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actions, applyAi }),
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
      pendingSectionAiActionsRef.current = [];
      onSaved({ project: data.project, generation: data.generation });
      if (!options?.silent) {
        toast.success(data.editResult?.summary || pt("toasts.saved"));
      }
      onAutosaveStateChange?.("saved");
      return true;
    } catch (error) {
      onAutosaveStateChange?.("error");
      if (!options?.silent) {
        toast.error(
          error instanceof Error ? error.message : pt("toasts.saveFailed"),
        );
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  useImperativeHandle(
    ref,
    () => ({
      save: (options) => saveRef.current(options),
      selectNode: (nodeId: string) => {
        setHistory((h) => ({
          ...h,
          present: selectNode(h.present, nodeId),
        }));
      },
      moveSection: (fromIndex: number, toIndex: number) => {
        setHistory((h) => ({
          ...h,
          present: moveNode(h.present, fromIndex, toIndex),
        }));
      },
      insertBlock: (block) => {
        setHistory((h) => {
          const present = h.present;
          return {
            ...h,
            present: insertMarketplaceComponent(present, {
              exportName: block.exportName,
              path: block.path,
              kind: kindFromSectionKind(block.sectionKind),
              label: block.name,
              text: block.name,
            }),
          };
        });
      },
      getTokens: () => doc.tokens,
      updateTokens: (patch) => {
        setHistory((h) => ({
          ...h,
          present: updateTokens(h.present, patch),
        }));
      },
      getViewport: () => doc.viewport,
      setViewport: (viewport) => {
        setHistory((h) => ({
          ...h,
          present: setViewport(h.present, viewport),
        }));
      },
    }),
    [doc.tokens, doc.viewport],
  );

  useEffect(() => {
    if (!autosaveEnabled || !doc.dirty || saving || disabled) {
      return;
    }
    onAutosaveStateChange?.("pending");
    const scheduler = autosaveSchedulerRef.current;
    scheduler.schedule(() => {
      void saveRef.current({ silent: true });
    });
    return () => scheduler.cancel();
  }, [
    autosaveEnabled,
    doc.dirty,
    disabled,
    onAutosaveStateChange,
    saving,
  ]);

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

      <div
        className={cn(
          "grid min-h-0 flex-1",
          isWorkspace
            ? "lg:grid-cols-[minmax(0,1fr)_260px]"
            : "lg:grid-cols-[240px_200px_minmax(0,1fr)_260px]",
        )}
      >
        {!isWorkspace ? (
        <aside className="border-r border-white/[0.08] bg-black/40 p-3">
          <ComponentLibraryPanel
            compact
            onInsert={(c) => insertFromLibrary(c)}
          />
        </aside>
        ) : null}

        {!isWorkspace ? (
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
        ) : null}

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
                  selectedButtonId={doc.selectedButtonId}
                  selectedLinkId={doc.selectedLinkId}
                  selectedIconId={doc.selectedIconId}
                  buttonPreviewState={buttonPreviewState}
                  iconPreviewState={iconPreviewState}
                  viewport={doc.viewport}
                  onSelect={() =>
                    setHistory((h) => ({
                      ...h,
                      present: selectNode(h.present, node.id),
                    }))
                  }
                  onSelectButton={(buttonId) =>
                    setHistory((h) => ({
                      ...h,
                      present: selectButton(h.present, node.id, buttonId),
                    }))
                  }
                  onSelectLink={(linkId) =>
                    setHistory((h) => ({
                      ...h,
                      present: selectLink(h.present, node.id, linkId),
                    }))
                  }
                  onSelectIcon={(iconId) =>
                    setHistory((h) => ({
                      ...h,
                      present: selectIcon(h.present, node.id, iconId),
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
              {selectedIcon
                ? pt("iconEditor.title")
                : selectedLink
                ? pt("linkEditor.title")
                : selectedButton
                  ? pt("buttonEditor.title")
                  : selected
                    ? pt("sectionEditor.title")
                    : pt("properties")}
            </p>
            {selectedIcon && selected ? (
              <IconPropertiesPanel
                icon={selectedIcon}
                disabled={disabled || selected.locked}
                previewState={iconPreviewState}
                onPreviewStateChange={setIconPreviewState}
                onChange={patchSelectedIcon}
              />
            ) : selectedLink && selected ? (
              <div className="space-y-4">
                <LinkPropertiesPanel
                  link={selectedLink}
                  internalRoutes={internalRoutes}
                  anchorSections={anchorSections}
                  disabled={disabled}
                  onChange={patchSelectedLink}
                />
                {selectedButton &&
                (selectedLink.kind === "button" || selectedLink.kind === "cta") ? (
                  <ButtonPropertiesPanel
                    button={selectedButton}
                    internalRoutes={internalRoutes}
                    disabled={disabled || selected.locked}
                    previewState={buttonPreviewState}
                    onPreviewStateChange={setButtonPreviewState}
                    onChange={patchSelectedButton}
                    hideLinkFields
                  />
                ) : null}
              </div>
            ) : selectedButton && selected ? (
              <ButtonPropertiesPanel
                button={selectedButton}
                internalRoutes={internalRoutes}
                disabled={disabled || selected.locked}
                previewState={buttonPreviewState}
                onPreviewStateChange={setButtonPreviewState}
                onChange={patchSelectedButton}
              />
            ) : selected && selectedSectionConfig ? (
              <div className="space-y-3">
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
                <SectionPropertiesPanel
                  config={selectedSectionConfig}
                  viewport={doc.viewport}
                  nodeIndex={selectedNodeIndex}
                  nodeCount={doc.nodes.length}
                  locked={selected.locked}
                  disabled={disabled}
                  uploadingBackground={uploadingImage}
                  sectionBackground={
                    selected.sectionBackground ??
                    createDefaultSectionBackground({
                      id: `${selected.exportName}-bg`,
                      sectionExportName: selected.exportName,
                      kind: selected.kind,
                      url: selected.imageUrl ?? "",
                      source: selected.imageUrl ? "url" : "none",
                      alt: selected.text || selected.label,
                    })
                  }
                  onChange={patchSelectedSectionConfig}
                  onBackgroundChange={patchSelectedBackground}
                  onUploadBackground={() => imageInputRef.current?.click()}
                  onMediaLibraryBackground={() => setMediaOpen(true)}
                  onInsertBefore={() => {
                    setLibraryInsertIndex(selectedNodeIndex);
                    setTemplatesOpen(true);
                  }}
                  onInsertAfter={() => {
                    setLibraryInsertIndex(
                      selectedNodeIndex < 0 ? undefined : selectedNodeIndex + 1,
                    );
                    setTemplatesOpen(true);
                  }}
                  onInsertAtEnd={() => {
                    setLibraryInsertIndex(doc.nodes.length);
                    setTemplatesOpen(true);
                  }}
                  onOpenTemplates={() => {
                    setLibraryInsertIndex(undefined);
                    setTemplatesOpen(true);
                  }}
                  onDelete={() => setDeleteConfirmOpen(true)}
                  onDuplicate={() =>
                    commit(duplicateNode(doc, selected.id), pt("history.duplicate"))
                  }
                  onMoveUp={() =>
                    commit(moveNodeUp(doc, selected.id), pt("sectionEditor.historyMove"))
                  }
                  onMoveDown={() =>
                    commit(moveNodeDown(doc, selected.id), pt("sectionEditor.historyMove"))
                  }
                  onMoveToPosition={(index) =>
                    commit(
                      moveNodeToPosition(doc, selected.id, index),
                      pt("sectionEditor.historyMove"),
                    )
                  }
                  onAiImprove={() =>
                    queueSectionAiAction({
                      type: "improve-layout",
                      notes: `Improve section layout for ${selected.exportName}`,
                    })
                  }
                  onAiRegenerate={() =>
                    queueSectionAiAction({
                      type: "replace-section",
                      target: selected.exportName,
                      notes: `Regenerate section ${selected.exportName}`,
                    })
                  }
                  onAiRewrite={() =>
                    queueSectionAiAction({
                      type: "rewrite-content",
                      target: selected.exportName,
                      notes: `Rewrite content for ${selected.exportName}`,
                    })
                  }
                  onAiGenerateMore={() =>
                    queueSectionAiAction({
                      type: "rewrite-content",
                      target: selected.exportName,
                      notes: `Generate more items for ${selected.exportName}`,
                    })
                  }
                />
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
              </div>
            ) : (
              <p className="text-[12px] text-white/35">{pt("selectLayer")}</p>
            )}
          </div>

          {!selectedButton ? (
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
          ) : null}
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
                updateNodeSectionBackground(doc, selected.id, {
                  url: asset.url,
                  source: "library",
                }),
                pt("backgroundEditor.history"),
              );
              setMediaOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-[#0a0a0a] text-white">
          <DialogHeader>
            <DialogTitle>{pt("sectionEditor.fromTemplates")}</DialogTitle>
          </DialogHeader>
          <ComponentLibraryPanel
            compact
            onInsert={(c) => insertFromLibrary(c, libraryInsertIndex)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0a0a0a] text-white">
          <DialogHeader>
            <DialogTitle>{pt("sectionEditor.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60">{pt("sectionEditor.deleteBody")}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              className="border-white/15 text-white"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {pt("sectionEditor.cancel")}
            </Button>
            <Button
              variant="outline"
              className="border-red-500/30 text-red-300"
              onClick={confirmDeleteSection}
            >
              <Trash2 className="size-3.5" />
              {pt("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

function CanvasBlock(props: {
  node: VisualNode;
  tokens: VisualDocument["tokens"];
  selected: boolean;
  selectedButtonId: string | null;
  selectedLinkId: string | null;
  selectedIconId: string | null;
  buttonPreviewState: ButtonPreviewState;
  iconPreviewState: IconPreviewState;
  viewport: VisualViewport;
  onSelect: () => void;
  onSelectButton: (buttonId: string) => void;
  onSelectLink: (linkId: string) => void;
  onSelectIcon: (iconId: string) => void;
  onTextChange: (text: string) => void;
  onDragStart: () => void;
  onDrop: (e?: DragEvent) => void;
  disabled?: boolean;
}) {
  const pt = useProductT("visualEditor");
  const {
    node,
    tokens,
    selected,
    selectedButtonId,
    selectedLinkId,
    selectedIconId,
    buttonPreviewState,
    iconPreviewState,
    viewport,
    onSelect,
    onSelectButton,
    onSelectLink,
    onSelectIcon,
    onTextChange,
    onDragStart,
    onDrop,
    disabled,
  } = props;
  const isHero = node.kind === "hero";
  const sectionConfig =
    node.sectionConfig ??
    createDefaultSectionConfig({
      id: `${node.exportName}-section`,
      sectionExportName: node.exportName,
      sectionType: isHero ? "hero" : node.kind === "header" ? "header" : node.kind === "footer" ? "footer" : "custom",
      kind: node.kind,
    });
  const sectionVisible = sectionIsVisible(sectionConfig, viewport);
  const sectionStyle = resolveSectionPreviewStyle(sectionConfig, viewport);
  const sectionClass = sectionPreviewClassName(sectionConfig);

  if (!sectionVisible) {
    return (
      <section
        className="relative border-b border-dashed border-white/10 px-5 py-3 opacity-40"
        onClick={onSelect}
      >
        <p className="text-[10px] uppercase tracking-wider text-white/40">
          {pt("sectionEditor.hiddenOnViewport")} · {node.label}
        </p>
      </section>
    );
  }

  return (
    <section
      draggable={!node.locked && !disabled}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e)}
      onClick={onSelect}
      className={cn(
        "relative border-b border-white/5 px-5 py-6 transition-shadow",
        sectionClass,
        selected && "ring-2 ring-inset ring-premium-gold/70",
        isHero && "min-h-[200px]",
      )}
      style={{
        ...sectionStyle,
        paddingTop: isHero ? sectionStyle.padding ?? "3rem" : sectionStyle.padding,
        paddingBottom: isHero ? sectionStyle.padding ?? "3rem" : sectionStyle.padding,
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
      {node.sectionBackground?.url || node.imageUrl ? (
        <div
          className={cn(
            "relative mt-3 overflow-hidden rounded-lg",
            node.sectionBackground
              ? sectionHeightClass(node.sectionBackground) ?? "h-32"
              : "h-32",
          )}
          style={
            node.sectionBackground?.sectionHeight === "custom"
              ? { minHeight: node.sectionBackground.customHeightPx }
              : undefined
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              (node.sectionBackground
                ? sectionBgPreviewUrl(node.sectionBackground, viewport)
                : node.imageUrl) || ""
            }
            alt={
              node.sectionBackground?.decorative
                ? ""
                : node.sectionBackground?.alt || node.label
            }
            className="absolute inset-0 h-full w-full"
            style={
              node.sectionBackground
                ? resolveSectionBgImageStyle(node.sectionBackground, viewport)
                : { objectFit: "cover" }
            }
          />
          {node.sectionBackground?.overlay.enabled ? (
            <div
              className="absolute inset-0"
              style={resolveSectionBgOverlayStyle(node.sectionBackground)}
            />
          ) : null}
        </div>
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
      {node.icons && node.icons.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {node.icons.map((icon) => {
            const isSelected = selectedIconId === icon.id;
            const Icon = resolveLucideIcon(icon.name);
            const iconStyle = resolveIconPreviewStyle(icon, iconPreviewState);
            return (
              <button
                key={icon.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                  onSelectIcon(icon.id);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/70",
                  isSelected && "ring-2 ring-premium-gold text-white",
                )}
              >
                <span style={iconStyle}>
                  <Icon className="size-3" />
                </span>
                {icon.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {node.links && node.links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {node.links
            .filter((l) => l.kind !== "button" && l.kind !== "cta")
            .map((link) => {
              const isSelected = selectedLinkId === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                    onSelectLink(link.id);
                  }}
                  className={cn(
                    "rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/70",
                    isSelected && "ring-2 ring-premium-gold text-white",
                  )}
                >
                  {link.label}
                </button>
              );
            })}
        </div>
      ) : null}
      {node.buttons && node.buttons.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {node.buttons.map((button) => {
            const isButtonSelected = selectedButtonId === button.id;
            const style = resolveButtonPreviewStyle(button, buttonPreviewState);
            const linkedIcon = node.icons?.find((i) => i.buttonId === button.id);
            const BtnIcon = linkedIcon ? resolveLucideIcon(linkedIcon.name) : null;
            const iconStyle = linkedIcon
              ? resolveIconPreviewStyle(linkedIcon, iconPreviewState)
              : undefined;
            return (
              <button
                key={button.id}
                type="button"
                style={style}
                disabled={button.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                  onSelectButton(button.id);
                  onSelectLink(button.id);
                  if (linkedIcon) onSelectIcon(linkedIcon.id);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5",
                  isButtonSelected &&
                    "ring-2 ring-premium-gold ring-offset-2 ring-offset-[var(--canvas-bg,#080808)]",
                )}
                aria-label={button.ariaLabel || button.label}
                title={button.title || undefined}
              >
                {linkedIcon && linkedIcon.position === "left" && BtnIcon ? (
                  <span style={iconStyle}>
                    <BtnIcon className="size-3.5" />
                  </span>
                ) : null}
                {button.label}
                {linkedIcon && linkedIcon.position === "right" && BtnIcon ? (
                  <span style={iconStyle}>
                    <BtnIcon className="size-3.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
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
