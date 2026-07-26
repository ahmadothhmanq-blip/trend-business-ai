/**
 * WebsiteStructureService — management dashboard mutations (structure, catalog, CMS, brand).
 * Extracted from POST /api/website-builder/[id]/manage (Phase 0).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  resolveSiteStructureForProject,
  parseCatalogFromFiles,
  writeCatalogToFiles,
  upsertCatalogItem,
  deleteCatalogItem,
  listCmsEntries,
  upsertCmsEntry,
  deleteCmsEntry,
  applyBrandManagement,
  runPrePublishQualityControl,
  addPage,
  removePage,
  duplicatePage,
  reorderPages,
  setHomepage,
  updatePageMeta,
  applyStructureToProjectFiles,
  updateNavLinks,
  updateFooterLinks,
  injectCmsIntoFiles,
  type SiteStructurePlan,
  type CatalogItem,
} from "@/lib/ai-core/website-management";

import { runWebsiteAssistant } from "@/lib/ai-core/website-management/assistant/engine";

type WebsiteAssistantRunResult = ReturnType<typeof runWebsiteAssistant>;
import { commitBlueprintRevision } from "@/lib/website/platform/commit";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";
import type { WebsiteCommitOptions } from "@/lib/website/platform/types";

export type WebsiteManageAction =
  | {
      action: "catalog.upsert";
      item: {
        id?: string;
        type: CatalogItem["type"];
        title: string;
        description?: string;
        price?: string;
        category?: string;
        imageUrl?: string;
        specs?: Record<string, string>;
        status?: "draft" | "published" | "archived";
      };
    }
  | { action: "catalog.delete"; id: string }
  | {
      action: "cms.upsert";
      entry: Parameters<typeof upsertCmsEntry>[1];
    }
  | { action: "cms.delete"; id: string }
  | {
      action: "brand.apply";
      brand: Parameters<typeof applyBrandManagement>[0]["brand"];
    }
  | { action: "assistant"; message: string }
  | { action: "quality" }
  | {
      action: "pages.create";
      label: string;
      route?: string;
      purpose?: string;
    }
  | {
      action: "pages.update";
      route: string;
      label?: string;
      purpose?: string;
    }
  | { action: "pages.delete"; route: string }
  | { action: "pages.duplicate"; route: string }
  | { action: "pages.reorder"; routes: string[] }
  | { action: "pages.setHome"; route: string }
  | {
      action: "nav.update";
      links: Parameters<typeof updateNavLinks>[1];
    }
  | {
      action: "footer.update";
      links: Parameters<typeof updateFooterLinks>[1];
    };

export type WebsiteStructureServiceSuccess = {
  ok: true;
  kind: "quality" | "cms" | "mutation";
  notes?: string[];
  structure?: SiteStructurePlan;
  catalog?: CatalogItem[];
  cms?: Awaited<ReturnType<typeof listCmsEntries>>;
  quality?: ReturnType<typeof runPrePublishQualityControl>;
  assistant?: WebsiteAssistantRunResult | null;
  editCommand?: string;
  entry?: Awaited<ReturnType<typeof upsertCmsEntry>>;
  project?: GeneratedWebsiteProject;
  generation?: WebsiteGeneration;
};

export type WebsiteStructureServiceFailure = {
  ok: false;
  code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "SERVER";
  error: string;
};

export type WebsiteStructureServiceResult =
  | WebsiteStructureServiceSuccess
  | WebsiteStructureServiceFailure;

function managementInput(
  generation: WebsiteGeneration,
  project: GeneratedWebsiteProject,
  continueInstruction: string,
) {
  return {
    prompt:
      generation.business_description ||
      project.description ||
      "Website management update",
    language: generation.language || "English",
    theme:
      `${generation.design_style || ""} ${generation.color_style || ""}`.trim() ||
      "premium",
    features: generation.features || [],
    productId: "website-builder",
    projectId: generation.project_id || undefined,
    mode: "continue" as const,
    parentGenerationId: generation.id,
    continueInstruction,
  };
}

export async function executeWebsiteStructureMutation(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  action: WebsiteManageAction;
  commit?: Pick<WebsiteCommitOptions, "expectedRevision" | "idempotencyKey"> &
    Partial<Pick<WebsiteCommitOptions, "operation" | "mutationMeta">>;
}): Promise<WebsiteStructureServiceResult> {
  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Website not found." };
  }

  let project = toWebsiteProject(generation);
  const industryId =
    project.businessProfile?.industry ||
    project.designSystem?.industryPattern ||
    "business";
  let structure = resolveSiteStructureForProject(
    project.files || [],
    industryId,
    project.description,
  );
  const brandName = generation.project_name || project.title || "Brand";
  const notes: string[] = [];
  let assistantResult: WebsiteAssistantRunResult | null = null;

  async function syncCmsToProject() {
    const cms = await listCmsEntries(params.generationId, params.supabase);
    const files = injectCmsIntoFiles(project.files || [], cms, brandName);
    project = { ...project, files };
    notes.push("CMS synced to project files");
    return cms;
  }

  function syncStructureToProject() {
    project = {
      ...project,
      files: applyStructureToProjectFiles({
        files: project.files || [],
        structure,
        brandName,
      }),
    };
  }

  if (params.action.action === "quality") {
    const quality = runPrePublishQualityControl({
      files: project.files || [],
      structure,
    });
    return { ok: true, kind: "quality", quality };
  }

  if (params.action.action === "cms.upsert") {
    const entry = await upsertCmsEntry(params.generationId, params.action.entry, {
      userId: params.userId,
      client: params.supabase,
    });
    await syncCmsToProject();
    const committed = await commitBlueprintRevision({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      project,
      projectKind: project.projectKind || "website",
      input: managementInput(
        generation,
        project,
        `[website-management] CMS updated: ${entry.title}`,
      ),
      commit: {
        operation: params.commit?.operation ?? "website.manage.cms",
        expectedRevision: params.commit?.expectedRevision,
        idempotencyKey: params.commit?.idempotencyKey,
        mutationMeta: params.commit?.mutationMeta ?? {
          manageAction: "cms.upsert",
          entryId: entry.id,
        },
      },
    });
    if (!committed.ok) {
      return {
        ok: false,
        code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
        error: committed.error,
      };
    }
    return {
      ok: true,
      kind: "cms",
      entry,
      cms: await listCmsEntries(params.generationId, params.supabase),
      project: committed.project,
      generation: committed.generation,
    };
  }

  if (params.action.action === "cms.delete") {
    await deleteCmsEntry(params.generationId, params.action.id, params.supabase);
    await syncCmsToProject();
    const committed = await commitBlueprintRevision({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      project,
      projectKind: project.projectKind || "website",
      input: managementInput(
        generation,
        project,
        "[website-management] CMS entry deleted",
      ),
      commit: {
        operation: params.commit?.operation ?? "website.manage.cms",
        expectedRevision: params.commit?.expectedRevision,
        idempotencyKey: params.commit?.idempotencyKey,
        mutationMeta: params.commit?.mutationMeta ?? {
          manageAction: "cms.delete",
          entryId: params.action.id,
        },
      },
    });
    if (!committed.ok) {
      return {
        ok: false,
        code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
        error: committed.error,
      };
    }
    return {
      ok: true,
      kind: "cms",
      cms: await listCmsEntries(params.generationId, params.supabase),
      project: committed.project,
      generation: committed.generation,
    };
  }

  let catalog = parseCatalogFromFiles(project.files || []);

  if (params.action.action === "catalog.upsert") {
    catalog = upsertCatalogItem(catalog, params.action.item);
    project = {
      ...project,
      files: writeCatalogToFiles(project.files || [], catalog, industryId),
    };
    notes.push(`Catalog item saved: ${params.action.item.title}`);
  }

  if (params.action.action === "catalog.delete") {
    catalog = deleteCatalogItem(catalog, params.action.id);
    project = {
      ...project,
      files: writeCatalogToFiles(project.files || [], catalog, industryId),
    };
    notes.push("Catalog item deleted");
  }

  if (params.action.action === "brand.apply") {
    const result = applyBrandManagement({
      project,
      brand: params.action.brand,
    });
    project = result.project;
    notes.push(...result.notes);
  }

  if (params.action.action === "assistant") {
    assistantResult = runWebsiteAssistant({
      message: params.action.message,
      catalog,
    });
    if (assistantResult.catalog) {
      catalog = assistantResult.catalog;
      project = {
        ...project,
        files: writeCatalogToFiles(project.files || [], catalog, industryId),
      };
    }
    notes.push(...assistantResult.notes);
  }

  if (params.action.action === "pages.create") {
    structure = addPage(structure, params.action);
    syncStructureToProject();
    notes.push(`Page created: ${params.action.label}`);
  }

  if (params.action.action === "pages.update") {
    structure = updatePageMeta(structure, params.action.route, {
      label: params.action.label,
      purpose: params.action.purpose,
    });
    syncStructureToProject();
    notes.push(`Page updated: ${params.action.route}`);
  }

  if (params.action.action === "pages.delete") {
    structure = removePage(structure, params.action.route);
    syncStructureToProject();
    notes.push(`Page deleted: ${params.action.route}`);
  }

  if (params.action.action === "pages.duplicate") {
    structure = duplicatePage(structure, params.action.route);
    syncStructureToProject();
    notes.push(`Page duplicated: ${params.action.route}`);
  }

  if (params.action.action === "pages.reorder") {
    structure = reorderPages(structure, params.action.routes);
    syncStructureToProject();
    notes.push("Pages reordered");
  }

  if (params.action.action === "pages.setHome") {
    structure = setHomepage(structure, params.action.route);
    syncStructureToProject();
    notes.push(`Homepage set: ${params.action.route}`);
  }

  if (params.action.action === "nav.update") {
    structure = updateNavLinks(structure, params.action.links);
    syncStructureToProject();
    notes.push("Navigation updated");
  }

  if (params.action.action === "footer.update") {
    structure = updateFooterLinks(structure, params.action.links);
    syncStructureToProject();
    notes.push("Footer links updated");
  }

  const committed = await commitBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    project,
    projectKind: project.projectKind || "website",
    input: managementInput(
      generation,
      project,
      `[website-management] ${notes.join(" · ") || params.action.action}`,
    ),
    commit: {
      operation: params.commit?.operation ?? "website.manage",
      expectedRevision: params.commit?.expectedRevision,
      idempotencyKey: params.commit?.idempotencyKey,
      mutationMeta: params.commit?.mutationMeta ?? {
        manageAction: params.action.action,
      },
    },
  });

  if (!committed.ok) {
    return {
      ok: false,
      code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
      error: committed.error,
    };
  }

  const quality = runPrePublishQualityControl({
    files: committed.project.files || [],
    structure: resolveSiteStructureForProject(
      committed.project.files || [],
      industryId,
      project.description,
    ),
  });

  return {
    ok: true,
    kind: "mutation",
    notes,
    structure,
    catalog: parseCatalogFromFiles(committed.project.files || []),
    cms: await listCmsEntries(params.generationId, params.supabase),
    quality,
    assistant: assistantResult,
    editCommand: assistantResult?.editCommand,
    project: committed.project,
    generation: committed.generation,
  };
}
