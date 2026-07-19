"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import {
  Copy,
  GripVertical,
  Loader2,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  onSaved,
}: VisualWebsiteEditorProps) {
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

  // Rebuild when generation / files change
  useEffect(() => {
    const doc = buildVisualDocument({ generationId, files, project });
    setBaseline(doc);
    setHistory(createVisualHistory(doc));
  }, [generationId, files, project]);

  const doc = history.present;
  const selected =
    doc.nodes.find((n) => n.id === doc.selectedNodeId) || doc.nodes[0] || null;

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
    commit(moveNode(doc, dragIndex, toIndex), "Move section");
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
      `Insert ${component.name}`,
    );
    toast.message(`${component.name} added — Save to apply to project`);
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
      `Insert ${payload.name}`,
    );
    toast.message(`${payload.name} added — Save to apply to project`);
  };

  const save = async () => {
    if (!doc.dirty) {
      toast.message("No visual changes to save.");
      return;
    }
    const actions = documentToSaveActions(baseline, doc);
    if (!actions.length) {
      toast.message("Nothing to persist.");
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
        throw new Error(data.error || "Unable to save visual edits.");
      }
      const nextDoc = buildVisualDocument({
        generationId: data.generation.id,
        files: data.project.files,
        project: data.project,
      });
      setBaseline(nextDoc);
      setHistory(createVisualHistory(nextDoc));
      onSaved({ project: data.project, generation: data.generation });
      toast.success(data.editResult?.summary || "Visual edits saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save edits.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-[720px] flex-col bg-[#050505]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] px-3 py-2">
        <p className="mr-auto text-[12px] font-semibold text-white/70">
          Visual Editor
          {doc.dirty ? (
            <span className="ml-2 text-premium-gold">· unsaved</span>
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
            {key}
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
          Save
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
            Layers
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
                    commit(updateNodeText(doc, node.id, text), "Edit text")
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
                  Drag a component from the library to start
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Properties */}
        <aside className="space-y-4 border-l border-white/[0.08] bg-black/30 p-3">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              Properties
            </p>
            {selected ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-white/40">Component</p>
                  <p className="text-sm font-semibold text-white">
                    {selected.label}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-white/40">Canvas text</p>
                  <Input
                    value={selected.text || ""}
                    onChange={(e) =>
                      commit(
                        updateNodeText(doc, selected.id, e.target.value),
                        "Edit text",
                      )
                    }
                    disabled={disabled || selected.locked}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="Headline / title"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-white/40">Image URL</p>
                  <Input
                    value={selected.imageUrl || ""}
                    onChange={(e) =>
                      commit(
                        updateNodeImage(doc, selected.id, e.target.value),
                        "Replace image",
                      )
                    }
                    disabled={disabled || selected.locked}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="https://… or /images/…"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/15 text-white"
                    disabled={disabled || selected.locked}
                    onClick={() =>
                      commit(duplicateNode(doc, selected.id), "Duplicate")
                    }
                  >
                    <Copy className="size-3.5" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-300"
                    disabled={disabled || selected.locked}
                    onClick={() =>
                      commit(deleteNode(doc, selected.id), "Delete")
                    }
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-white/35">Select a layer</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              Design tokens
            </p>
            <div className="space-y-2">
              {(
                [
                  ["primary", "Primary"],
                  ["secondary", "Secondary"],
                  ["accent", "Accent"],
                  ["background", "Background"],
                  ["foreground", "Foreground"],
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
                        `Color ${label}`,
                      )
                    }
                    className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                </label>
              ))}
              <label className="block text-[11px] text-white/50">
                Heading font
                <Input
                  value={doc.tokens.headingFont}
                  disabled={disabled}
                  onChange={(e) =>
                    commit(
                      updateTokens(doc, { headingFont: e.target.value }),
                      "Heading font",
                    )
                  }
                  className="mt-1 border-white/10 bg-white/5 text-white"
                />
              </label>
              <label className="block text-[11px] text-white/50">
                Body font
                <Input
                  value={doc.tokens.bodyFont}
                  disabled={disabled}
                  onChange={(e) =>
                    commit(
                      updateTokens(doc, { bodyFont: e.target.value }),
                      "Body font",
                    )
                  }
                  className="mt-1 border-white/10 bg-white/5 text-white"
                />
              </label>
              <label className="block text-[11px] text-white/50">
                Spacing
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
                      "Spacing",
                    );
                  }}
                  className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-white"
                >
                  <option value="compact">Compact</option>
                  <option value="balanced">Balanced</option>
                  <option value="airy">Airy</option>
                </select>
              </label>
            </div>
          </div>
        </aside>
      </div>
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
          {node.text || `${node.label} headline`}
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
      <div
        className="mt-3 h-16 rounded-lg opacity-80"
        style={{
          background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary} 55%, ${tokens.accent})`,
        }}
      />
      <p className="mt-3 max-w-prose text-[12px] opacity-55">
        Drag to reorder · edit text · replace images · tune colors & fonts in Properties
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
