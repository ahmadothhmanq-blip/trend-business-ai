/**
 * WebsiteCapabilityManifest persistence — the single internal persistence module.
 *
 * External modules MUST use WebsiteCapabilityService.refresh() or rebuild().
 * The only authorized write path is persistManifestToProject() (service-only).
 */
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import { WB_WEBSITE_CAPABILITY_MANIFEST_SETTING } from "@/lib/website/builder/capabilities/constants";
import {
  freezeCapabilityManifest,
  ManifestWriteViolationError,
  type ReadonlyWebsiteCapabilityManifest,
} from "@/lib/website/builder/capabilities/immutable";
import { MANIFEST_WRITE_TOKEN } from "@/lib/website/builder/capabilities/manifest-write-token";
import { guardProjectSettings } from "@/lib/website/builder/capabilities/settings-guard";
import { extractProjectSignals } from "@/lib/website/builder/capabilities/signals";
import { buildFinalCapabilityManifest } from "@/lib/website/builder/capabilities/scoring";
import type { WebsiteCapabilityManifest } from "@/lib/website/builder/capabilities/types";

export { MANIFEST_WRITE_TOKEN };

/** Read frozen manifest from project settings (internal — service only). */
export function loadManifestFromProject(
  project: GeneratedWebsiteProject,
): ReadonlyWebsiteCapabilityManifest | null {
  const settings = project.settings as Record<string, unknown> | undefined;
  const raw = settings?.[WB_WEBSITE_CAPABILITY_MANIFEST_SETTING];
  if (!raw || typeof raw !== "object") return null;
  const manifest = raw as WebsiteCapabilityManifest;
  if (!Array.isArray(manifest.capabilities)) return null;
  return freezeCapabilityManifest(manifest);
}

/**
 * Single authorized write path for WebsiteCapabilityManifest.
 * Requires MANIFEST_WRITE_TOKEN — only WebsiteCapabilityService holds this.
 */
export function persistManifestToProject(
  writeToken: symbol,
  project: GeneratedWebsiteProject,
  manifest: WebsiteCapabilityManifest,
): GeneratedWebsiteProject {
  if (writeToken !== MANIFEST_WRITE_TOKEN) {
    throw new ManifestWriteViolationError(
      "Unauthorized manifest persistence attempt.",
    );
  }

  const frozen = freezeCapabilityManifest(manifest);
  const nextSettings = {
    ...(project.settings ?? {}),
    [WB_WEBSITE_CAPABILITY_MANIFEST_SETTING]: frozen,
  };

  return guardProjectSettings({
    ...project,
    settings: nextSettings,
  });
}

/**
 * @deprecated Use WebsiteCapabilityService — loads via loadManifestFromProject().
 * Preserved for backward compatibility; returns a frozen manifest.
 */
export function readWebsiteCapabilityManifest(
  project: GeneratedWebsiteProject,
): ReadonlyWebsiteCapabilityManifest | null {
  return loadManifestFromProject(project);
}

/**
 * @deprecated Direct manifest attachment is forbidden.
 * Use WebsiteCapabilityService.refresh() or rebuild().
 */
export function attachWebsiteCapabilityManifest(
  _project: GeneratedWebsiteProject,
  _manifest: WebsiteCapabilityManifest,
): GeneratedWebsiteProject {
  throw new ManifestWriteViolationError(
    "attachWebsiteCapabilityManifest() is deprecated. Use WebsiteCapabilityService.refresh() or rebuild().",
  );
}

/**
 * @deprecated Compute-only helper. Prefer WebsiteCapabilityService.refresh().
 * Does not persist — returns a mutable build result for legacy callers.
 */
export function ensureWebsiteCapabilityManifest(
  project: GeneratedWebsiteProject,
  options?: { files?: GeneratedProjectFile[]; projectId?: string; force?: boolean },
): WebsiteCapabilityManifest {
  if (!options?.force) {
    const existing = loadManifestFromProject(project);
    if (existing?.phase === "final") {
      return structuredClone(existing) as WebsiteCapabilityManifest;
    }
  }

  const signals = extractProjectSignals(project, options?.files);
  return buildFinalCapabilityManifest(signals, options?.projectId ?? project.title);
}

/**
 * @deprecated Use WebsiteCapabilityService.rebuild().
 */
export function ensureProjectWithCapabilityManifest(
  _project: GeneratedWebsiteProject,
  _options?: { files?: GeneratedProjectFile[]; projectId?: string; force?: boolean },
): GeneratedWebsiteProject {
  throw new ManifestWriteViolationError(
    "ensureProjectWithCapabilityManifest() is deprecated. Use WebsiteCapabilityService.rebuild().",
  );
}
