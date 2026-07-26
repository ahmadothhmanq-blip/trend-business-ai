import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
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
  runWebsiteAssistant,
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
  listMediaAssets,
} from "@/lib/ai-core/website-management";
import { listWebsiteLeads } from "@/lib/ai-core/website-design-platform";
import { resolveBrandLogoUrl } from "@/lib/ai-core/website-management/brand/resolve-logo";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function toProject(generation: WebsiteGeneration): GeneratedWebsiteProject {
  const blueprint = (generation.blueprint ||
    {}) as unknown as GeneratedWebsiteProject;
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
  return {
    ...blueprint,
    projectKind: blueprint.projectKind || "website",
    title: blueprint.title || generation.project_name || "Website",
    description:
      blueprint.description || generation.business_description || "",
    pages: blueprint.pages || [],
    sections: blueprint.sections || [],
    colorPalette: blueprint.colorPalette || [],
    typography: blueprint.typography || [],
    components: blueprint.components || [],
    content: blueprint.content || [],
    seo: blueprint.seo || [],
    roadmap: blueprint.roadmap || [],
    files: files.length ? files : blueprint.files || [],
    businessProfile: blueprint.businessProfile,
    strategy: blueprint.strategy,
    designSystem: blueprint.designSystem,
    assetManifest: blueprint.assetManifest,
    seoPackage: blueprint.seoPackage,
    qualityReport: blueprint.qualityReport,
  };
}

