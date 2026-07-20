/**
 * Canvas document persistence — design_canvas, design_layers, editor history.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CanvasDocumentModel, CanvasLayer } from "@/lib/ai-core/image-design-platform/editor/types";
import { createCanvasDocument } from "@/lib/ai-core/image-design-platform/editor/document";
import { createElement } from "@/lib/ai-core/image-design-platform/editor/elements";
import { getCanvasTemplateV2 } from "@/lib/ai-core/image-design-platform/templates-v2";
import { blueprintToModel } from "@/lib/ai-core/image-design-platform/model";
import type { ImageBlueprint } from "@/types/image-generation";

export type CanvasRecord = {
  id: string;
  image_generation_id: string;
  user_id: string;
  width: number;
  height: number;
  document: CanvasDocumentModel;
  brand_kit_id: string | null;
  template_id: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

export function documentFromGeneration(
  generationId: string,
  name: string,
  blueprint?: ImageBlueprint | null,
  templateId?: string,
): CanvasDocumentModel {
  const template = templateId ? getCanvasTemplateV2(templateId) : undefined;
  if (template) return template.build(generationId, name);

  const doc = createCanvasDocument({
    generationId,
    name,
    templateId,
  });

  const model = blueprint ? blueprintToModel(blueprint) : null;
  const raster = model?.rasterAssets?.find((a) => a.publicUrl || a.dataUrl);
  if (raster && doc.layers[1]) {
    doc.layers[1].elements.push(
      createElement("image", {
        name: raster.name,
        src: raster.publicUrl || raster.dataUrl || "",
        assetId: raster.id,
        transform: {
          x: 40,
          y: 40,
          width: doc.width - 80,
          height: doc.height - 80,
          rotation: 0,
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
        },
      }),
    );
  }

  return doc;
}

export async function loadCanvasDocument(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  generationName: string;
  blueprint?: ImageBlueprint | null;
  templateId?: string;
}): Promise<{ canvas: CanvasRecord | null; document: CanvasDocumentModel; error: string | null }> {
  const { data, error } = await params.supabase
    .from("design_canvas")
    .select("*")
    .eq("image_generation_id", params.generationId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    if (error.code === "42P01") {
      const doc = documentFromGeneration(
        params.generationId,
        params.generationName,
        params.blueprint,
        params.templateId,
      );
      return { canvas: null, document: doc, error: null };
    }
    return { canvas: null, document: createCanvasDocument({ generationId: params.generationId, name: params.generationName }), error: error.message };
  }

  if (data) {
    const record = data as CanvasRecord;
    return { canvas: record, document: record.document, error: null };
  }

  const doc = documentFromGeneration(
    params.generationId,
    params.generationName,
    params.blueprint,
    params.templateId,
  );

  return { canvas: null, document: doc, error: null };
}

export async function saveCanvasDocument(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  document: CanvasDocumentModel;
  brandKitId?: string | null;
}): Promise<{ canvas: CanvasRecord | null; error: string | null }> {
  const { data: existing } = await params.supabase
    .from("design_canvas")
    .select("id, version")
    .eq("image_generation_id", params.generationId)
    .eq("user_id", params.userId)
    .maybeSingle();

  const version = (existing?.version ?? 0) + 1;
  const row = {
    image_generation_id: params.generationId,
    user_id: params.userId,
    width: params.document.width,
    height: params.document.height,
    document: params.document,
    brand_kit_id: params.brandKitId ?? params.document.brand?.brandKitId ?? null,
    template_id: params.document.templateId ?? null,
    version,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await params.supabase
      .from("design_canvas")
      .update(row)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) return { canvas: null, error: error.message };
    await syncLayers(params.supabase, params.userId, data.id as string, params.document.layers);
    return { canvas: data as CanvasRecord, error: null };
  }

  const { data, error } = await params.supabase
    .from("design_canvas")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01") return { canvas: null, error: "design_canvas table not found. Apply migration 056." };
    return { canvas: null, error: error.message };
  }

  await syncLayers(params.supabase, params.userId, data.id as string, params.document.layers);
  return { canvas: data as CanvasRecord, error: null };
}

async function syncLayers(
  supabase: SupabaseClient,
  userId: string,
  canvasId: string,
  layers: CanvasLayer[],
) {
  await supabase.from("design_layers").delete().eq("canvas_id", canvasId).eq("user_id", userId);
  const rows = layers.map((layer) => ({
    canvas_id: canvasId,
    user_id: userId,
    name: layer.name,
    layer_type: "group",
    z_index: layer.zIndex,
    visible: layer.visible,
    locked: layer.locked,
    element: { elements: layer.elements },
  }));
  if (rows.length) {
    await supabase.from("design_layers").insert(rows);
  }
}

export async function saveEditorHistory(params: {
  supabase: SupabaseClient;
  userId: string;
  canvasId: string;
  action: string;
  snapshot: CanvasDocumentModel;
  cursor: number;
}): Promise<{ error: string | null }> {
  const { error } = await params.supabase.from("design_editor_history").insert({
    canvas_id: params.canvasId,
    user_id: params.userId,
    action: params.action,
    snapshot: params.snapshot,
    cursor: params.cursor,
  });
  if (error?.code === "42P01") return { error: "design_editor_history table not found. Apply migration 058." };
  return { error: error?.message ?? null };
}

export async function listEditorHistory(params: {
  supabase: SupabaseClient;
  userId: string;
  canvasId: string;
  limit?: number;
}): Promise<{ entries: Array<{ id: string; action: string; snapshot: CanvasDocumentModel; cursor: number; created_at: string }>; error: string | null }> {
  const { data, error } = await params.supabase
    .from("design_editor_history")
    .select("id, action, snapshot, cursor, created_at")
    .eq("canvas_id", params.canvasId)
    .eq("user_id", params.userId)
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 20);

  if (error) {
    if (error.code === "42P01") return { entries: [], error: null };
    return { entries: [], error: error.message };
  }
  return { entries: (data ?? []) as never[], error: null };
}
