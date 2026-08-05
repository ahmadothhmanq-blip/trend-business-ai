import type {
  BuilderTemplateRuntimeFailure,
  BuilderTemplateRuntimeListResponse,
  BuilderTemplateRuntimeResult,
  BuilderTemplateRuntimeScope,
} from "@/lib/website/builder/template-runtime.types";
import { resolveBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";

export async function fetchBuilderTemplateRuntimeModel(
  templateId: string,
  scope?: BuilderTemplateRuntimeScope,
): Promise<BuilderTemplateRuntimeResult> {
  const resolvedTemplateId = resolveBuilderTemplatePackageId(templateId);
  const url = new URL("/api/website-builder/template-runtime", window.location.origin);
  url.searchParams.set("id", resolvedTemplateId);
  if (scope?.pageId) url.searchParams.set("pageId", scope.pageId);
  if (scope?.layoutId) url.searchParams.set("layoutId", scope.layoutId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | BuilderTemplateRuntimeResult
    | { ok: false; error?: BuilderTemplateRuntimeFailure }
    | null;

  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      templateId: resolvedTemplateId,
      code: "output.invalid_model",
      message: "template runtime API returned an invalid response",
      issues: [
        {
          code: "output.invalid_model",
          message: `unexpected status ${response.status}`,
        },
      ],
    };
  }

  if ("ok" in payload && payload.ok) {
    return payload;
  }

  if ("error" in payload && payload.error) {
    return payload.error;
  }

  return {
    ok: false,
    templateId: resolvedTemplateId,
    code: "output.invalid_model",
    message: "template runtime API request failed",
    issues: [
      {
        code: "output.invalid_model",
        message: `unexpected status ${response.status}`,
      },
    ],
  };
}

export async function fetchInstalledBuilderTemplatePackageIds(): Promise<string[]> {
  const url = new URL("/api/website-builder/template-runtime", window.location.origin);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | BuilderTemplateRuntimeListResponse
    | null;

  if (!response.ok || !payload?.ok) {
    return [];
  }

  return payload.templateIds;
}