/**
 * GET — Website management dashboard payload.
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;
  const generationId = parsedId.id;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }
  if (!data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  const generation = data as WebsiteGeneration;
  const project = toProject(generation);
  const industryId =
    project.businessProfile?.industry ||
    project.designSystem?.industryPattern ||
    "business";
  const structure = resolveSiteStructureForProject(
    project.files || [],
    industryId,
    project.description || generation.business_description,
  );
  const catalog = parseCatalogFromFiles(project.files || []);
  const quality = runPrePublishQualityControl({
    files: project.files || [],
    structure,
  });
  const cms = await listCmsEntries(parsedId.id, auth.supabase);
  const leads = await listWebsiteLeads(parsedId.id, auth.supabase);
  const media = await listMediaAssets(parsedId.id, { client: auth.supabase });

  return NextResponse.json({
    generation,
    project,
    structure,
    catalog,
    cms,
    media,
    leads,
    quality,
    brand: {
      businessName: generation.project_name || project.title,
      primary: project.designSystem?.colors?.primary,
      secondary: project.designSystem?.colors?.secondary,
      accent: project.designSystem?.colors?.accent,
      displayFont: project.designSystem?.typography?.headingFont,
      bodyFont: project.designSystem?.typography?.bodyFont,
      logoUrl: resolveBrandLogoUrl(project),
    },
  });
}

const manageSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("catalog.upsert"),
    item: z.object({
      id: z.string().optional(),
      type: z.enum([
        "menu-item",
        "vehicle",
        "property",
        "product",
        "service",
        "offer",
      ]),
      title: z.string().min(1),
      description: z.string().optional(),
      price: z.string().optional(),
      category: z.string().optional(),
      imageUrl: z.string().optional(),
      specs: z.record(z.string(), z.string()).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }),
  }),
  z.object({
    action: z.literal("catalog.delete"),
    id: z.string().min(1),
  }),
  z.object({
    action: z.literal("cms.upsert"),
    entry: z.object({
      id: z.string().optional(),
      kind: z.enum(["page-block", "post", "announcement", "media"]),
      title: z.string().min(1),
      body: z.string().optional(),
      mediaUrl: z.string().optional(),
      pagePath: z.string().optional(),
      slug: z.string().optional(),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      seoJson: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          keywords: z.array(z.string()).optional(),
        })
        .optional(),
      scheduledAt: z.string().nullable().optional(),
      published: z.boolean().optional(),
    }),
  }),
  z.object({
    action: z.literal("cms.delete"),
    id: z.string().min(1),
  }),
  z.object({
    action: z.literal("brand.apply"),
    brand: z.object({
      businessName: z.string().min(1),
      logoUrl: z.string().nullable().optional(),
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      displayFont: z.string().optional(),
      bodyFont: z.string().optional(),
      brandIdentityId: z.string().nullable().optional(),
    }),
  }),
  z.object({
    action: z.literal("assistant"),
    message: z.string().min(2),
  }),
  z.object({
    action: z.literal("quality"),
  }),
  z.object({
    action: z.literal("pages.create"),
    label: z.string().min(1),
    route: z.string().optional(),
    purpose: z.string().optional(),
  }),
  z.object({
    action: z.literal("pages.update"),
    route: z.string().min(1),
    label: z.string().optional(),
    purpose: z.string().optional(),
  }),
  z.object({
    action: z.literal("pages.delete"),
    route: z.string().min(1),
  }),
  z.object({
    action: z.literal("pages.duplicate"),
    route: z.string().min(1),
  }),
  z.object({
    action: z.literal("pages.reorder"),
    routes: z.array(z.string()).min(1),
  }),
  z.object({
    action: z.literal("pages.setHome"),
    route: z.string().min(1),
  }),
  z.object({
    action: z.literal("nav.update"),
    links: z.array(
      z.object({
        href: z.string(),
        label: z.string(),
        children: z
          .array(z.object({ href: z.string(), label: z.string() }))
          .optional(),
      }),
    ),
  }),
  z.object({
    action: z.literal("footer.update"),
    links: z.array(
      z.object({
        href: z.string(),
        label: z.string(),
        children: z
          .array(z.object({ href: z.string(), label: z.string() }))
          .optional(),
      }),
    ),
  }),
]);

/**
 * POST — Management mutations (catalog, CMS, brand, assistant, quality).
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;
  const generationId = parsedId.id;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = manageSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  try {
    const { data, error } = await auth.supabase
      .from("website_generations")
      .select("*")
      .eq("id", parsedId.id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
    }

    const generation = data as WebsiteGeneration;
    let project = toProject(generation);
    const industryId =
      project.businessProfile?.industry ||
      project.designSystem?.industryPattern ||
      "business";
    let structure = resolveSiteStructureForProject(
      project.files || [],
      industryId,
      project.description,
    );
    const action = parsed.data;
    const notes: string[] = [];
    let assistantResult: ReturnType<typeof runWebsiteAssistant> | null = null;
    const brandName =
      generation.project_name || project.title || "Brand";

    async function syncCmsToProject() {
      const cms = await listCmsEntries(generationId, auth.supabase);
      const files = injectCmsIntoFiles(
        project.files || [],
        cms,
        brandName,
      );
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

    if (action.action === "quality") {
      const quality = runPrePublishQualityControl({
        files: project.files || [],
        structure,
      });
      return NextResponse.json({ ok: true, quality });
    }

    if (action.action === "cms.upsert") {
      const entry = await upsertCmsEntry(generationId, action.entry, {
        userId: auth.user!.id,
        client: auth.supabase,
      });
      await syncCmsToProject();
      const saved = await persistWebsiteGeneration({
        supabase: auth.supabase,
        userId: auth.user!.id,
        project,
        projectKind: project.projectKind || "website",
        existingGenerationId: generation.id,
        input: {
          prompt:
            generation.business_description ||
            project.description ||
            "Website management update",
          language: generation.language || "English",
          theme: `${generation.design_style || ""} ${generation.color_style || ""}`.trim() ||
            "premium",
          features: generation.features || [],
          productId: "website-builder",
          projectId: generation.project_id || undefined,
          mode: "continue",
          parentGenerationId: generation.id,
          continueInstruction: `[website-management] CMS updated: ${entry.title}`,
        },
      });
      if (!saved.ok) {
        return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, saved.error);
      }
      return NextResponse.json({
        ok: true,
        entry,
        cms: await listCmsEntries(generationId, auth.supabase),
        project: saved.project,
        generation: saved.generation,
      });
    }

    if (action.action === "cms.delete") {
      await deleteCmsEntry(generationId, action.id, auth.supabase);
      await syncCmsToProject();
      const saved = await persistWebsiteGeneration({
        supabase: auth.supabase,
        userId: auth.user!.id,
        project,
        projectKind: project.projectKind || "website",
        existingGenerationId: generation.id,
        input: {
          prompt:
            generation.business_description ||
            project.description ||
            "Website management update",
          language: generation.language || "English",
          theme: `${generation.design_style || ""} ${generation.color_style || ""}`.trim() ||
            "premium",
          features: generation.features || [],
          productId: "website-builder",
          projectId: generation.project_id || undefined,
          mode: "continue",
          parentGenerationId: generation.id,
          continueInstruction: "[website-management] CMS entry deleted",
        },
      });
      if (!saved.ok) {
        return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, saved.error);
      }
      return NextResponse.json({
        ok: true,
        cms: await listCmsEntries(generationId, auth.supabase),
        project: saved.project,
        generation: saved.generation,
      });
    }

    let catalog = parseCatalogFromFiles(project.files || []);

    if (action.action === "catalog.upsert") {
      catalog = upsertCatalogItem(catalog, action.item);
      project = {
        ...project,
        files: writeCatalogToFiles(project.files || [], catalog, industryId),
      };
      notes.push(`Catalog item saved: ${action.item.title}`);
    }

    if (action.action === "catalog.delete") {
      catalog = deleteCatalogItem(catalog, action.id);
      project = {
        ...project,
        files: writeCatalogToFiles(project.files || [], catalog, industryId),
      };
      notes.push("Catalog item deleted");
    }

    if (action.action === "brand.apply") {
      const result = applyBrandManagement({
        project,
        brand: action.brand,
      });
      project = result.project;
      notes.push(...result.notes);
    }

    if (action.action === "assistant") {
      assistantResult = runWebsiteAssistant({
        message: action.message,
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

    if (action.action === "pages.create") {
      structure = addPage(structure, action);
      syncStructureToProject();
      notes.push(`Page created: ${action.label}`);
    }

    if (action.action === "pages.update") {
      structure = updatePageMeta(structure, action.route, {
        label: action.label,
        purpose: action.purpose,
      });
      syncStructureToProject();
      notes.push(`Page updated: ${action.route}`);
    }

    if (action.action === "pages.delete") {
      structure = removePage(structure, action.route);
      syncStructureToProject();
      notes.push(`Page deleted: ${action.route}`);
    }

    if (action.action === "pages.duplicate") {
      structure = duplicatePage(structure, action.route);
      syncStructureToProject();
      notes.push(`Page duplicated: ${action.route}`);
    }

    if (action.action === "pages.reorder") {
      structure = reorderPages(structure, action.routes);
      syncStructureToProject();
      notes.push("Pages reordered");
    }

    if (action.action === "pages.setHome") {
      structure = setHomepage(structure, action.route);
      syncStructureToProject();
      notes.push(`Homepage set: ${action.route}`);
    }

    if (action.action === "nav.update") {
      structure = updateNavLinks(structure, action.links);
      syncStructureToProject();
      notes.push("Navigation updated");
    }

    if (action.action === "footer.update") {
      structure = updateFooterLinks(structure, action.links);
      syncStructureToProject();
      notes.push("Footer links updated");
    }

    const saved = await persistWebsiteGeneration({
      supabase: auth.supabase,
      userId: auth.user!.id,
      project,
      projectKind: project.projectKind || "website",
      existingGenerationId: generation.id,
      input: {
        prompt:
          generation.business_description ||
          project.description ||
          "Website management update",
        language: generation.language || "English",
        theme: `${generation.design_style || ""} ${generation.color_style || ""}`.trim() ||
          "premium",
        features: generation.features || [],
        productId: "website-builder",
        projectId: generation.project_id || undefined,
        mode: "continue",
        parentGenerationId: generation.id,
        continueInstruction: `[website-management] ${notes.join(" · ") || action.action}`,
      },
    });

    if (!saved.ok) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, saved.error);
    }

    const quality = runPrePublishQualityControl({
      files: saved.project.files || [],
      structure: resolveSiteStructureForProject(
        saved.project.files || [],
        industryId,
        project.description,
      ),
    });

    return NextResponse.json({
      ok: true,
      notes,
      structure,
      catalog: parseCatalogFromFiles(saved.project.files || []),
      cms: await listCmsEntries(generationId, auth.supabase),
      quality,
      assistant: assistantResult,
      editCommand: assistantResult?.editCommand,
      project: saved.project,
      generation: saved.generation,
    });
  } catch (error) {
    return serverErrorResponse("website-builder.manage", error);
  }
}
