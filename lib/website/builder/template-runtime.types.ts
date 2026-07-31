import type { WbTemplateRendererIssue, WbTemplateRendererMeta } from "@/lib/website/template-renderer-contract";
import type { WbTemplateRuntimeModel } from "@/lib/website/template-renderer-contract/types";

export type BuilderTemplateRuntimeScope = {
  pageId?: string;
  layoutId?: string;
};

export type BuilderTemplateRuntimeSuccess = {
  ok: true;
  templateId: string;
  model: WbTemplateRuntimeModel;
  meta: WbTemplateRendererMeta;
};

export type BuilderTemplateRuntimeFailure = {
  ok: false;
  templateId: string;
  code: string;
  message: string;
  issues: WbTemplateRendererIssue[];
};

export type BuilderTemplateRuntimeResult =
  | BuilderTemplateRuntimeSuccess
  | BuilderTemplateRuntimeFailure;

export type BuilderTemplateRuntimeListResponse = {
  ok: true;
  count: number;
  templateIds: string[];
};

export function formatBuilderTemplateRuntimeError(
  error: BuilderTemplateRuntimeFailure,
): string {
  const details = error.issues.map((item) => item.message).join("; ");
  return details ? `${error.message}: ${details}` : error.message;
}
