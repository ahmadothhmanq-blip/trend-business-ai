import type { SupabaseClient } from "@supabase/supabase-js";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { appendPromptVersion } from "@/lib/workspace/persist";
import { ensureStaticPreviewFile } from "@/lib/website/build-static-preview";
import type { PromptVersion, WebsiteBlueprint, WebsiteGeneration } from "@/types/database";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { GenerationMode } from "@/types/database";

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
}): Promise<
  | { ok: true; generation: WebsiteGeneration; project: GeneratedWebsiteProject }
  | { ok: false; error: string }
> {
  const heroAsset = args.project.assetManifest?.items?.find(
    (item) => item.role === "hero" && item.url,
  );
  const primaryCta =
    args.project.strategy?.ctas?.[0] ||
    args.project.strategy?.pages?.[0]?.primaryCta;

  const files = ensureStaticPreviewFile({
    title: args.project.title,
    description: args.project.description,
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
    content: args.project.content,
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

  let parentPromptVersions: PromptVersion[] = [];
  if (args.input.parentGenerationId) {
    const { data: parent } = await args.supabase
      .from("website_generations")
      .select("prompt_versions")
      .eq("id", args.input.parentGenerationId)
      .eq("user_id", args.userId)
      .maybeSingle();
    parentPromptVersions = (parent?.prompt_versions as PromptVersion[] | null) ?? [];
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

  const coreRow = {
    user_id: args.userId,
    project_name: savedProject.title,
    website_type:
      args.projectKind === "web_application" ? "Web Application" : "Website",
    business_description: savedProject.description,
    target_audience:
      savedProject.businessProfile?.targetAudience ||
      "Auto-detected from project prompt",
    language: args.input.language,
    color_style:
      savedProject.designSystem?.colors.primary || args.input.theme,
    design_style:
      savedProject.designSystem?.style || args.input.theme,
    page_count: String(savedProject.pages.length || 1),
    features: [
      ...args.input.features,
      ...(args.input.productId ? [`product:${args.input.productId}`] : []),
    ],
    blueprint: savedProject as unknown as WebsiteBlueprint,
  };

  const phase5Row = {
    ...coreRow,
    product_id: args.input.productId ?? "website-builder",
    project_id: workspaceProject?.id ?? args.input.projectId ?? null,
    status: "completed",
    mode: args.input.mode ?? "generate",
    parent_generation_id: args.input.parentGenerationId ?? null,
    provider: args.project.provider ?? getActiveProvider(),
    token_usage: args.project.usage,
    generation_time_ms: args.project.generationTimeMs,
    prompt_versions: promptVersions,
    attachments: [],
  };

  let result = await args.supabase
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
      result = await args.supabase
        .from("website_generations")
        .insert(coreRow)
        .select("*")
        .single();
    }
  }

  if (result.error || !result.data) {
    return { ok: false, error: result.error?.message ?? "Failed to save generation." };
  }

  return {
    ok: true,
    generation: result.data as WebsiteGeneration,
    project: savedProject,
  };
}
