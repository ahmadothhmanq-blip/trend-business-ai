/**
 * App deployment — honest preview/production hosting (no fake /apps URLs).
 *
 * Preview → authenticated live-preview HTML sandbox.
 * Production → public /w/app/[slug] when trust gate passes.
 */

import { slugId } from "@/lib/ai-core/app-design-platform/ids";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { findInteractiveAppPreviewReadinessIssues } from "@/lib/webapp/interactive-preview/readiness";
import type { RuntimeHostRecord } from "@/lib/webapp/runtime-host";

export type AppDeploymentEnvironment = "preview" | "production";

export type AppDeploymentKind = "live-preview" | "public-host" | "self-hosted";

export type AppDeploymentRecord = {
  id: string;
  generationId: string;
  environment: AppDeploymentEnvironment;
  status: "queued" | "building" | "live" | "failed";
  kind: AppDeploymentKind;
  url: string;
  publicPath?: string;
  env: Record<string, string>;
  message: string;
  readinessIssues: string[];
  createdAt: string;
  updatedAt: string;
};

export type AppDeploymentState = {
  preview?: AppDeploymentRecord;
  production?: AppDeploymentRecord;
  /** User-registered full Next.js HTTPS host (ZIP self-host). */
  runtimeHost?: RuntimeHostRecord | null;
  history: AppDeploymentRecord[];
};

export function emptyDeploymentState(): AppDeploymentState {
  return { history: [] };
}

export function extractDeploymentState(blueprint: {
  deployment?: AppDeploymentState;
  settings?: Record<string, string>;
}): AppDeploymentState {
  if (blueprint.deployment) {
    return {
      ...emptyDeploymentState(),
      ...blueprint.deployment,
      history: blueprint.deployment.history ?? [],
      runtimeHost: blueprint.deployment.runtimeHost ?? null,
    };
  }
  return emptyDeploymentState();
}

export function isWebAppDeployEnabled(): boolean {
  const raw = process.env.WEBAPP_DEPLOY_ENABLED;
  if (raw === undefined || raw === "") return true;
  return raw === "true" || raw === "1";
}

export function isWebAppPublicPublishEnabled(): boolean {
  const raw = process.env.WEBAPP_PUBLISH_ENABLED;
  if (raw === undefined || raw === "") return true;
  return raw !== "false" && raw !== "0";
}

export function buildLivePreviewPath(generationId: string): string {
  return `/api/webapp-builder/${generationId}/live-preview`;
}

export function buildPublicAppPath(slug: string): string {
  return `/w/app/${slug}`;
}

