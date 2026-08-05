import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { validateSectorDna } from "@/lib/design-platform/sector-dna";
import { getSectorDna } from "@/lib/design-platform/sector-dna";
import { TBDP_COMPONENT_CATALOG } from "@/lib/design-platform/components/catalog";
import {
  readStoredContextFromSettings,
} from "@/lib/website/tbdp-wiring/design-context-store";
import type { TbdpValidationResult } from "@/lib/website/tbdp-wiring/types";

/**
 * Validates a generated website project against TBDP rules.
 * Non-blocking — returns warnings/errors for telemetry and QA.
 */
export function validateWebsiteAgainstTbdp(
  project: GeneratedWebsiteProject,
): TbdpValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  const stored = readStoredContextFromSettings(settings);

  if (!stored) {
    return { valid: true, errors, warnings: ["TBDP context not present — skipped"] };
  }

  const sector = getSectorDna(stored.sectorDnaId as Parameters<typeof getSectorDna>[0]);
  if (!sector) {
    errors.push(`Unknown sector DNA id: ${stored.sectorDnaId}`);
  } else {
    const validation = validateSectorDna(sector);
    if (!validation.ok) {
      errors.push(...validation.errors);
    }
  }

  const registryIds = new Set(TBDP_COMPONENT_CATALOG.map((c) => c.id));
  const projectComponents = project.components ?? [];
  for (const id of projectComponents) {
    if (!registryIds.has(id)) {
      warnings.push(`Component "${id}" not in TBDP registry`);
    }
  }

  for (const id of stored.componentIds) {
    if (!registryIds.has(id)) {
      errors.push(`TBDP stored component "${id}" not in official registry`);
    }
  }

  if (stored.contextHash !== settings.tbdpDesignContextHash) {
    warnings.push("Design context hash mismatch between stored context and settings");
  }

  return {
    valid: errors.length === 0,
    sectorDnaId: stored.sectorDnaId,
    errors,
    warnings,
  };
}
