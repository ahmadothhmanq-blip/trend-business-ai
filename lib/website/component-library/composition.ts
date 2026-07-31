import type {
  WbComponentCompositionDocument,
  WbComponentCompositionNode,
  WbComponentCompositionValidationResult,
  WbComponentManifest,
  WbComponentResolvedPackage,
  WbComponentSlotsDocument,
  WbComponentValidationIssue,
} from "@/lib/website/component-library/types";

function issue(
  code: string,
  message: string,
  path?: string,
): WbComponentValidationIssue {
  return { code, message, path };
}

function slotById(
  slots: WbComponentSlotsDocument,
  slotId: string,
) {
  return slots.slots.find((slot) => slot.id === slotId);
}

function validateCompositionNode(
  node: WbComponentCompositionNode,
  slots: WbComponentSlotsDocument,
  composition: WbComponentCompositionDocument | undefined,
  installedCapabilities: Set<string>,
  installedComponentIds: Set<string>,
  issues: WbComponentValidationIssue[],
  path: string,
): void {
  const slot = slotById(slots, node.slotId);
  if (!slot) {
    issues.push(
      issue(
        "composition.slot.unknown",
        `composition node references unknown slot "${node.slotId}"`,
        path,
      ),
    );
    return;
  }

  if (node.capability && !slot.accepts.includes(node.capability)) {
    issues.push(
      issue(
        "composition.capability.rejected",
        `slot "${node.slotId}" does not accept capability "${node.capability}"`,
        path,
      ),
    );
  }

  if (node.componentId) {
    if (slot.acceptsComponents && !slot.acceptsComponents.includes(node.componentId)) {
      issues.push(
        issue(
          "composition.component.rejected",
          `slot "${node.slotId}" does not accept component "${node.componentId}"`,
          path,
        ),
      );
    }
    if (
      composition?.allowedChildComponents &&
      !composition.allowedChildComponents.includes(node.componentId)
    ) {
      issues.push(
        issue(
          "composition.component.not-allowed",
          `component "${node.componentId}" is not in allowedChildComponents`,
          path,
        ),
      );
    }
    if (!installedComponentIds.has(node.componentId)) {
      issues.push(
        issue(
          "composition.component.missing",
          `referenced component "${node.componentId}" is not installed`,
          path,
        ),
      );
    }
  }

  if (node.capability && composition?.allowedChildCapabilities) {
    if (!composition.allowedChildCapabilities.includes(node.capability)) {
      issues.push(
        issue(
          "composition.capability.not-allowed",
          `capability "${node.capability}" is not in allowedChildCapabilities`,
          path,
        ),
      );
    }
  }

  if (node.capability && !installedCapabilities.has(node.capability)) {
    // capability is enum-defined — always known at spec level
  }

  for (const [index, child] of (node.children ?? []).entries()) {
    if (!slot.allowNesting) {
      issues.push(
        issue(
          "composition.nesting.forbidden",
          `slot "${node.slotId}" does not allow nested children`,
          `${path}.children[${index}]`,
        ),
      );
    }
    validateCompositionNode(
      child,
      slots,
      composition,
      installedCapabilities,
      installedComponentIds,
      issues,
      `${path}.children[${index}]`,
    );
  }
}

/**
 * Validates an example composition tree against slot acceptance rules.
 * Used for package validation and future runtime composition checks.
 */
export function validateComponentComposition(
  pkg: Pick<
    WbComponentResolvedPackage,
    "manifest" | "slots" | "composition"
  >,
  nodes: WbComponentCompositionNode[],
  context?: {
    installedComponentIds?: Set<string>;
  },
): WbComponentCompositionValidationResult {
  const issues: WbComponentValidationIssue[] = [];
  const installedComponentIds = context?.installedComponentIds ?? new Set<string>();
  const installedCapabilities = new Set<string>(
    pkg.slots.slots.flatMap((slot) => slot.accepts),
  );

  for (const [index, node] of nodes.entries()) {
    validateCompositionNode(
      node,
      pkg.slots,
      pkg.composition,
      installedCapabilities,
      installedComponentIds,
      issues,
      `example[${index}]`,
    );
  }

  return { valid: issues.length === 0, issues };
}

export function validateComposableManifestConsistency(
  manifest: WbComponentManifest,
  slots: WbComponentSlotsDocument,
  issues: WbComponentValidationIssue[],
): void {
  if (!manifest.composable) {
    if (slots.slots.length > 0) {
      issues.push(
        issue(
          "composition.primitive.slots",
          "primitive components should not declare non-empty slot collections",
          "slots",
        ),
      );
    }
    return;
  }

  if (slots.slots.length === 0) {
    issues.push(
      issue(
        "composition.composable.no-slots",
        "composable components must declare at least one slot",
        "slots",
      ),
    );
  }
}
