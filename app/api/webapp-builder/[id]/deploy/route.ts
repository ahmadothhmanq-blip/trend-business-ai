import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import type { WebAppGeneration, WebAppBlueprint } from "@/types/webapp";
import {
  extractAppModelFromBlueprint,
} from "@/lib/ai-core/app-design-platform/management";
import {
  createDeployment,
  evaluateDeploymentReadiness,
  extractDeploymentState,
  isWebAppDeployEnabled,
  upsertDeploymentState,
  updateDeploymentEnv,
} from "@/lib/ai-core/app-design-platform/deploy";
import { provisionAppBackend } from "@/lib/ai-core/app-design-platform/backend";
import { syncAppModelToFiles, syncPagesFromModel } from "@/lib/ai-core/app-design-platform/sync";
import { resolveAppLivePreviewHtml } from "@/lib/webapp/live-preview";
import { upsertWebAppPublication } from "@/lib/webapp/publish";
import { z } from "zod";
import { getLocalDevOrigin } from "@/lib/dev-origin";

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
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "App not found.");
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
      deployEnabled: isWebAppDeployEnabled(),
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
 * POST — deploy preview (authenticated live-preview) or production public host.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  if (!isWebAppDeployEnabled()) {
    return NextResponse.json(
      {
        error: "App deploy is disabled.",
        hint: "Unset WEBAPP_DEPLOY_ENABLED or set it to true.",
      },
      { status: 503 },
    );
  }

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = deploySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  try {
    const { data, error } = await auth.supabase
      .from("webapp_generations")
      .select("*")
      .eq("id", parsedId.id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (error || !data) {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "App not found.");
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

    const readinessIssues = evaluateDeploymentReadiness(files, {
      requiresAuth: blueprint.settings?.requiresAuth !== "false",
      requiresDatabase: blueprint.settings?.requiresDatabase !== "false",
      model,
    });

    const previewHtml = resolveAppLivePreviewHtml({
      ...generation,
      blueprint: { ...blueprint, files },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      (process.env.VERCEL_URL
        ? process.env.VERCEL_URL.startsWith("http")
          ? process.env.VERCEL_URL
          : `https://${process.env.VERCEL_URL}`
        : getLocalDevOrigin());

    let record = createDeployment({
      generationId: parsedId.id,
      environment: parsed.data.environment,
      baseUrl,
      env: parsed.data.env,
      files,
      appName: generation.app_name || model.settings.appName,
      previewHtml,
      readinessIssues,
    });

    if (
      record.status === "live" &&
      record.environment === "production" &&
      record.kind === "public-host"
    ) {
      try {
        const publication = await upsertWebAppPublication({
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: parsedId.id,
          appName: generation.app_name || model.settings.appName || "App",
          previewHtml,
          baseUrl,
        });
        record = {
          ...record,
          url: publication.planned_public_url || record.url,
          publicPath: publication.public_path,
          message: `Published interactive preview at ${publication.public_path}. Not a full Next.js + database app — download ZIP to host login/CRUD on Node.`,
        };
      } catch (publishError) {
        record = {
          ...record,
          status: "failed",
          message:
            publishError instanceof Error
              ? publishError.message
              : "Unable to publish public app host (apply migration 097).",
          readinessIssues: [
            ...record.readinessIssues,
            "webapp_publications upsert failed — apply migration 097_webapp_publications.sql",
          ],
        };
      }
    }

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
        lastDeployStatus: record.status,
        trustReady: readinessIssues.length === 0 ? "true" : "false",
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
        meta: {
          fileCount: files.length,
          syncNotes: sync.notes,
          kind: record.kind,
          readinessIssues: record.readinessIssues,
          publicPath: record.publicPath,
        },
        updated_at: record.updatedAt,
      });
    } catch {
      /* table may not exist until migration 046 */
    }

    const httpStatus = record.status === "failed" ? 422 : 200;
    return NextResponse.json(
      {
        message: record.message,
        deployment: record,
        state: deploymentState,
        livePreviewUrl: `/api/webapp-builder/${parsedId.id}/live-preview`,
        sync,
        readinessIssues: record.readinessIssues,
      },
      { status: httpStatus },
    );
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

    if (!data) return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "App not found.");

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
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "No deployment to update.");
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
