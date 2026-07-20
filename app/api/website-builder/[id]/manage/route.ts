import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  resolveSiteStructure,
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
} from "@/lib/ai-core/website-management";
import { listWebsiteLeads } from "@/lib/ai-core/website-design-platform";
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

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const generation = data as WebsiteGeneration;
  const project = toProject(generation);
  const industryId =
    project.businessProfile?.industry ||
    project.designSystem?.industryPattern ||
    "business";
  const structure = resolveSiteStructure(
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

  return NextResponse.json({
    generation,
    project,
    structure,
    catalog,
    cms,
    leads,
    quality,
    brand: {
      businessName: generation.project_name || project.title,
      primary: project.designSystem?.colors?.primary,
      secondary: project.designSystem?.colors?.secondary,
      accent: project.designSystem?.colors?.accent,
      displayFont: project.designSystem?.typography?.headingFont,
      bodyFont: project.designSystem?.typography?.bodyFont,
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
]);

/**
 * POST — Management mutations (catalog, CMS, brand, assistant, quality).
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
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
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
      return NextResponse.json({ error: "Website not found." }, { status: 404 });
    }

    const generation = data as WebsiteGeneration;
    let project = toProject(generation);
    const industryId =
      project.businessProfile?.industry ||
      project.designSystem?.industryPattern ||
      "business";
    const structure = resolveSiteStructure(industryId, project.description);
    const action = parsed.data;
    const notes: string[] = [];
    let assistantResult: ReturnType<typeof runWebsiteAssistant> | null = null;

    if (action.action === "quality") {
      const quality = runPrePublishQualityControl({
        files: project.files || [],
        structure,
      });
      return NextResponse.json({ ok: true, quality });
    }

    if (action.action === "cms.upsert") {
      const entry = await upsertCmsEntry(parsedId.id, action.entry, {
        userId: auth.user!.id,
        client: auth.supabase,
      });
      return NextResponse.json({
        ok: true,
        entry,
        cms: await listCmsEntries(parsedId.id, auth.supabase),
      });
    }

    if (action.action === "cms.delete") {
      await deleteCmsEntry(parsedId.id, action.id, auth.supabase);
      return NextResponse.json({
        ok: true,
        cms: await listCmsEntries(parsedId.id, auth.supabase),
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
      return NextResponse.json({ error: saved.error }, { status: 500 });
    }

    const quality = runPrePublishQualityControl({
      files: saved.project.files || [],
      structure,
    });

    return NextResponse.json({
      ok: true,
      notes,
      catalog: parseCatalogFromFiles(saved.project.files || []),
      cms: await listCmsEntries(parsedId.id, auth.supabase),
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
