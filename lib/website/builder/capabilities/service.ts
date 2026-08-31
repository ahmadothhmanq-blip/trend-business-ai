import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import { getCapabilityDefinition } from "@/lib/website/builder/capabilities/definitions";
import {
  mergeSeededEvidence,
  seedManifestFromFeatures,
} from "@/lib/website/builder/capabilities/feature-bridge";
import { projectCapabilityFlagsFromActiveIds } from "@/lib/website/builder/capabilities/flags-bridge";
import type { ReadonlyWebsiteCapabilityManifest } from "@/lib/website/builder/capabilities/immutable";
import {
  loadManifestFromProject,
  persistManifestToProject,
  MANIFEST_WRITE_TOKEN,
} from "@/lib/website/builder/capabilities/manifest";
import { guardProjectSettings } from "@/lib/website/builder/capabilities/settings-guard";
import { extractProjectSignals } from "@/lib/website/builder/capabilities/signals";
import {
  buildInitialCapabilityManifest,
  verifyCapabilityManifest,
} from "@/lib/website/builder/capabilities/scoring";
import type { CapabilityDefinition } from "@/lib/website/builder/capabilities/definitions";
import type {
  CapabilityManifestEntry,
  WebsiteCapabilityId,
  WebsiteCapabilityManifest,
} from "@/lib/website/builder/capabilities/types";
import { isSitePlanV1Enabled } from "@/lib/website/generation-flags";
import { mergePrescriptiveCapabilities } from "@/lib/website/site-plan/capabilities-bridge";
import type { ProjectCapabilityFlags } from "@/lib/ai/validator";

export type RefreshCapabilitiesOptions = {
  files?: GeneratedProjectFile[];
  projectId?: string;
  force?: boolean;
  seedFeatures?: string[];
};

export type RefreshCapabilitiesResult = {
  service: WebsiteCapabilityService;
  project: GeneratedWebsiteProject;
};

/**
 * Canonical capability API — the only supported entry point for reading capabilities.
 * Manifest persistence is allowed only via `refresh()` and `rebuild()`.
 */
export class WebsiteCapabilityService {
  private readonly manifest: ReadonlyWebsiteCapabilityManifest;

  private constructor(manifest: ReadonlyWebsiteCapabilityManifest) {
    this.manifest = manifest;
  }

  getCapability(id: WebsiteCapabilityId): Readonly<CapabilityManifestEntry> | null {
    const entry = this.manifest.capabilities.find((item) => item.id === id);
    if (!entry || entry.status !== "active" || entry.confidence === "low") {
      return null;
    }
    return entry;
  }

  hasCapability(id: WebsiteCapabilityId): boolean {
    return this.getCapability(id) !== null;
  }

  hasAnyCapability(ids: WebsiteCapabilityId[]): boolean {
    return ids.some((id) => this.hasCapability(id));
  }

  getActiveCapabilities(): WebsiteCapabilityId[] {
    return this.manifest.capabilities
      .filter((entry) => entry.status === "active" && entry.confidence !== "low")
      .map((entry) => entry.id);
  }

  getCapabilityMetadata(id: WebsiteCapabilityId): CapabilityDefinition | null {
    return getCapabilityDefinition(id) ?? null;
  }

  getPhase(): WebsiteCapabilityManifest["phase"] {
    return this.manifest.phase;
  }

  getAnalyzerSetVersion(): string {
    return this.manifest.analyzerSetVersion;
  }

  getProjectCapabilityFlags(): ProjectCapabilityFlags {
    return projectCapabilityFlagsFromActiveIds(this.getActiveCapabilities());
  }

  /** Load or build manifest without forcing rebuild when a final manifest exists. */
  static refresh(
    project: GeneratedWebsiteProject,
    options?: RefreshCapabilitiesOptions,
  ): RefreshCapabilitiesResult {
    return WebsiteCapabilityService.resolve(project, options, false);
  }

