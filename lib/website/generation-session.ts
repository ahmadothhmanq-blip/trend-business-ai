/**
 * Website Builder generation sessions — running / partial / failed rows
 * so disconnects do not lose the whole project and clients can resume.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { emptyTokenUsage } from "@/lib/ai/usage";
import { logger } from "@/lib/logger";
import { ensureWebsiteWorkspaceProject } from "@/lib/website/save-generation";
import type { GenerationMode, WebsiteGeneration } from "@/types/database";
import type { GeneratedProjectFile, GeneratedWebsiteProject } from "@/plugins/website/types";

const LOG = "wb-session";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export type WebsiteGenerationSessionInput = {
  prompt: string;
  language: string;
  theme: string;
  features: string[];
  productId?: string;
  projectId?: string;
  mode?: GenerationMode;
  parentGenerationId?: string;
  continueInstruction?: string;
  projectKind: "website" | "web_application";
};

function baseBlueprint(partial?: Partial<GeneratedWebsiteProject>) {
  return {
    projectKind: partial?.projectKind ?? "website",
    title: partial?.title ?? "Generating website…",
    description: partial?.description ?? "",
    pages: partial?.pages ?? [],
    sections: partial?.sections ?? [],
    colorPalette: partial?.colorPalette ?? [],
    typography: partial?.typography ?? [],
    components: partial?.components ?? [],
    content: partial?.content ?? [],
    seo: partial?.seo ?? [],
    roadmap: partial?.roadmap ?? [],
    files: partial?.files ?? [],
    progressEvents: partial?.progressEvents ?? [],
    ...partial,
  };
}

/** Insert a running generation row before AI work starts. */
export async function beginWebsiteGenerationSession(args: {
  supabase: SupabaseClient;
  userId: string;
  input: WebsiteGenerationSessionInput;
}): Promise<{ ok: true; generation: WebsiteGeneration } | { ok: false; error: string }> {
  const workspaceProject = await ensureWebsiteWorkspaceProject(args.supabase, {
    userId: args.userId,
    name: "Generating website…",
    productId: args.input.productId ?? "website-builder",
    projectId: args.input.projectId,
  });

  let parentGenerationId: string | null = null;
  if (isUuid(args.input.parentGenerationId)) {
    const { data: parent } = await args.supabase
      .from("website_generations")
      .select("id")
      .eq("id", args.input.parentGenerationId)
      .eq("user_id", args.userId)
      .maybeSingle();
    parentGenerationId = parent?.id ?? null;
  }

  const row = {
    user_id: args.userId,
    project_name: "Generating website…",
    website_type:
      args.input.projectKind === "web_application" ? "Web Application" : "Website",
    business_description: args.input.prompt.slice(0, 2000) || "Website generation in progress",
    target_audience: "Auto-detected from project prompt",
    language: args.input.language || "English",
    color_style: args.input.theme || "modern",
    design_style: args.input.theme || "modern",
    page_count: "1",
    features: Array.isArray(args.input.features) ? args.input.features : [],
    blueprint: baseBlueprint({
      prompt: args.input.prompt,
      progressEvents: ["Connecting to AI website engine..."],
    }),
    product_id: args.input.productId ?? "website-builder",
    project_id: workspaceProject?.id ?? null,
    status: "running" as const,
    mode: args.input.mode ?? "generate",
    parent_generation_id: parentGenerationId,
    provider: getActiveProvider(),
    token_usage: emptyTokenUsage(),
    error_message: null,
    prompt_versions: [],
    attachments: [],
  };

  const { data, error } = await args.supabase
    .from("website_generations")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    // Environments without status column — continue without a session row.
    logger.warn("beginWebsiteGenerationSession insert failed", LOG, {
      message: error?.message,
      code: error?.code,
    });
    return {
      ok: false,
      error: error?.message ?? "Unable to start generation session.",
    };
  }

  logger.info("Generation session started", LOG, {
    generationId: data.id,
    mode: row.mode,
  });

  return { ok: true, generation: data as WebsiteGeneration };
}

/** Upsert partial files / progress onto a running generation. */
export async function checkpointWebsiteGeneration(args: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  message?: string;
  files?: GeneratedProjectFile[];
  partialProject?: Partial<GeneratedWebsiteProject>;
}): Promise<boolean> {
  if (!isUuid(args.generationId)) return false;

  const { data: existing } = await args.supabase
    .from("website_generations")
    .select("id, blueprint, status")
    .eq("id", args.generationId)
    .eq("user_id", args.userId)
    .maybeSingle();

  if (!existing?.id) return false;
  if (existing.status === "completed") return false;

  const prevBlueprint =
    existing.blueprint && typeof existing.blueprint === "object"
      ? (existing.blueprint as Record<string, unknown>)
      : {};
  const prevEvents = Array.isArray(prevBlueprint.progressEvents)
    ? (prevBlueprint.progressEvents as string[])
    : [];
  const nextEvents = args.message
    ? [...prevEvents, args.message].slice(-80)
    : prevEvents;

  const nextBlueprint = baseBlueprint({
    ...(prevBlueprint as Partial<GeneratedWebsiteProject>),
    ...args.partialProject,
    files: args.files ?? (prevBlueprint.files as GeneratedProjectFile[] | undefined) ?? [],
    progressEvents: nextEvents,
    title:
      args.partialProject?.title ||
      (typeof prevBlueprint.title === "string" ? prevBlueprint.title : "Generating website…"),
  });

  const { error } = await args.supabase
    .from("website_generations")
    .update({
      blueprint: nextBlueprint,
      status: "running",
      project_name:
        nextBlueprint.title || "Generating website…",
      business_description:
        nextBlueprint.description ||
        (typeof prevBlueprint.description === "string"
          ? prevBlueprint.description
          : "Website generation in progress"),
      page_count: String(nextBlueprint.pages?.length || 1),
      updated_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", args.generationId)
    .eq("user_id", args.userId);

  if (error) {
    logger.warn("checkpointWebsiteGeneration failed", LOG, {
      generationId: args.generationId,
      message: error.message,
    });
    return false;
  }

  return true;
}

/** Mark a session failed while keeping any partial blueprint for resume. */
export async function failWebsiteGenerationSession(args: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  errorMessage: string;
  files?: GeneratedProjectFile[];
}): Promise<void> {
  if (!isUuid(args.generationId)) return;

  const { data: existing } = await args.supabase
    .from("website_generations")
    .select("blueprint")
    .eq("id", args.generationId)
    .eq("user_id", args.userId)
    .maybeSingle();

  const prev =
    existing?.blueprint && typeof existing.blueprint === "object"
      ? (existing.blueprint as Record<string, unknown>)
      : {};

  await args.supabase
    .from("website_generations")
    .update({
      status: "failed",
      error_message: args.errorMessage.slice(0, 2000),
      blueprint: baseBlueprint({
        ...(prev as Partial<GeneratedWebsiteProject>),
        files: args.files ?? (prev.files as GeneratedProjectFile[] | undefined) ?? [],
        progressEvents: [
          ...(Array.isArray(prev.progressEvents) ? (prev.progressEvents as string[]) : []),
          `Failed: ${args.errorMessage}`,
        ].slice(-80),
      }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", args.generationId)
    .eq("user_id", args.userId);

  logger.info("Generation session failed (partial kept)", LOG, {
    generationId: args.generationId,
    errorMessage: args.errorMessage.slice(0, 200),
  });
}
