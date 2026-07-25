"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/dashboard/ui/dashboard-card";
import { DesignCanvasEngine } from "@/lib/ai-core/image-design-platform/editor/engine";
import { findElement } from "@/lib/ai-core/image-design-platform/editor/layers";
import { applyBrandKitToCanvas } from "@/lib/ai-core/image-design-platform/brand-kit";
import type { BrandKitOption } from "@/lib/ai-core/image-design-platform/brand-kit";
import type { CanvasDocumentModel } from "@/lib/ai-core/image-design-platform/editor/types";
import { CanvasPreview } from "@/components/dashboard/image-generator/editor/canvas-preview";
import { LayersPanel } from "@/components/dashboard/image-generator/editor/layers-panel";
import { PropertiesPanel } from "@/components/dashboard/image-generator/editor/properties-panel";
import { EditorToolbar } from "@/components/dashboard/image-generator/editor/toolbar";
import { BrandKitPicker } from "@/components/dashboard/image-generator/editor/brand-kit-picker";
import { useProductT } from "@/lib/i18n/use-scoped-t";

type Props = {
  generationId: string;
  generationName: string;
};

export function DesignEditor({ generationId, generationName }: Props) {
  const p = useProductT("imageGenerator");
  const [engine] = useState(() => new DesignCanvasEngine());
  const [document, setDocument] = useState<CanvasDocumentModel | null>(null);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBrand, setShowBrand] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [, tick] = useState(0);

  const refresh = useCallback(() => tick((n) => n + 1), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/image-generator/${generationId}/editor`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? p("errors.loadEditorFailed"));
      engine.loadDocument(data.document);
      setDocument(data.document);
      setCanvasId(data.canvas?.id ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : p("errors.loadEditorFailed"));
    } finally {
      setLoading(false);
    }
  }, [engine, generationId, p]);

  useEffect(() => {
    void load();
  }, [load]);

  const state = engine.getState();
  const doc = state.document;
  const selectedElement =
    state.selection.selectedElementIds[0]
      ? findElement(doc, state.selection.selectedElementIds[0])?.element ?? null
      : null;

  const activeLayerId = useMemo(() => {
    if (state.selection.selectedLayerId) return state.selection.selectedLayerId;
    const content = doc.layers.find((l) => l.name === "Content") ?? doc.layers[1];
    return content?.id ?? doc.layers[0]?.id ?? null;
  }, [doc.layers, state.selection.selectedLayerId]);

  const persist = useCallback(async () => {
    setBusy(true);
    try {
      const current = engine.getDocument();
      const res = await fetch(`/api/image-generator/${generationId}/editor/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: current, brandKitId: current.brand?.brandKitId ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? p("errors.saveFailed"));
      setCanvasId(data.canvas?.id ?? canvasId);
      setDocument(data.document ?? current);
      if (data.canvas?.id && canvasId) {
        await fetch(`/api/image-generator/${generationId}/editor/history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canvasId: data.canvas.id,
            action: "save",
            snapshot: current,
            cursor: current.version,
          }),
        });
      }
      toast.success(p("toasts.designSaved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : p("errors.saveFailed"));
    } finally {
      setBusy(false);
    }
  }, [canvasId, engine, generationId, p]);

  const addElement = (type: "text" | "shape" | "image" | "icon" | "logo" | "background") => {
    if (!activeLayerId) return;
    engine.addElement(activeLayerId, type);
    refresh();
  };

  const runAiEdit = async (operation: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/image-generator/${generationId}/edit-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? p("errors.editFailed"));
      toast.success(data.message ?? p("toasts.editComplete"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : p("errors.editFailed"));
    } finally {
      setBusy(false);
    }
  };

  const applyBrand = (kit: BrandKitOption) => {
    const next = applyBrandKitToCanvas(engine.getDocument(), kit);
    engine.loadDocument(next);
    setSelectedBrandId(kit.id);
    refresh();
    toast.success(p("editor.designEditor.appliedBrand", { name: kit.name }));
  };

  if (loading || !document) {
    return <div className="py-20 text-center text-white/50">{p("editor.designEditor.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/image-generator">
          <Button variant="ghost" size="icon-xs" className="text-white/40 hover:text-white">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-white">{generationName}</h2>
          <p className="text-xs text-white/40">
            {p("editor.designEditor.dimensions", { width: doc.width, height: doc.height, version: doc.version })}
          </p>
        </div>
      </div>

      <EditorToolbar
        busy={busy}
        canUndo={engine.canUndo()}
        canRedo={engine.canRedo()}
        onUndo={() => { engine.undo(); refresh(); }}
        onRedo={() => { engine.redo(); refresh(); }}
        onSave={() => void persist()}
        onExport={(format) => window.open(`/api/image-generator/${generationId}/export?format=${format}`, "_blank")}
        onAdd={addElement}
        onAiEdit={(op) => void runAiEdit(op)}
        onBrandPanel={() => setShowBrand((v) => !v)}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_280px_280px]">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("editor.designEditor.canvas")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <CanvasPreview
              width={doc.width}
              height={doc.height}
              backgroundColor={doc.backgroundColor}
              layers={doc.layers}
              selectedElementIds={state.selection.selectedElementIds}
              onSelectElement={(id) => { engine.selectElement(id); refresh(); }}
            />
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader><DashboardCardTitle>{p("editor.designEditor.layers")}</DashboardCardTitle></DashboardCardHeader>
          <DashboardCardContent>
            <LayersPanel
              layers={doc.layers}
              selectedLayerId={state.selection.selectedLayerId}
              onSelectLayer={(id) => { engine.selectLayer(id); refresh(); }}
              onToggleVisibility={(id) => { engine.toggleLayerVisibility(id); refresh(); }}
              onToggleLock={(id) => { engine.toggleLayerLock(id); refresh(); }}
              onDuplicate={(id) => { engine.duplicateLayer(id); refresh(); }}
              onRemove={(id) => { engine.removeLayer(id); refresh(); }}
              onMove={(id, dir) => {
                const sorted = [...doc.layers].sort((a, b) => a.zIndex - b.zIndex);
                const idx = sorted.findIndex((l) => l.id === id);
                const next = dir === "up" ? Math.min(sorted.length - 1, idx + 1) : Math.max(0, idx - 1);
                engine.reorderLayer(id, next);
                refresh();
              }}
              onAddLayer={() => { engine.addLayer(); refresh(); }}
            />
          </DashboardCardContent>
        </DashboardCard>

        <div className="space-y-4">
          <DashboardCard>
            <DashboardCardHeader><DashboardCardTitle>{p("editor.designEditor.properties")}</DashboardCardTitle></DashboardCardHeader>
            <DashboardCardContent>
              <PropertiesPanel
                element={selectedElement}
                onChange={(patch) => {
                  if (!selectedElement) return;
                  engine.updateElement(selectedElement.id, patch);
                  refresh();
                }}
              />
            </DashboardCardContent>
          </DashboardCard>

          {showBrand && (
            <DashboardCard>
              <DashboardCardHeader><DashboardCardTitle>{p("editor.designEditor.brandKit")}</DashboardCardTitle></DashboardCardHeader>
              <DashboardCardContent>
                <BrandKitPicker
                  selectedId={selectedBrandId}
                  onSelect={(kit) => setSelectedBrandId(kit?.id ?? null)}
                  onApply={applyBrand}
                />
              </DashboardCardContent>
            </DashboardCard>
          )}
        </div>
      </div>
    </div>
  );
}
