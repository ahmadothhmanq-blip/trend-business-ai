import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { generateWebsite } from "@/lib/website-generator";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import {
  asSupabaseMaybeSingleClient,
  asSupabaseSingleClient,
} from "@/lib/api/supabase-query";
import {
  extractWebsiteFilesFromBlueprint,
  loadWebsiteParentContext,
} from "@/plugins/website/iteration";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
import {
  runWebsiteEditor,
  type WebsiteEditAction,
} from "@/lib/ai-core/website-editor";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 800;

type RouteContext = { params: Promise<{ id: string }> };

const editBodySchema = z.object({
  command: z.string().trim().max(4000).optional(),
  /** Apply a suggestion by id (uses suggestion.command / actions). */
  suggestionId: z.string().trim().max(80).optional(),
  actions: z
    .array(
      z.object({
        type: z.string(),
        target: z.string().optional(),
        value: z.string().optional(),
        sectionKind: z.string().optional(),
        componentId: z.string().optional(),
        replaceWith: z.string().optional(),
        notes: z.string().optional(),
        fromIndex: z.number().int().optional(),
        toIndex: z.number().int().optional(),
      }),
    )
    .max(40)
    .optional(),
  /** When true (default), run AI continue for remaining rewrite/conversion intents. */
  applyAi: z.boolean().optional(),
});

/**
 * POST /api/website-builder/[id]/edit
 * Website Editor Intelligence — natural-language edits on a saved generation.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(
    auth.supabase,
    auth.user!.id,
    "website-builder",
  );
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = editBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { data: existing, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !existing) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const generation = existing as WebsiteGeneration;
  const project = generation.blueprint as unknown as GeneratedWebsiteProject;
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);

  if (!files.length) {
    return NextResponse.json(
      { error: "Generation has no editable files." },
      { status: 400 },
    );
  }

  let command = parsed.data.command?.trim() || "";
  let actions = (parsed.data.actions || []) as WebsiteEditAction[];

  if (parsed.data.suggestionId && project.editorSuggestions?.suggestions) {
    const suggestion = project.editorSuggestions.suggestions.find(
      (s) => s.id === parsed.data.suggestionId,
    );
    if (suggestion) {
      command = command || suggestion.command;
      if (suggestion.actions?.length) {
        actions = [...actions, ...suggestion.actions];
      }
    }
  }

  if (!command && !actions.length) {
    return NextResponse.json(
      { error: "Provide a command, suggestionId, or actions." },
      { status: 400 },
    );
  }

  try {
    const editResult = runWebsiteEditor({
      files,
      project,
      command,
      actions,
    });

    const applyAi = parsed.data.applyAi !== false;
    const settings = await providerManager.loadUserSettings(
      asSupabaseSingleClient(auth.supabase),
      auth.user!.id,
    );
    const parentContext = await loadWebsiteParentContext(
      asSupabaseMaybeSingleClient(auth.supabase),
      auth.user!.id,
      id,
    );

    let savedProject: GeneratedWebsiteProject;
    let savedGeneration: WebsiteGeneration;

    if (applyAi && editResult.continueInstruction) {
      const generated = await generateWebsite({
        prompt:
          generation.business_description ||
          project.description ||
          project.prompt ||
          "Edit this website with AI.",
        projectType: generation.website_type || "Business website",
        projectKind: "website",
        language: "en",
        theme: "modern",
        features: [],
        mode: "continue",
        parentGenerationId: id,
        continueInstruction: editResult.continueInstruction,
        optimizeWithAi: true,
        previousFiles: editResult.files,
        ...parentContext,
        userId: auth.user!.id,
        preferredProvider: settings?.default_provider as AIProviderName | undefined,
        autoFallback: settings?.auto_fallback ?? true,
      });

      const saved = await persistWebsiteGeneration({
        supabase: auth.supabase,
        userId: auth.user!.id,
        project: {
          ...generated,
          editorSuggestions: {
            suggestions: editResult.suggestions,
            summary: editResult.summary,
            generatedAt: new Date().toISOString(),
          },
        },
        projectKind: generated.projectKind ?? "website",
        input: {
          prompt: generation.business_description || command,
          language: "en",
          theme: "modern",
          features: [],
          productId: "website-builder",
          projectId: generation.project_id ?? undefined,
          mode: "continue",
          parentGenerationId: id,
          continueInstruction: editResult.continueInstruction,
        },
      });

      if (!saved.ok) {
        return NextResponse.json({ error: saved.error }, { status: 500 });
      }
      savedProject = saved.project;
      savedGeneration = saved.generation;
    } else {
      const nextProject: GeneratedWebsiteProject = {
        ...project,
        files: editResult.files,
        sections: editResult.understanding.homeComponentOrder,
        components: editResult.understanding.homeComponentOrder,
        editorSuggestions: {
          suggestions: editResult.suggestions,
          summary: editResult.summary,
          generatedAt: new Date().toISOString(),
        },
        progressEvents: [
          ...(project.progressEvents ?? []),
          `[website-editor] ${editResult.summary}`,
        ],
      };

      const saved = await persistWebsiteGeneration({
        supabase: auth.supabase,
        userId: auth.user!.id,
        project: nextProject,
        projectKind: nextProject.projectKind ?? "website",
        input: {
          prompt: generation.business_description || command,
          language: "en",
          theme: "modern",
          features: [],
          productId: "website-builder",
          projectId: generation.project_id ?? undefined,
          mode: "continue",
          parentGenerationId: id,
          continueInstruction: command || editResult.summary,
        },
      });

      if (!saved.ok) {
        return NextResponse.json({ error: saved.error }, { status: 500 });
      }
      savedProject = saved.project;
      savedGeneration = saved.generation;
    }

    return NextResponse.json({
      project: savedProject,
      generation: savedGeneration,
      editResult: {
        summary: editResult.summary,
        actionsApplied: editResult.actionsApplied,
        appliedNotes: editResult.appliedNotes,
        understanding: editResult.understanding,
        suggestions: editResult.suggestions,
        continueInstruction: editResult.continueInstruction ?? null,
      },
      message: "Website edited with Website Editor Intelligence.",
    });
  } catch (err) {
    return serverErrorResponse(
      "website-builder.edit",
      err,
      "Unable to edit website.",
    );
  }
}
