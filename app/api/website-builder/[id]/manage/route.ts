import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  resolveSiteStructureForProject,
  parseCatalogFromFiles,
  runPrePublishQualityControl,
  listCmsEntries,
  listMediaAssets,
} from "@/lib/ai-core/website-management";
import { listWebsiteLeads } from "@/lib/ai-core/website-design-platform";
import { resolveBrandLogoUrl } from "@/lib/ai-core/website-management/brand/resolve-logo";
import { executeWebsiteStructureMutation } from "@/lib/website/platform/services/structure-service";
import { toWebsiteProject, loadWebsiteGenerationForUser } from "@/lib/website/platform/load-generation";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function toProject(generation: WebsiteGeneration): GeneratedWebsiteProject {
  return toWebsiteProject(generation);
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

  const generation = await loadWebsiteGenerationForUser(
    auth.supabase!,
    auth.user!.id,
    parsedId.id,
  );

  if (!generation) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

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

const manageActionSchema = z.discriminatedUnion("action", [
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

const manageBodySchema = manageActionSchema.and(
  z.object({
    expectedRevision: z.number().int().min(0).optional(),
    idempotencyKey: z.string().trim().max(128).optional(),
  }),
);

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

  const parsed = manageBodySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { expectedRevision, idempotencyKey, ...action } = parsed.data;

  try {
    const result = await executeWebsiteStructureMutation({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId,
      action,
      commit: { expectedRevision, idempotencyKey },
    });

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, result.error);
      }
      if (result.code === "VALIDATION") {
        return apiValidationError(result.error);
      }
      if (result.code === "CONFLICT") {
        return apiErrorResponse(API_ERROR_CODES.CONFLICT, 409, result.error);
      }
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, result.error);
    }

    if (result.kind === "quality") {
      return NextResponse.json({ ok: true, quality: result.quality });
    }

    if (result.kind === "cms") {
      return NextResponse.json({
        ok: true,
        entry: result.entry,
        cms: result.cms,
        project: result.project,
        generation: result.generation,
      });
    }

    return NextResponse.json({
      ok: true,
      notes: result.notes,
      structure: result.structure,
      catalog: result.catalog,
      cms: result.cms,
      quality: result.quality,
      assistant: result.assistant,
      editCommand: result.editCommand,
      project: result.project,
      generation: result.generation,
    });
  } catch (error) {
    return serverErrorResponse("website-builder.manage", error);
  }
}
