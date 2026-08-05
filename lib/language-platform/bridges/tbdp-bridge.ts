import { resolveLanguageContext as resolveTbdpLanguageContext } from "@/lib/design-platform/integration/language-bridge";
import type { GlsLanguageContext } from "@/lib/language-platform/core/types";

/** Bridge to TBDP language context — backward compatible enrichment. */
export function bridgeToTbdpLanguageContext(ctx: GlsLanguageContext) {
  const tbdp = resolveTbdpLanguageContext({
    websiteLanguage: ctx.website.language,
    generationLanguage: ctx.generation.language,
    templateLanguage: ctx.template.language,
    direction: ctx.direction.direction,
  });

  return {
    gls: ctx,
    tbdp,
    aligned:
      tbdp.direction === ctx.direction.direction &&
      tbdp.typographyProfile === ctx.typography.tbdpProfileId,
  };
}

export function glsToTbdpTypographyProfile(
  ctx: GlsLanguageContext,
): typeof ctx.typography.tbdpProfileId {
  return ctx.typography.tbdpProfileId;
}
