/**
 * Identity preservation — verifies template switching changes design only.
 */

import {
  extractBusinessIdentity,
  type BusinessIdentitySnapshot,
} from "@/lib/ai-core/template-intelligence/business-identity";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { createHash } from "node:crypto";

export type IdentityField =
  | "title"
  | "description"
  | "businessProfile"
  | "content"
  | "seo"
  | "pages"
  | "productionContent";

export type IdentityPreservationReport = {
  ok: boolean;
  preserved: IdentityField[];
  changed: IdentityField[];
  designChanged: boolean;
  details: string[];
};

function hashValue(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value ?? null))
    .digest("hex")
    .slice(0, 16);
}

function compareField<T>(
  field: IdentityField,
  before: T,
  after: T,
): { preserved: boolean; detail: string } {
  const same = hashValue(before) === hashValue(after);
  return {
    preserved: same,
    detail: same
      ? `${field}: preserved`
      : `${field}: CHANGED (business leak on template switch)`,
  };
}

/**
 * Compare business identity before and after a template switch.
 * Design files (globals.css, page layout) are expected to change.
 */
export function validateIdentityPreservation(
  beforeProject: GeneratedWebsiteProject,
  afterProject: GeneratedWebsiteProject,
  language?: string | null,
): IdentityPreservationReport {
  const before = extractBusinessIdentity(beforeProject, language);
  const after = extractBusinessIdentity(afterProject, language);

  const fields: IdentityField[] = [
    "title",
    "description",
    "businessProfile",
    "content",
    "seo",
    "pages",
    "productionContent",
  ];

  const preserved: IdentityField[] = [];
  const changed: IdentityField[] = [];
  const details: string[] = [];

  for (const field of fields) {
    const result = compareField(
      field,
      before[field as keyof BusinessIdentitySnapshot],
      after[field as keyof BusinessIdentitySnapshot],
    );
    details.push(result.detail);
    if (result.preserved) {
      preserved.push(field);
    } else {
      changed.push(field);
    }
  }

  const beforeCss =
    beforeProject.files.find((f) => f.path === "app/globals.css")?.content ?? "";
  const afterCss =
    afterProject.files.find((f) => f.path === "app/globals.css")?.content ?? "";
  const designChanged = hashValue(beforeCss) !== hashValue(afterCss);
  details.push(
    designChanged
      ? "design: changed (expected on template switch)"
      : "design: unchanged",
  );

  return {
    ok: changed.length === 0,
    preserved,
    changed,
    designChanged,
    details,
  };
}
