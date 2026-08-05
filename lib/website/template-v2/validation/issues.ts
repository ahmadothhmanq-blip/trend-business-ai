export type TemplateV2ValidationIssue = {
  code: string;
  message: string;
  path?: string;
};

export function templateV2Issue(
  code: string,
  message: string,
  issuePath?: string,
): TemplateV2ValidationIssue {
  return { code, message, path: issuePath };
}
