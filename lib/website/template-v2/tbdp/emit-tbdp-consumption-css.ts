import { emitTbdpExperienceCss } from "@/lib/design-platform/experience";
import { emitTbdpCssVariables } from "@/lib/design-platform/tokens";
import type { TbdpNativeConsumptionMeta } from "@/lib/website/template-v2/tbdp/types";
import type { TbdpDesignContext } from "@/lib/design-platform/integration/core/types";

/**
 * Emits TBDP authority layer for globals.css.
 * V2 --color-* / --font-* remain the runtime surface for rs-* utilities;
 * TBDP vars are emitted for traceability and platform contract compliance.
 */
export function buildTbdpNativeAuthorityCss(
  meta: TbdpNativeConsumptionMeta,
  designContext: TbdpDesignContext,
): string {
  const templateResolution = designContext.template;
  const tbdpTokenCss = templateResolution
    ? templateResolution.cssVariables
    : emitTbdpCssVariables(designContext.sectorResolved.foundations);

  const experienceCss = templateResolution
    ? templateResolution.experienceCss
    : emitTbdpExperienceCss();

  const profileList = meta.experienceProfileIds.join(", ");
  const primaryExperience =
    designContext.experienceProfile.id ?? meta.experienceProfileIds[0] ?? "hospitality";

  return [
    `/* TBDP Native Consumption — ${meta.packageId}`,
    `   sector:${meta.sectorDnaId} · experience:${profileList}`,
    `   identity:${meta.templateIdentity} · context:${meta.contextHash}`,
    `   integration:${meta.integrationVersion} · consumption:${meta.consumptionVersion} */`,
    ":root {",
    `  --tbdp-native: 1;`,
    `  --tbdp-native-package: "${meta.packageId}";`,
    `  --tbdp-sector-dna: "${meta.sectorDnaId}";`,
    `  --tbdp-template-identity: "${meta.templateIdentity}";`,
    `  --tbdp-experience-primary: "${primaryExperience}";`,
    `  --tbdp-context-hash: "${meta.contextHash}";`,
    `  --tbdp-theme-mode: "${designContext.theme.resolvedMode}";`,
    `  --tbdp-direction: "${designContext.language.direction}";`,
    "}",
    "",
    "/* TBDP Foundations — official design authority (scoped vars) */",
    tbdpTokenCss,
    "",
    "/* TBDP Experience — motion, interaction, RTL, accessibility */",
    experienceCss,
  ].join("\n");
}