  /** Force a full manifest rebuild and persist (single write path). */
  static rebuild(
    project: GeneratedWebsiteProject,
    options?: Omit<RefreshCapabilitiesOptions, "force">,
  ): RefreshCapabilitiesResult {
    return WebsiteCapabilityService.resolve(project, options, true);
  }

  /** @deprecated Use WebsiteCapabilityService.refresh() */
  static fromProject(
    project: GeneratedWebsiteProject,
    files?: GeneratedProjectFile[],
  ): WebsiteCapabilityService {
    return WebsiteCapabilityService.refresh(project, { files }).service;
  }

  private static resolve(
    project: GeneratedWebsiteProject,
    options: RefreshCapabilitiesOptions | undefined,
    forceRebuild: boolean,
  ): RefreshCapabilitiesResult {
    const guardedProject = guardProjectSettings(project);
    const projectId = options?.projectId ?? guardedProject.title;

    if (!forceRebuild && !options?.force && !options?.seedFeatures?.length) {
      const existing = loadManifestFromProject(guardedProject);
      if (existing?.phase === "final") {
        return {
          service: new WebsiteCapabilityService(existing),
          project: guardedProject,
        };
      }
    }

    const signals = extractProjectSignals(guardedProject, options?.files);
    const seeded = options?.seedFeatures?.length
      ? seedManifestFromFeatures(options.seedFeatures, projectId)
      : null;

    const initial = buildInitialCapabilityManifest(signals, projectId);
    let mergedInitial: WebsiteCapabilityManifest = seeded
      ? {
          ...initial,
          capabilities: mergeSeededEvidence(
            initial.capabilities,
            seeded.capabilities,
          ),
        }
      : initial;

    if (isSitePlanV1Enabled() && guardedProject.sitePlan) {
      mergedInitial = {
        ...mergedInitial,
        analyzerSetVersion: "site-plan-prescriptive",
        capabilities: mergePrescriptiveCapabilities(
          mergedInitial.capabilities,
          guardedProject.sitePlan,
        ),
      };
    }

    const final = verifyCapabilityManifest(mergedInitial, signals, projectId);
    const updatedProject = persistManifestToProject(
      MANIFEST_WRITE_TOKEN,
      guardedProject,
      final,
    );
    const frozen = loadManifestFromProject(updatedProject)!;

    return {
      service: new WebsiteCapabilityService(frozen),
      project: updatedProject,
    };
  }
}

/** @deprecated Use WebsiteCapabilityService.refresh() */
export function refreshCapabilities(
  project: GeneratedWebsiteProject,
  options?: RefreshCapabilitiesOptions,
): RefreshCapabilitiesResult {
  return WebsiteCapabilityService.refresh(project, options);
}

/** @deprecated Use WebsiteCapabilityService.refresh() */
export function createCapabilityService(
  project: GeneratedWebsiteProject,
  files?: GeneratedProjectFile[],
): WebsiteCapabilityService {
  return WebsiteCapabilityService.refresh(project, { files }).service;
}

/** @deprecated Use WebsiteCapabilityService.refresh() + service.getProjectCapabilityFlags() */
export function projectCapabilityFlags(
  project: GeneratedWebsiteProject,
  options?: RefreshCapabilitiesOptions,
) {
  const { service, project: updated } = WebsiteCapabilityService.refresh(
    project,
    options,
  );
  return {
    flags: service.getProjectCapabilityFlags(),
    service,
    project: updated,
  };
}

export type CapabilityGatedItem = {
  capabilityId?: WebsiteCapabilityId;
  requiresAnyCapability?: WebsiteCapabilityId[];
  alwaysVisible?: boolean;
};

export function filterItemsByCapabilities<T extends CapabilityGatedItem>(
  items: T[],
  service: WebsiteCapabilityService,
): T[] {
  return items.filter((item) => {
    if (item.alwaysVisible) return true;
    if (item.capabilityId) return service.hasCapability(item.capabilityId);
    if (item.requiresAnyCapability?.length) {
      return service.hasAnyCapability(item.requiresAnyCapability);
    }
    return true;
  });
}
