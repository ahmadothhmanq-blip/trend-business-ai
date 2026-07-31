import type {
  WbComponentRendererContractDocument,
  WbComponentResolvedPackage,
} from "@/lib/website/component-library/types";

/**
 * Rendering contract — defines the output agreement between a component package
 * and a future renderer implementation. This module does NOT render anything.
 */
export type WbComponentRenderTreeNode = {
  componentId: string;
  variantId?: string;
  props: Record<string, unknown>;
  slots: Record<string, WbComponentRenderTreeNode[]>;
  meta: {
    capability: string;
    category: string;
    contractVersion: string;
  };
};

export type WbComponentRenderContractContext = {
  componentId: string;
  variantId?: string;
  props?: Record<string, unknown>;
  childrenBySlot?: Record<string, WbComponentRenderTreeNode[]>;
};

/**
 * Builds an abstract render tree node that satisfies the renderer contract.
 * No HTML output — architecture placeholder for future render pipeline.
 */
export function buildAbstractRenderTree(
  pkg: WbComponentResolvedPackage,
  context: WbComponentRenderContractContext,
): WbComponentRenderTreeNode {
  const contract = pkg.renderer;
  assertRendererContract(pkg.manifest.id, contract);

  return {
    componentId: pkg.manifest.id,
    variantId: context.variantId,
    props: context.props ?? {},
    slots: context.childrenBySlot ?? {},
    meta: {
      capability: pkg.manifest.capability,
      category: pkg.manifest.category,
      contractVersion: contract.contractVersion,
    },
  };
}

export function assertRendererContract(
  manifestId: string,
  contract: WbComponentRendererContractDocument,
): void {
  if (contract.componentId !== manifestId) {
    throw new Error(
      `renderer contract componentId "${contract.componentId}" does not match manifest id "${manifestId}"`,
    );
  }
  if (!contract.rootElement.trim()) {
    throw new Error(`renderer contract for "${manifestId}" requires rootElement`);
  }
}

export function assertResolvedRendererContract(
  pkg: WbComponentResolvedPackage,
): void {
  assertRendererContract(pkg.manifest.id, pkg.renderer);
}

export function describeRendererContract(
  contract: WbComponentRendererContractDocument,
): string {
  return [
    `contract=${contract.contractVersion}`,
    `output=${contract.output}`,
    `root=${contract.rootElement}`,
    `slots=${contract.slotRendering}`,
  ].join(" · ");
}
