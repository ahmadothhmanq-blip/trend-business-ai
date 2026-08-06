import type { DesignFoundationInput } from "@/lib/website/template-v2/foundation/types";
import { buildFoundationCompatCss } from "@/lib/website/template-v2/foundation/compat";
import { buildFoundationMotionCss } from "@/lib/website/template-v2/foundation/motion";
import { buildFoundationPrimitivesCss } from "@/lib/website/template-v2/foundation/primitives";
import { buildFoundationResponsiveCss } from "@/lib/website/template-v2/foundation/responsive";
import { buildFoundationTokenScaleCss } from "@/lib/website/template-v2/foundation/token-scale";

export { FOUNDATION_UI } from "@/lib/website/template-v2/foundation/compat";
export type { DesignFoundationInput, FoundationUi } from "@/lib/website/template-v2/foundation/types";

/**
 * Build the shared Design Foundation CSS layer injected for every V2 flagship template.
 * Improves typography, spacing, layout, components, motion, and responsive behavior globally.
 */
export function buildDesignFoundationCss(input: DesignFoundationInput): string {
  return [
    buildFoundationTokenScaleCss(input.tokens),
    buildFoundationMotionCss(),
    buildFoundationPrimitivesCss(),
    buildFoundationResponsiveCss(input.responsive),
    buildFoundationCompatCss(),
  ].join("\n\n");
}
