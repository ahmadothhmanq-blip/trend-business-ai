import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { appBuilderAdapter } from "@/lib/ai-core/universal-planner/adapters/app-builder-adapter";
import { brandDesignerAdapter } from "@/lib/ai-core/universal-planner/adapters/brand-designer-adapter";
import { businessIntelligenceAdapter } from "@/lib/ai-core/universal-planner/adapters/business-intelligence-adapter";
import { businessManagerAdapter } from "@/lib/ai-core/universal-planner/adapters/business-manager-adapter";
import { contentStudioAdapter } from "@/lib/ai-core/universal-planner/adapters/content-studio-adapter";
import { crmAdapter } from "@/lib/ai-core/universal-planner/adapters/crm-adapter";
import { erpAdapter } from "@/lib/ai-core/universal-planner/adapters/erp-adapter";
import { imageGeneratorAdapter } from "@/lib/ai-core/universal-planner/adapters/image-generator-adapter";
import { landingPageAdapter } from "@/lib/ai-core/universal-planner/adapters/landing-page-adapter";
import { logoDesignerAdapter } from "@/lib/ai-core/universal-planner/adapters/logo-designer-adapter";
import { marketingAdapter } from "@/lib/ai-core/universal-planner/adapters/marketing-adapter";
import { socialMediaAdapter } from "@/lib/ai-core/universal-planner/adapters/social-media-adapter";
import { videoStudioAdapter } from "@/lib/ai-core/universal-planner/adapters/video-studio-adapter";
import { websiteBuilderAdapter } from "@/lib/ai-core/universal-planner/adapters/website-builder-adapter";
import type { UniversalServiceId } from "@/lib/ai-core/universal-planner/types";

export const UNIVERSAL_PLANNER_ADAPTERS: UniversalPlannerAdapter[] = [
  websiteBuilderAdapter,
  appBuilderAdapter,
  landingPageAdapter,
  logoDesignerAdapter,
  brandDesignerAdapter,
  imageGeneratorAdapter,
  videoStudioAdapter,
  contentStudioAdapter,
  marketingAdapter,
  socialMediaAdapter,
  crmAdapter,
  erpAdapter,
  businessManagerAdapter,
  businessIntelligenceAdapter,
];

export const IMPLEMENTED_SERVICE_IDS = UNIVERSAL_PLANNER_ADAPTERS.map(
  (adapter) => adapter.serviceId,
);

const ADAPTER_MAP = new Map<UniversalServiceId, UniversalPlannerAdapter>(
  UNIVERSAL_PLANNER_ADAPTERS.map((adapter) => [adapter.serviceId, adapter]),
);

export function getUniversalPlannerAdapter(
  serviceId: UniversalServiceId,
): UniversalPlannerAdapter | undefined {
  return ADAPTER_MAP.get(serviceId);
}

export function getRegisteredAdapterServiceIds(): UniversalServiceId[] {
  return [...ADAPTER_MAP.keys()];
}
