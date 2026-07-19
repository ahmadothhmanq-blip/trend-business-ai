import type { SupabaseClient } from "@supabase/supabase-js";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { emptyTokenUsage } from "@/lib/ai/usage";
import { appendPromptVersion } from "@/lib/workspace/persist";
import { ensureStaticPreviewFile } from "@/lib/website/build-static-preview";
import { logger } from "@/lib/logger";
import type {
  PromptVersion,
  TokenUsage,
  WebsiteBlueprint,
  WebsiteGeneration,
} from "@/types/database";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { GenerationMode } from "@/types/database";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function normalizeTokenUsage(usage: unknown): TokenUsage {
  if (!usage || typeof usage !== "object") return emptyTokenUsage();
  const u = usage as Partial<TokenUsage>;
  const promptTokens = Number(u.promptTokens) || 0;
  const completionTokens = Number(u.completionTokens) || 0;
  return {
    promptTokens,
    completionTokens,
    totalTokens:
      Number(u.totalTokens) || promptTokens + completionTokens,
  };
}

function isMissingColumnError(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes("column") ||
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("could not find")
  );
}

function isFkOrNullConstraintError(message: string, code?: string): boolean {
  const msg = message.toLowerCase();
  return (
    code === "23503" ||
    code === "23502" ||
    msg.includes("foreign key") ||
    msg.includes("violates not-null") ||
    msg.includes("null value in column")
  );
}

