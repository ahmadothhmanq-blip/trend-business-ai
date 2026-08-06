/** Template Architecture V2 spec version (extends package spec 2.0.0 with presentation layer). */
export const WB_TEMPLATE_V2_SPEC_VERSION = "3.0.0";

/** Template SDK version for V2 package authoring. */
export const WB_TEMPLATE_V2_SDK_VERSION = "1.0.0";

/** Default V2 page composer identifier. */
export const WB_TEMPLATE_V2_DEFAULT_COMPOSER = "region-grid";

export const WB_TEMPLATE_V2_ARCHITECTURE_VERSIONS = ["v1", "v2"] as const;

export type TemplateArchitectureVersion =
  (typeof WB_TEMPLATE_V2_ARCHITECTURE_VERSIONS)[number];

/** Project settings key — set when a V2 template is applied (P1+). */
export const WB_TEMPLATE_ARCHITECTURE_VERSION_SETTING =
  "templateArchitectureVersion";

/** Project settings key — presentation profile hash for cache invalidation (P1+). */
export const WB_TEMPLATE_PRESENTATION_HASH_SETTING = "templatePresentationHash";

/** Project settings key — V2 composer id (P1+). */
export const WB_TEMPLATE_COMPOSER_ID_SETTING = "templateComposerId";

/** Project settings key — persisted Website Blueprint (production integration). */
export const WB_WEBSITE_BLUEPRINT_SETTING = "websiteBlueprintV2";

/** Project settings key — Design Director report from last generation. */
export const WB_DESIGN_DIRECTOR_REPORT_SETTING = "designDirectorReportV2";