export function absoluteUrl(baseUrl: string, pathname: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

/** @deprecated Prefer buildLivePreviewPath / buildPublicAppPath + absoluteUrl. */
export function buildDeploymentUrl(params: {
  baseUrl: string;
  generationId: string;
  environment: AppDeploymentEnvironment;
}): string {
  const path =
    params.environment === "production"
      ? buildPublicAppPath(slugifyAppName("app", params.generationId))
      : buildLivePreviewPath(params.generationId);
  return absoluteUrl(params.baseUrl, path);
}

export function slugifyAppName(name: string, generationId: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "app";
  const suffix = generationId.replace(/-/g, "").slice(0, 8);
  return `${base}-${suffix}`;
}

export function evaluateDeploymentReadiness(
  files: GeneratedProjectFile[],
  flags?: {
    requiresAuth?: boolean;
    requiresDatabase?: boolean;
    model?: StructuredAppModel | null;
  },
): string[] {
  const issues = findWebAppReadinessIssues(files, {
    requiresAuth: flags?.requiresAuth ?? true,
    requiresDatabase: flags?.requiresDatabase ?? true,
  });
  if (flags?.model) {
    issues.push(...findInteractiveAppPreviewReadinessIssues(flags.model));
  }
  return [...new Set(issues)];
}

export function createDeployment(params: {
  generationId: string;
  environment: AppDeploymentEnvironment;
  baseUrl: string;
  env?: Record<string, string>;
  files?: GeneratedProjectFile[];
  appName?: string;
  previewHtml?: string;
  readinessIssues?: string[];
}): AppDeploymentRecord {
  const now = new Date().toISOString();
  const id = slugId("deploy", params.environment, Date.now() % 100000);
  const issues = params.readinessIssues ?? [];
  const fileCount = params.files?.length ?? 0;

  if (fileCount === 0) {
    return {
      id,
      generationId: params.generationId,
      environment: params.environment,
      status: "failed",
      kind: "live-preview",
      url: absoluteUrl(params.baseUrl, buildLivePreviewPath(params.generationId)),
      env: params.env ?? {},
      message: "Deployment failed: no project files to host.",
      readinessIssues: ["No project files."],
      createdAt: now,
      updatedAt: now,
    };
  }

  if (issues.length > 0) {
    return {
      id,
      generationId: params.generationId,
      environment: params.environment,
      status: "failed",
      kind: "live-preview",
      url: absoluteUrl(params.baseUrl, buildLivePreviewPath(params.generationId)),
      env: params.env ?? {},
      message: `Trust gate failed (${issues.length} issue${issues.length === 1 ? "" : "s"}). Fix readiness before deploy.`,
      readinessIssues: issues,
      createdAt: now,
      updatedAt: now,
    };
  }

  if (params.environment === "preview") {
    const publicPath = buildLivePreviewPath(params.generationId);
    return {
      id,
      generationId: params.generationId,
      environment: "preview",
      status: "live",
      kind: "live-preview",
      url: absoluteUrl(params.baseUrl, publicPath),
      publicPath,
      env: params.env ?? {},
      message: `Preview live (${fileCount} files). Authenticated sandbox at live-preview — not an external Node host.`,
      readinessIssues: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  if (!isWebAppPublicPublishEnabled()) {
    return {
      id,
      generationId: params.generationId,
      environment: "production",
      status: "failed",
      kind: "public-host",
      url: absoluteUrl(params.baseUrl, buildLivePreviewPath(params.generationId)),
      env: params.env ?? {},
      message: "Public app hosting is disabled (WEBAPP_PUBLISH_ENABLED=false).",
      readinessIssues: ["Public publish disabled."],
      createdAt: now,
      updatedAt: now,
    };
  }

  if (!params.previewHtml?.trim()) {
    return {
      id,
      generationId: params.generationId,
      environment: "production",
      status: "failed",
      kind: "public-host",
      url: absoluteUrl(params.baseUrl, buildLivePreviewPath(params.generationId)),
      env: params.env ?? {},
      message: "Production publish requires preview HTML.",
      readinessIssues: ["Missing preview HTML."],
      createdAt: now,
      updatedAt: now,
    };
  }

  const slug = slugifyAppName(params.appName || "app", params.generationId);
  const publicPath = buildPublicAppPath(slug);
  return {
    id,
    generationId: params.generationId,
    environment: "production",
    status: "live",
    kind: "public-host",
    url: absoluteUrl(params.baseUrl, publicPath),
    publicPath,
    env: params.env ?? {},
    message: `Published interactive preview host at ${publicPath}. This is not a full Next.js runtime with database login/CRUD — download the ZIP and host on Node for the production app.`,
    readinessIssues: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertDeploymentState(
  state: AppDeploymentState,
  record: AppDeploymentRecord,
): AppDeploymentState {
  const history = [record, ...state.history.filter((h) => h.id !== record.id)].slice(0, 20);
  return {
    ...state,
    [record.environment]: record,
    history,
  };
}

export function setRuntimeHostOnDeploymentState(
  state: AppDeploymentState,
  runtimeHost: RuntimeHostRecord | null,
): AppDeploymentState {
  return {
    ...state,
    runtimeHost,
  };
}

export function resolveStoreProductionUrl(state: AppDeploymentState | null | undefined): string | null {
  const runtime = state?.runtimeHost?.url?.trim();
  if (runtime) return runtime;
  return null;
}

export function updateDeploymentEnv(
  record: AppDeploymentRecord,
  env: Record<string, string>,
): AppDeploymentRecord {
  return {
    ...record,
    env: { ...record.env, ...env },
    updatedAt: new Date().toISOString(),
    message: "Environment variables updated.",
  };
}
