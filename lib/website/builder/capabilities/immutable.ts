import type {
  CapabilityEvidence,
  CapabilityManifestEntry,
  WebsiteCapabilityManifest,
} from "@/lib/website/builder/capabilities/types";

export class ManifestWriteViolationError extends Error {
  constructor(
    message = "Direct WebsiteCapabilityManifest mutation is forbidden. Use WebsiteCapabilityService.refresh() or WebsiteCapabilityService.rebuild().",
  ) {
    super(message);
    this.name = "ManifestWriteViolationError";
  }
}

export class ManifestReadViolationError extends Error {
  constructor(
    message = "Direct WebsiteCapabilityManifest access is forbidden. Use WebsiteCapabilityService.",
  ) {
    super(message);
    this.name = "ManifestReadViolationError";
  }
}

export type ReadonlyWebsiteCapabilityManifest = Readonly<
  Omit<WebsiteCapabilityManifest, "capabilities">
> & {
  readonly capabilities: readonly Readonly<CapabilityManifestEntry>[];
};

function freezeEvidence(
  evidence: CapabilityEvidence[],
): readonly CapabilityEvidence[] {
  for (const item of evidence) {
    Object.freeze(item);
  }
  return Object.freeze(evidence);
}

function freezeEntry(entry: CapabilityManifestEntry): CapabilityManifestEntry {
  const frozenEvidence = freezeEvidence([...entry.evidence]);
  const frozen: CapabilityManifestEntry = {
    ...entry,
    evidence: [...frozenEvidence],
    metadata: entry.metadata ? Object.freeze({ ...entry.metadata }) : undefined,
  };
  Object.freeze(frozen);
  return frozen;
}

/** Deep-freeze a manifest so runtime mutation throws (dev + prod). */
export function freezeCapabilityManifest(
  manifest: WebsiteCapabilityManifest,
): ReadonlyWebsiteCapabilityManifest {
  const capabilities = manifest.capabilities.map((entry) => freezeEntry({ ...entry }));
  const frozenCapabilities = Object.freeze(capabilities);
  const frozen: WebsiteCapabilityManifest = {
    ...manifest,
    capabilities: [...frozenCapabilities],
  };
  Object.freeze(frozen);
  return frozen as ReadonlyWebsiteCapabilityManifest;
}

export function cloneCapabilityManifest(
  manifest: ReadonlyWebsiteCapabilityManifest,
): WebsiteCapabilityManifest {
  return structuredClone(manifest) as WebsiteCapabilityManifest;
}
