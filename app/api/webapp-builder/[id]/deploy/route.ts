import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import type { WebAppGeneration, WebAppBlueprint } from "@/types/webapp";
import {
  extractAppModelFromBlueprint,
  extractVersionHistory,
  withAppModel,
} from "@/lib/ai-core/app-design-platform/management";
import {
  createDeployment,
  extractDeploymentState,
  upsertDeploymentState,
  updateDeploymentEnv,
} from "@/lib/ai-core/app-design-platform/deploy";
import { provisionAppBackend } from "@/lib/ai-core/app-design-platform/backend";
import { syncAppModelToFiles, syncPagesFromModel } from "@/lib/ai-core/app-design-platform/sync";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const deploySchema = z.object({
  environment: z.enum(["preview", "production"]).default("preview"),
  env: z.record(z.string(), z.string()).optional(),
  provisionBackend: z.boolean().optional().default(true),
});

/**
 * GET — deployment status for an app.
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  try {
    const { data, error } = await auth.supabase
      .from("webapp_generations")
      .select("*")
      .eq("id", parsedId.id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "App not found." }, { status: 404 });
    }

    const blueprint = (data.blueprint || {}) as WebAppBlueprint & {
      deployment?: ReturnType<typeof extractDeploymentState>;
    };

    const { data: rows } = await auth.supabase
      .from("webapp_deployments")
      .select("*")
      .eq("generation_id", parsedId.id)
      .eq("user_id", auth.user!.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      deployment: blueprint.deployment ?? extractDeploymentState(blueprint),
      records: rows ?? [],
      livePreviewUrl: `/api/webapp-builder/${parsedId.id}/live-preview`,
    });
  } catch (error) {
    return serverErrorResponse(
      "webapp-builder.deploy.get",
      error,
      "Unable to load deployment status.",
    );
  }
}

/**
 * POST — one-click deploy (preview or production).
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = deploySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid deploy request" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await auth.supabase
      .from("webapp_generations")
      .select("*")
      .eq("id", parsedId.id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "App not found." }, { status: 404 });
    }

    const generation = data as WebAppGeneration;
    const blueprint = (generation.blueprint || {}) as WebAppBlueprint;
    const model = extractAppModelFromBlueprint(blueprint, {
      prompt: generation.prompt,
      appType: generation.app_type,
      language: generation.language,
      appName: generation.app_name,
    });

    let files = blueprint.files ?? [];
    const sync = syncAppModelToFiles(model, files);
    files = sync.files;

    if (parsed.data.provisionBackend) {
      const backend = provisionAppBackend(model, files);
      files = backend.files;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      (process.env.VERCEL_URL
        ? process.env.VERCEL_URL.startsWith("http")
          ? process.env.VERCEL_URL
          : `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const record = createDeployment({
      generationId: parsedId.id,
      environment: parsed.data.environment,
      baseUrl,
      env: parsed.data.env,
      files,
    });

    const deploymentState = upsertDeploymentState(
      extractDeploymentState(blueprint),
      record,
    );

    const nextBlueprint: WebAppBlueprint = {
      ...blueprint,
      files,
      pages: syncPagesFromModel(model),
      appModel: model,
      settings: {
        ...blueprint.settings,
        lastDeployEnv: parsed.data.environment,
        lastDeployUrl: record.url,
      },
      deployment: deploymentState,
    } as WebAppBlueprint;

    await auth.supabase
      .from("webapp_generations")
      .update({
        blueprint: nextBlueprint,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedId.id)
      .eq("user_id", auth.user!.id);

    try {
      await auth.supabase.from("webapp_deployments").upsert({
        id: record.id,
        user_id: auth.user!.id,
        generation_id: parsedId.id,
        environment: record.environment,
        status: record.status,
        url: record.url,
        env: record.env,
        meta: { fileCount: files.length, syncNotes: sync.notes },
        updated_at: record.updatedAt,
      });
    } catch {
      /* table may not exist until migration 046 */
    }

    return NextResponse.json({
      message: record.message,
      deployment: record,
      state: deploymentState,
      livePreviewUrl: `/api/webapp-builder/${parsedId.id}/live-preview`,
      sync,
    });
  } catch (error) {
    return serverErrorResponse(
      "webapp-builder.deploy.post",
      error,
      "Unable to deploy application.",
    );
  }
}

/**
 * PATCH — update deployment environment variables.
 */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<{ deploymentId?: string; env?: Record<string, string> }>(
    request,
  );
  if (body instanceof NextResponse) return body;

  try {
    const { data } = await auth.supabase
      .from("webapp_generations")
      .select("*")
      .eq("id", parsedId.id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (!data) return NextResponse.json({ error: "App not found." }, { status: 404 });

    const blueprint = (data.blueprint || {}) as WebAppBlueprint & {
      deployment?: ReturnType<typeof extractDeploymentState>;
    };
    const state = blueprint.deployment ?? extractDeploymentState(blueprint);
    const env = body.env ?? {};
    const target =
      state.preview?.id === body.deploymentId
        ? state.preview
        : state.production?.id === body.deploymentId
          ? state.production
          : state.preview;

    if (!target) {
      return NextResponse.json({ error: "No deployment to update." }, { status: 404 });
    }

    const updated = updateDeploymentEnv(target, env);
    const nextState = upsertDeploymentState(state, updated);
    const nextBlueprint = { ...blueprint, deployment: nextState };

    await auth.supabase
      .from("webapp_generations")
      .update({ blueprint: nextBlueprint, updated_at: new Date().toISOString() })
      .eq("id", parsedId.id);

    return NextResponse.json({ message: "Environment updated.", deployment: updated });
  } catch (error) {
    return serverErrorResponse(
      "webapp-builder.deploy.patch",
      error,
      "Unable to update deployment env.",
    );
  }
}