export async function ensureWebsiteWorkspaceProject(
  supabase: SupabaseClient,
  params: {
    userId: string;
    name: string;
    productId?: string | null;
    projectId?: string | null;
  },
) {
  if (params.projectId) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.projectId)
      .eq("user_id", params.userId)
      .maybeSingle();
    if (data) return data;
  }

  const productId = params.productId ?? "website-builder";

  const { data: existing } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", params.userId)
    .eq("product_id", productId)
    .is("workspace_type", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("projects")
      .update({
        name: params.name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return existing;
  }

  const { data: created, error } = await supabase
    .from("projects")
    .insert({
      user_id: params.userId,
      name: params.name,
      product_id: productId,
      workspace_type: null,
      description: "AI Website Builder versions",
    })
    .select("*")
    .single();

  if (error || !created) {
    console.error("[website] ensureWebsiteWorkspaceProject failed:", error);
    return null;
  }

  return created;
}

export async function persistWebsiteGeneration(args: {
  supabase: SupabaseClient;
  userId: string;
  project: GeneratedWebsiteProject & {
    provider?: string;
    usage?: unknown;
    generationTimeMs?: number;
  };
  input: {
    prompt: string;
    language: string;
    theme: string;
    features: string[];
    productId?: string;
    projectId?: string;
    mode?: GenerationMode;
    parentGenerationId?: string;
    continueInstruction?: string;
  };
  projectKind: "website" | "web_application";
  /** When set, update the running session row instead of inserting a new one. */
  existingGenerationId?: string | null;
}): Promise<
  | { ok: true; generation: WebsiteGeneration; project: GeneratedWebsiteProject }
  | { ok: false; error: string }
> {
  const heroAsset = args.project.assetManifest?.items?.find(
    (item) => item.role === "hero" && item.url,
  );
  const { buildIndustryCopyPack, industryContentForPreview } = await import(
    "@/lib/ai-core/content/industry-copy"
  );
  const copyPack = buildIndustryCopyPack({
    industryId: args.project.businessProfile?.industry,
    profile: args.project.businessProfile as never,
    strategy: args.project.strategy as never,
  });
  const primaryCta =
    args.project.strategy?.ctas?.[0] ||
    args.project.strategy?.pages?.[0]?.primaryCta ||
    copyPack.primaryCta;
  const previewContent =
    args.project.content?.length && args.project.content.join("").length > 80
      ? args.project.content
      : industryContentForPreview(copyPack);

  const files = ensureStaticPreviewFile({
    title: args.project.title || copyPack.heroHeadline,
    description:
      args.project.description || copyPack.heroSubheadline,
    pages: args.project.pages,
    sections: args.project.sections,
    colorPalette:
      args.project.designSystem
        ? [
            args.project.designSystem.colors.primary,
            args.project.designSystem.colors.secondary,
            args.project.designSystem.colors.accent,
            args.project.designSystem.colors.neutral,
            args.project.designSystem.colors.surface,
            args.project.designSystem.colors.background,
            args.project.designSystem.colors.foreground,
          ]
        : args.project.colorPalette,
    typography: args.project.designSystem
      ? [
          args.project.designSystem.typography.headingFont,
          args.project.designSystem.typography.bodyFont,
          ...args.project.designSystem.typography.scale,
        ]
      : args.project.typography,
    content: previewContent,
    components: args.project.components,
    heroImageUrl: heroAsset?.url,
    primaryCta,
    files: args.project.files,
  });

  const savedProject: GeneratedWebsiteProject = {
    ...args.project,
    files,
    prompt: args.input.prompt,
    generatedAt: new Date().toISOString(),
    settings: {
      framework: "Next.js App Router",
      styling: "Tailwind CSS",
      packageManager: "npm",
      deploymentTarget: "Vercel or Node hosting",
      ...args.project.settings,
    },
    progressEvents: [
      ...(args.project.progressEvents ?? []),
      "Building product preview...",
      "Saving project to workspace...",
      "Done.",
    ],
  };

  const workspaceProject = await ensureWebsiteWorkspaceProject(args.supabase, {
    userId: args.userId,
    name: savedProject.title,
    productId: args.input.productId ?? "website-builder",
    projectId: args.input.projectId,
  });

  // Resolve parent FK safely — never insert a dangling parent_generation_id.
  let parentPromptVersions: PromptVersion[] = [];
  let parentGenerationId: string | null = null;
  if (isUuid(args.input.parentGenerationId)) {
    const { data: parent } = await args.supabase
      .from("website_generations")
      .select("id, prompt_versions")
      .eq("id", args.input.parentGenerationId)
      .eq("user_id", args.userId)
      .maybeSingle();
    if (parent?.id) {
      parentGenerationId = parent.id;
      parentPromptVersions =
        (parent.prompt_versions as PromptVersion[] | null) ?? [];
    } else {
      logger.warn("wb-save parent generation missing; clearing FK", "wb-save", {
        parentGenerationId: args.input.parentGenerationId,
      });
    }
  }

  // Resolve project_id safely — prefer ensured workspace project; verify client id.
  let projectId: string | null = workspaceProject?.id ?? null;
  if (!projectId && isUuid(args.input.projectId)) {
    const { data: existingProject } = await args.supabase
      .from("projects")
      .select("id")
      .eq("id", args.input.projectId)
      .eq("user_id", args.userId)
      .maybeSingle();
    projectId = existingProject?.id ?? null;
    if (!projectId) {
      logger.warn("wb-save project_id missing; clearing FK", "wb-save", {
        projectId: args.input.projectId,
      });
    }
  }

  const versionPrompt =
    args.input.mode === "continue"
      ? args.input.continueInstruction?.trim() || args.input.prompt
      : args.input.prompt;

  const promptVersions = appendPromptVersion(
    parentPromptVersions,
    versionPrompt,
    args.input.mode ?? "generate",
  );

  const tokenUsage = normalizeTokenUsage(args.project.usage);

  const coreRow = {
    user_id: args.userId,
    project_name: savedProject.title || "Untitled website",
    website_type:
      args.projectKind === "web_application" ? "Web Application" : "Website",
    business_description:
      savedProject.description || args.input.prompt || "Generated website",
    target_audience:
      savedProject.businessProfile?.targetAudience ||
      "Auto-detected from project prompt",
    language: args.input.language || "English",
    color_style:
      savedProject.designSystem?.colors.primary || args.input.theme || "modern",
    design_style:
      savedProject.designSystem?.style || args.input.theme || "modern",
    page_count: String(savedProject.pages?.length || 1),
    features: Array.isArray(args.input.features)
      ? [
          ...args.input.features.filter((f) => typeof f === "string" && f.trim()),
          ...(args.input.productId ? [`product:${args.input.productId}`] : []),
        ]
      : args.input.productId
        ? [`product:${args.input.productId}`]
        : [],
    blueprint: savedProject as unknown as WebsiteBlueprint,
  };

  const phase5Row = {
    ...coreRow,
    product_id: args.input.productId ?? "website-builder",
    project_id: projectId,
    status: "completed" as const,
    mode: args.input.mode ?? "generate",
    parent_generation_id: parentGenerationId,
    provider: args.project.provider ?? getActiveProvider(),
    // NOT NULL column — never send null/undefined
    token_usage: tokenUsage,
    generation_time_ms:
      typeof args.project.generationTimeMs === "number"
        ? Math.max(0, Math.round(args.project.generationTimeMs))
        : null,
    prompt_versions: promptVersions,
    attachments: [] as unknown[],
  };

  const existingId =
    isUuid(args.existingGenerationId) ? args.existingGenerationId : null;

  logger.info("Final database save start", "wb-save", {
    userId: args.userId,
    title: savedProject.title,
    fileCount: savedProject.files.length,
    mode: phase5Row.mode,
    parentGenerationId,
    projectId,
    tokenUsage,
    existingGenerationId: existingId,
  });

  let result: {
    data: WebsiteGeneration | null;
    error: { message?: string; code?: string; details?: string; hint?: string } | null;
  };

  if (existingId) {
    const updated = await args.supabase
      .from("website_generations")
      .update({
        ...phase5Row,
        status: "completed",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingId)
      .eq("user_id", args.userId)
      .select("*")
      .single();
    result = {
      data: (updated.data as WebsiteGeneration | null) ?? null,
      error: updated.error,
    };

    if (result.error && isMissingColumnError(result.error.message ?? "")) {
      const coreUpdate = await args.supabase
        .from("website_generations")
        .update({
          ...coreRow,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingId)
        .eq("user_id", args.userId)
        .select("*")
        .single();
      result = {
        data: (coreUpdate.data as WebsiteGeneration | null) ?? null,
        error: coreUpdate.error,
      };
    }
  } else {
    const inserted = await args.supabase
      .from("website_generations")
      .insert(phase5Row)
      .select("*")
      .single();
    result = {
      data: (inserted.data as WebsiteGeneration | null) ?? null,
      error: inserted.error,
    };

    if (result.error) {
      const message = result.error.message ?? "";
      const code = result.error.code;
      const missingCol = isMissingColumnError(message);
      const fkOrNull = isFkOrNullConstraintError(message, code);

      logger.warn("Final database save primary insert failed", "wb-save", {
        message,
        code,
        details: result.error.details,
        hint: result.error.hint,
        fallback: missingCol
          ? "coreRow"
          : fkOrNull
            ? "phase5Row_cleared_fks"
            : "none",
      });

      if (missingCol) {
        const coreInsert = await args.supabase
          .from("website_generations")
          .insert(coreRow)
          .select("*")
          .single();
        result = {
          data: (coreInsert.data as WebsiteGeneration | null) ?? null,
          error: coreInsert.error,
        };
      } else if (fkOrNull) {
        const cleared = await args.supabase
          .from("website_generations")
          .insert({
            ...phase5Row,
            project_id: null,
            parent_generation_id: null,
            token_usage: tokenUsage,
            prompt_versions: promptVersions,
            attachments: [],
          })
          .select("*")
          .single();
        result = {
          data: (cleared.data as WebsiteGeneration | null) ?? null,
          error: cleared.error,
        };
      }
    }
  }

  if (result.error || !result.data) {
    logger.error("Final database save failed", "wb-save", {
      message: result.error?.message ?? "Failed to save generation.",
      code: result.error?.code,
      details: result.error?.details,
      hint: result.error?.hint,
    });
    return {
      ok: false,
      error: result.error?.message ?? "Failed to save generation.",
    };
  }

  logger.info("Final database save ok", "wb-save", {
    generationId: result.data.id,
    fileCount: savedProject.files.length,
    projectId: result.data.project_id ?? null,
    parentGenerationId: result.data.parent_generation_id ?? null,
  });

  return {
    ok: true,
    generation: result.data as WebsiteGeneration,
    project: savedProject,
  };
}
