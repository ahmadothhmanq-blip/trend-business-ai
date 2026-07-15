import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateWebsite } from "@/lib/website-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import type { WebsiteBlueprint, WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";
import { z } from "zod";

const websiteRequestSchema = z.object({
  prompt: z.string().trim().min(10, "Describe your project in at least 10 characters."),
  projectType: z.string().trim().min(1, "Select a project type."),
  language: z.string().trim().min(1, "Select a language."),
  theme: z.string().trim().min(1, "Select a theme."),
  features: z.array(z.string().trim()).default([]),
  productId: z.string().trim().optional(),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

function detectProjectKind(input: z.infer<typeof websiteRequestSchema>) {
  const signal = [
    input.prompt,
    input.projectType,
    ...input.features,
  ]
    .join(" ")
    .toLowerCase();
  const appSignals = [
    "app",
    "application",
    "dashboard",
    "admin",
    "crm",
    "erp",
    "saas",
    "authentication",
    "auth",
    "login",
    "sign in",
    "signup",
    "register",
    "portal",
    "platform",
    "payments",
    "payment",
    "analytics",
    "database",
    "workflow",
    "kanban",
    "management",
    "booking system",
    "user roles",
    "api",
    "api route",
    "crud",
    "mobile app",
    "web app",
  ];

  return appSignals.some((keyword) => signal.includes(keyword))
    ? "web_application"
    : "website";
}

function logWebsiteBuilderError(stage: string, error: unknown) {
  const stack =
    error instanceof Error
      ? (error.stack ?? error.message)
      : JSON.stringify(error, null, 2);

  console.error(`[website-builder:${stage}]`, stack);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("website_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(
    ["project_name", "business_description", "website_type"],
    search,
  );
  if (orFilter) {
    query = query.or(orFilter);
  }

  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return databaseErrorResponse("website-builder.list", error);
  }

  const total = count ?? 0;

  return NextResponse.json({
    generations: data as WebsiteGeneration[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "website-builder");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = websiteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const projectKind = detectProjectKind(input);

  let stage = "generateWebsite";

  try {
    const project = await generateWebsite({
      ...input,
      projectKind,
    });
    const savedProjectKind = project.projectKind ?? projectKind;
    const savedProject = {
      ...project,
      projectKind: savedProjectKind,
      prompt: input.prompt,
      generatedAt: new Date().toISOString(),
      settings: {
        framework: "Next.js App Router",
        styling: "Tailwind CSS",
        packageManager: "npm",
        deploymentTarget: "Vercel or Node hosting",
        ...project.settings,
      },
      progressEvents: [
        ...(project.progressEvents ?? []),
        "Saving project..." as const,
        "Done." as const,
      ],
    };
    stage = "supabase.insert.website_generations";

    const coreRow = {
      user_id: auth.user!.id,
      project_name: savedProject.title,
      website_type: savedProjectKind === "web_application" ? "Web Application" : "Website",
      business_description: savedProject.description,
      target_audience: "Auto-detected from project prompt",
      language: input.language,
      color_style: input.theme,
      design_style: input.theme,
      page_count: String(savedProject.pages.length || 1),
      features: [
        ...input.features,
        ...(input.productId ? [`product:${input.productId}`] : []),
      ],
      blueprint: savedProject as unknown as WebsiteBlueprint,
    };

    const phase5Row = {
      ...coreRow,
      product_id: input.productId ?? null,
      project_id: input.projectId ?? null,
      status: "completed",
      mode: input.mode ?? "generate",
      parent_generation_id: input.parentGenerationId ?? null,
      provider: project.provider ?? getActiveProvider(),
      token_usage: project.usage,
      generation_time_ms: project.generationTimeMs,
      prompt_versions: [
        {
          id: crypto.randomUUID(),
          prompt: input.prompt,
          createdAt: new Date().toISOString(),
          mode: input.mode ?? "generate",
        },
      ],
      attachments: [],
    };

    let result = await auth.supabase
      .from("website_generations")
      .insert(phase5Row)
      .select("*")
      .single();

    if (result.error) {
      const msg = result.error.message?.toLowerCase() ?? "";
      const missingCol =
        msg.includes("column") ||
        msg.includes("does not exist") ||
        msg.includes("schema cache");

      if (missingCol) {
        console.warn("[website-builder] Phase 5 columns missing — falling back to core insert");
        result = await auth.supabase
          .from("website_generations")
          .insert(coreRow)
          .select("*")
          .single();
      }
    }

    const { data, error } = result;

    if (error) {
      logWebsiteBuilderError(stage, error);
      return databaseErrorResponse("website-builder.insert", error);
    }

    return NextResponse.json({
      project: savedProject,
      generation: data as WebsiteGeneration,
      message: "Generated project saved.",
    });
  } catch (error) {
    logWebsiteBuilderError(stage, error);
    return serverErrorResponse(
      stage,
      error,
      "Unable to generate website application.",
    );
  }
}
