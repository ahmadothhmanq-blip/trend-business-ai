/**
 * App deployment platform — preview/production URLs, env, status.
 */

import { slugId } from "@/lib/ai-core/app-design-platform/ids";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type AppDeploymentEnvironment = "preview" | "production";

export type AppDeploymentRecord = {
  id: string;
  generationId: string;
  environment: AppDeploymentEnvironment;
  status: "queued" | "building" | "live" | "failed";
  url: string;
  env: Record<string, string>;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type AppDeploymentState = {
  preview?: AppDeploymentRecord;
  production?: AppDeploymentRecord;
  history: AppDeploymentRecord[];
};

export function emptyDeploymentState(): AppDeploymentState {
  return { history: [] };
}

export function extractDeploymentState(blueprint: {
  deployment?: AppDeploymentState;
  settings?: Record<string, string>;
}): AppDeploymentState {
  if (blueprint.deployment?.history) return blueprint.deployment;
  return emptyDeploymentState();
}

export function buildDeploymentUrl(params: {
  baseUrl: string;
  generationId: string;
  environment: AppDeploymentEnvironment;
}): string {
  const base = params.baseUrl.replace(/\/$/, "");
  return `${base}/apps/${params.generationId}/${params.environment}`;
}

export function createDeployment(params: {
  generationId: string;
  environment: AppDeploymentEnvironment;
  baseUrl: string;
  env?: Record<string, string>;
  files?: GeneratedProjectFile[];
}): AppDeploymentRecord {
  const now = new Date().toISOString();
  const id = slugId("deploy", params.environment, Date.now() % 100000);
  const url = buildDeploymentUrl({
    baseUrl: params.baseUrl,
    generationId: params.generationId,
    environment: params.environment,
  });

  const fileCount = params.files?.length ?? 0;
  const status = fileCount > 0 ? "live" : "building";

  return {
    id,
    generationId: params.generationId,
    environment: params.environment,
    status,
    url,
    env: params.env ?? {},
    message:
      status === "live"
        ? `Deployed ${fileCount} files to ${params.environment}.`
        : `Deployment queued for ${params.environment}.`,
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
