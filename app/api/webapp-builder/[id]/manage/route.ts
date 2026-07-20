import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import type { WebAppGeneration, WebAppBlueprint } from "@/types/webapp";
import {
  extractAppModelFromBlueprint,
  extractVersionHistory,
  withAppModel,
  runAppIntelligence,
  runAppQualityChecks,
  updateAppSettings,
  upsertCatalogItem,
  deleteCatalogItem,
  addScreen,
  removeScreen,
  applyBrandKitToModel,
  saveAppVersion,
  restoreAppVersion,
  compareAppVersions,
  buildAppPreviewPayload,
  createVisualEditorState,
  selectScreen,
  applyEditorTreeToModel,
  updateNodeProps,
  summarizePermissions,
  toPrismaSchemaSketch,
  describeBackendWorkflows,
  listAppTemplates,
  listComponentsForTemplate,
  runAppAssistantAgent,
  syncAppModelToFiles,
  syncPagesFromModel,
  addComponentToScreen,
  removeComponentFromModel,
  reorderScreens,
  reorderComponentsOnScreen,
  applyEditorReorder,
  selectNode,
  updateNodeStyles,
  listEditorComponentPalette,
  provisionAppBackend,
  executeWorkflow,
} from "@/lib/ai-core/app-design-platform";
import type { AppAssistantAgentResult } from "@/lib/ai-core/app-design-platform/assistant-agent";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function loadGeneration(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("webapp_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as WebAppGeneration | null;
}

async function persistBlueprint(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  id: string,
  blueprint: WebAppBlueprint,
  extra?: { app_name?: string },
) {
  const { data, error } = await supabase
    .from("webapp_generations")
    .update({
      blueprint,
      ...(extra?.app_name ? { app_name: extra.app_name } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as WebAppGeneration;
}

/**
 * GET — App management dashboard payload.
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  try {
    const generation = await loadGeneration(
      auth.supabase,
      auth.user!.id,
      parsedId.id,
    );
    if (!generation) {
      return NextResponse.json({ error: "App not found." }, { status: 404 });
    }

    const model = extractAppModelFromBlueprint(generation.blueprint, {
      prompt: generation.prompt,
      appType: generation.app_type,
      language: generation.language,
      designStyle: generation.design_style,
      colorStyle: generation.color_style,
      features: generation.features,
      appName: generation.app_name,
    });
    const history = extractVersionHistory(generation.blueprint);
    const intelligence = runAppIntelligence(model);
    const quality = runAppQualityChecks({
      model,
      files: generation.blueprint?.files ?? [],
    });
    const preview = buildAppPreviewPayload(model, "desktop");
    const editor = createVisualEditorState(model, "desktop");
    const template = listAppTemplates().find((t) => t.id === model.templateId);

    return NextResponse.json({
      generation,
      model,
      history,
      intelligence,
      quality,
      preview,
      editor,
      permissions: summarizePermissions(model),
      workflows: describeBackendWorkflows(model),
      prismaSketch: toPrismaSchemaSketch(model),
      components: listComponentsForTemplate(model.templateId),
      template: template
        ? {
            id: template.id,
            label: template.label,
            description: template.description,
            userFlows: template.userFlows,
          }
        : null,
    });
  } catch (error) {
    return serverErrorResponse(
      "webapp-builder.manage.get",
      error,
      "Unable to load app management data.",
    );
  }
}

const manageSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_settings"),
    appName: z.string().trim().min(1).max(120).optional(),
    tagline: z.string().trim().max(200).optional(),
    language: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    logoUrl: z.string().url().nullable().optional(),
  }),
  z.object({
    action: z.literal("upsert_catalog"),
    item: z.object({
      id: z.string().optional(),
      type: z.enum([
        "product",
        "menu-item",
        "service",
        "booking-slot",
        "course",
        "property",
        "vehicle",
        "custom",
      ]),
      title: z.string().trim().min(1),
      description: z.string().optional(),
      price: z.string().optional(),
      category: z.string().optional(),
      imageUrl: z.string().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }),
  }),
  z.object({
    action: z.literal("delete_catalog"),
    itemId: z.string().min(1),
  }),
  z.object({
    action: z.literal("add_screen"),
    name: z.string().trim().min(1),
    path: z.string().trim().min(1),
    purpose: z.string().optional(),
  }),
  z.object({
    action: z.literal("remove_screen"),
    screenId: z.string().min(1),
  }),
  z.object({
    action: z.literal("apply_brand"),
    name: z.string().trim().min(1).optional(),
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    logoUrl: z.string().nullable().optional(),
    displayFont: z.string().optional(),
    bodyFont: z.string().optional(),
    brandIdentityId: z.string().nullable().optional(),
  }),
  z.object({
    action: z.literal("assistant"),
    message: z.string().trim().min(2).max(4000),
  }),
  z.object({
    action: z.literal("save_version"),
    note: z.string().trim().max(200).optional(),
  }),
  z.object({
    action: z.literal("restore_version"),
    versionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("compare_versions"),
    aId: z.string().min(1),
    bId: z.string().min(1),
  }),
  z.object({
    action: z.literal("editor_select_screen"),
    screenId: z.string().min(1),
  }),
  z.object({
    action: z.literal("editor_update_props"),
    screenId: z.string().min(1),
    nodeId: z.string().min(1),
    props: z.record(z.string(), z.unknown()),
  }),
  z.object({
    action: z.literal("preview"),
    device: z.enum(["mobile", "tablet", "desktop"]).default("desktop"),
    screenId: z.string().optional(),
  }),
  z.object({
    action: z.literal("editor_add_component"),
    screenId: z.string().min(1),
    componentType: z.string().min(1),
  }),
  z.object({
    action: z.literal("editor_remove_component"),
    componentId: z.string().min(1),
  }),
  z.object({
    action: z.literal("editor_reorder_components"),
    screenId: z.string().min(1),
    fromIndex: z.number().int().min(0),
    toIndex: z.number().int().min(0),
  }),
  z.object({
    action: z.literal("reorder_screens"),
    fromIndex: z.number().int().min(0),
    toIndex: z.number().int().min(0),
  }),
  z.object({
    action: z.literal("editor_select_node"),
    screenId: z.string().min(1),
    nodeId: z.string().nullable(),
  }),
  z.object({
    action: z.literal("editor_update_styles"),
    screenId: z.string().min(1),
    nodeId: z.string().min(1),
    style: z.record(z.string(), z.string()),
  }),
  z.object({
    action: z.literal("sync_files"),
  }),
  z.object({
    action: z.literal("provision_backend"),
  }),
  z.object({
    action: z.literal("run_workflow"),
    workflowId: z.string().min(1),
  }),
]);

/**
 * POST — mutate structured app model without regenerating source.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = manageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid action" },
      { status: 400 },
    );
  }

  try {
    const generation = await loadGeneration(
      auth.supabase,
      auth.user!.id,
      parsedId.id,
    );
    if (!generation) {
      return NextResponse.json({ error: "App not found." }, { status: 404 });
    }

    let model = extractAppModelFromBlueprint(generation.blueprint, {
      prompt: generation.prompt,
      appType: generation.app_type,
      language: generation.language,
      designStyle: generation.design_style,
      colorStyle: generation.color_style,
      features: generation.features,
      appName: generation.app_name,
    });
    let history = extractVersionHistory(generation.blueprint);
    const action = parsed.data;
    let assistantResult = undefined as AppAssistantAgentResult | undefined;
    let compare = undefined as ReturnType<typeof compareAppVersions> | undefined;
    let editor = createVisualEditorState(model);
    let preview = buildAppPreviewPayload(model);
    let persist = true;
    let syncFiles = false;
    let message = "App updated.";
    let blueprintFiles = generation.blueprint?.files ?? [];

    switch (action.action) {
      case "update_settings":
        model = updateAppSettings(model, {
          appName: action.appName,
          tagline: action.tagline,
          language: action.language,
          currency: action.currency,
          logoUrl: action.logoUrl,
        });
        syncFiles = true;
        message = "Settings updated.";
        break;
      case "upsert_catalog":
        model = upsertCatalogItem(model, action.item);
        syncFiles = true;
        message = "Catalog item saved.";
        break;
      case "delete_catalog":
        model = deleteCatalogItem(model, action.itemId);
        syncFiles = true;
        message = "Catalog item removed.";
        break;
      case "add_screen":
        model = addScreen(model, {
          name: action.name,
          path: action.path.startsWith("/") ? action.path : `/${action.path}`,
          purpose: action.purpose,
        });
        syncFiles = true;
        message = "Screen added.";
        break;
      case "remove_screen":
        model = removeScreen(model, action.screenId);
        syncFiles = true;
        message = "Screen removed.";
        break;
      case "apply_brand":
        model = applyBrandKitToModel(model, {
          name: action.name || model.brand.businessName,
          primary: action.primary,
          secondary: action.secondary,
          accent: action.accent,
          logoUrl: action.logoUrl,
          displayFont: action.displayFont,
          bodyFont: action.bodyFont,
          brandIdentityId: action.brandIdentityId,
        });
        syncFiles = true;
        message = "Brand applied.";
        break;
      case "assistant":
        assistantResult = await runAppAssistantAgent({
          message: action.message,
          model,
          files: blueprintFiles,
          syncFiles: true,
        });
        if (assistantResult.applied && assistantResult.model) {
          model = assistantResult.model;
          if (assistantResult.files) blueprintFiles = assistantResult.files;
          syncFiles = true;
          message = assistantResult.actions.join("; ") || "Assistant applied changes.";
        } else {
          persist = false;
          message = assistantResult.notes[0] || "No changes applied.";
        }
        break;
      case "save_version":
        history = saveAppVersion(history, model, action.note);
        message = "Version saved.";
        break;
      case "restore_version": {
        const restored = restoreAppVersion(history, action.versionId);
        if (!restored) {
          return NextResponse.json({ error: "Version not found." }, { status: 404 });
        }
        model = restored.model;
        history = restored.history;
        message = "Version restored.";
        break;
      }
      case "compare_versions":
        compare = compareAppVersions(history, action.aId, action.bId);
        persist = false;
        message = "Comparison ready.";
        break;
      case "editor_select_screen":
        editor = selectScreen(model, editor, action.screenId);
        persist = false;
        message = "Screen selected.";
        break;
      case "editor_update_props":
        editor = selectScreen(model, editor, action.screenId);
        editor = updateNodeProps(editor, action.nodeId, action.props);
        model = applyEditorTreeToModel(model, editor);
        syncFiles = true;
        message = "Component props updated.";
        break;
      case "preview":
        preview = buildAppPreviewPayload(
          model,
          action.device,
          action.screenId ?? null,
        );
        persist = false;
        message = "Preview ready.";
        break;
      case "editor_add_component": {
        const added = addComponentToScreen(model, action.screenId, action.componentType);
        model = added.model;
        editor = selectScreen(model, editor, action.screenId);
        syncFiles = true;
        message = `Added ${action.componentType}.`;
        break;
      }
      case "editor_remove_component":
        model = removeComponentFromModel(model, action.componentId);
        editor = createVisualEditorState(model, editor.device);
        syncFiles = true;
        message = "Component removed.";
        break;
      case "editor_reorder_components":
        model = reorderComponentsOnScreen(
          model,
          action.screenId,
          action.fromIndex,
          action.toIndex,
        );
        editor = selectScreen(model, editor, action.screenId);
        syncFiles = true;
        message = "Components reordered.";
        break;
      case "reorder_screens":
        model = reorderScreens(model, action.fromIndex, action.toIndex);
        editor = createVisualEditorState(model, editor.device);
        syncFiles = true;
        message = "Screens reordered.";
        break;
      case "editor_select_node":
        editor = selectScreen(model, editor, action.screenId);
        editor = selectNode(editor, action.nodeId);
        persist = false;
        message = "Node selected.";
        break;
      case "editor_update_styles":
        editor = selectScreen(model, editor, action.screenId);
        editor = updateNodeStyles(editor, action.nodeId, action.style);
        model = applyEditorTreeToModel(model, editor);
        syncFiles = true;
        message = "Styles updated.";
        break;
      case "sync_files": {
        const sync = syncAppModelToFiles(model, blueprintFiles);
        blueprintFiles = sync.files;
        persist = true;
        syncFiles = false;
        message = sync.notes.join(" ");
        break;
      }
      case "provision_backend": {
        const backend = provisionAppBackend(model, blueprintFiles);
        blueprintFiles = backend.files;
        persist = true;
        syncFiles = false;
        message = backend.notes.join(" ");
        break;
      }
      case "run_workflow": {
        const workflow = model.workflows.find((w) => w.id === action.workflowId);
        if (!workflow) {
          return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
        }
        const execution = await executeWorkflow({ workflow, model, trigger: "manual" });
        persist = false;
        message = `Workflow executed: ${execution.actionsRun.join(", ")}`;
        return NextResponse.json({
          message,
          execution,
          model,
          intelligence: runAppIntelligence(model),
        });
      }
    }

    let saved = generation;
    if (persist) {
      if (syncFiles) {
        const sync = syncAppModelToFiles(model, blueprintFiles);
        blueprintFiles = sync.files;
      }
      history = saveAppVersion(history, model, `After ${action.action}`);
      const blueprint = withAppModel(
        {
          ...(generation.blueprint || {}),
          files: blueprintFiles,
          pages: syncPagesFromModel(model),
        } as WebAppBlueprint,
        model,
        history,
      ) as WebAppBlueprint;
      saved = await persistBlueprint(
        auth.supabase,
        auth.user!.id,
        parsedId.id,
        blueprint,
        { app_name: model.settings.appName },
      );
    }

    return NextResponse.json({
      message,
      generation: saved,
      model,
      history,
      intelligence: runAppIntelligence(model),
      quality: runAppQualityChecks({
        model,
        files: saved.blueprint?.files ?? [],
      }),
      preview,
      editor,
      assistant: assistantResult,
      compare,
      componentPalette: listEditorComponentPalette(model.templateId),
      livePreviewUrl: `/api/webapp-builder/${parsedId.id}/live-preview`,
    });
  } catch (error) {
    return serverErrorResponse(
      "webapp-builder.manage.post",
      error,
      "Unable to update application.",
    );
  }
}
