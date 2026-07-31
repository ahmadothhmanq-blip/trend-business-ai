import type { KnowledgeIntegrityIssue } from "@/lib/ai-core/architecture-knowledge-base/types";
import { ARCHITECTURE_KNOWLEDGE_ENTRIES } from "@/lib/ai-core/architecture-knowledge-base/catalog";
import {
  buildKnowledgeRegistry,
  mergeIndustryEntry,
} from "@/lib/ai-core/architecture-knowledge-base/registry";
import type { IndustryKnowledgeEntry } from "@/lib/ai-core/architecture-knowledge-base/types";
import { WEBSITE_STRUCTURE_TEMPLATE_INDEX } from "@/lib/website/builder/template-package-index";

export type KnowledgeIntegrityReport = {
  valid: boolean;
  issues: KnowledgeIntegrityIssue[];
  checkedAt: string;
  entryCount: number;
};

export function validateKnowledgeBaseIntegrity(
  entries = ARCHITECTURE_KNOWLEDGE_ENTRIES,
): KnowledgeIntegrityReport {
  const issues: KnowledgeIntegrityIssue[] = [];
  const registry = buildKnowledgeRegistry(entries);
  const ids = new Set<string>();
  const layoutFamilyIds = new Set(
    entries.filter((e) => e.kind === "layout-family").map((e) => e.id),
  );

  for (const entry of entries) {
    if (ids.has(entry.id)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_ID",
        message: `Duplicate entry id: ${entry.id}`,
        entryId: entry.id,
      });
    }
    ids.add(entry.id);

    if (entry.deprecated && !entry.deprecatedBy) {
      issues.push({
        severity: "warning",
        code: "DEPRECATED_WITHOUT_REPLACEMENT",
        message: `Entry ${entry.id} is deprecated without deprecatedBy`,
        entryId: entry.id,
      });
    }

    if (entry.extends && !registry.byId.has(entry.extends)) {
      issues.push({
        severity: "error",
        code: "MISSING_EXTENDS_TARGET",
        message: `Entry ${entry.id} extends missing ${entry.extends}`,
        entryId: entry.id,
      });
    }
  }

  for (const entry of entries) {
    if (entry.kind !== "industry") continue;

    let merged: IndustryKnowledgeEntry;
    try {
      merged = mergeIndustryEntry(entry, registry);
    } catch (error) {
      issues.push({
        severity: "error",
        code: "INHERITANCE_MERGE_FAILED",
        message: error instanceof Error ? error.message : String(error),
        entryId: entry.id,
      });
      continue;
    }

    if (!layoutFamilyIds.has(merged.defaultLayoutFamily)) {
      issues.push({
        severity: "error",
        code: "INVALID_LAYOUT_FAMILY",
        message: `Industry ${entry.id} defaultLayoutFamily "${merged.defaultLayoutFamily}" not in KB`,
        entryId: entry.id,
      });
    }

    for (const family of merged.allowedLayoutFamilies ?? []) {
      if (!layoutFamilyIds.has(family)) {
        issues.push({
          severity: "error",
          code: "INVALID_ALLOWED_FAMILY",
          message: `Industry ${entry.id} references unknown layout family ${family}`,
          entryId: entry.id,
        });
      }
    }

    if (
      merged.defaultStructureTemplateId &&
      !WEBSITE_STRUCTURE_TEMPLATE_INDEX[merged.defaultStructureTemplateId]
    ) {
      issues.push({
        severity: "error",
        code: "ORPHANED_STRUCTURE_TEMPLATE",
        message: `Industry ${entry.id} references unknown structure ${merged.defaultStructureTemplateId}`,
        entryId: entry.id,
      });
    }

    const policyRefs = [
      merged.imagePolicyId,
      merged.seoPolicyId,
      merged.accessibilityPolicyId,
      merged.localizationPolicyId,
      merged.businessRulesId,
    ].filter(Boolean) as string[];
    for (const pid of policyRefs) {
      if (!registry.byId.has(pid)) {
        issues.push({
          severity: "error",
          code: "MISSING_POLICY_REFERENCE",
          message: `Industry ${entry.id} references missing policy ${pid}`,
          entryId: entry.id,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  return {
    valid: errors.length === 0,
    issues,
    checkedAt: new Date().toISOString(),
    entryCount: entries.length,
  };
}

export function assertKnowledgeBaseIntegrity(): KnowledgeIntegrityReport {
  const report = validateKnowledgeBaseIntegrity();
  if (!report.valid) {
    const summary = report.issues
      .filter((i) => i.severity === "error")
      .map((i) => i.message)
      .join("; ");
    throw new Error(`Architecture Knowledge Base integrity failed: ${summary}`);
  }
  return report;
}
