import type { WB_TEMPLATE_RENDERER_ERROR_CODES } from "@/lib/website/template-renderer-contract/constants";

export type WbTemplateRendererErrorCode =
  (typeof WB_TEMPLATE_RENDERER_ERROR_CODES)[number];

export type WbTemplateRendererIssue = {
  code: WbTemplateRendererErrorCode | string;
  message: string;
  path?: string;
};

export type WbTemplateRendererValidationResult = {
  valid: boolean;
  issues: WbTemplateRendererIssue[];
};

export class WbTemplateRendererError extends Error {
  readonly code: WbTemplateRendererErrorCode | string;
  readonly issues: WbTemplateRendererIssue[];
  readonly path?: string;

  constructor(
    code: WbTemplateRendererErrorCode | string,
    message: string,
    options?: {
      path?: string;
      issues?: WbTemplateRendererIssue[];
      cause?: unknown;
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "WbTemplateRendererError";
    this.code = code;
    this.path = options?.path;
    this.issues = options?.issues ?? [{ code, message, path: options?.path }];
  }
}

export function issue(
  code: WbTemplateRendererErrorCode | string,
  message: string,
  path?: string,
): WbTemplateRendererIssue {
  return { code, message, path };
}

export function isWbTemplateRendererError(
  error: unknown,
): error is WbTemplateRendererError {
  return error instanceof WbTemplateRendererError;
}
