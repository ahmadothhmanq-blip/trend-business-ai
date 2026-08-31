/**
 * Repair-mode policy for App Builder.
 * Deterministic generations (aiFileCount === 0) must never invoke DeepSeek repair.
 */

export function isDeterministicRepairMode(aiFileCount: number): boolean {
  return aiFileCount <= 0;
}

export function isLlmRepairAllowed(aiFileCount: number): boolean {
  return aiFileCount > 0;
}

export function formatDeterministicRepairAbort(issues: string[]): Error {
  const unique = [...new Set(issues.filter(Boolean))];
  return new Error(
    [
      "Deterministic repair failed (DeepSeek repair disabled when aiFileCount=0).",
      "Scaffold → Hardener → Validation could not produce a valid project.",
      "",
      ...unique,
    ].join("\n"),
  );
}

export function collectRepairValidationIssues(parts: {
  validationIssues?: string[];
  uiContractIssues?: string[];
  tsContractIssues?: string[];
  rootFileIssues?: string[];
  readinessIssues?: string[];
}): string[] {
  return [
    ...(parts.validationIssues ?? []),
    ...(parts.uiContractIssues ?? []),
    ...(parts.tsContractIssues ?? []),
    ...(parts.rootFileIssues ?? []),
    ...(parts.readinessIssues ?? []),
  ];
}
