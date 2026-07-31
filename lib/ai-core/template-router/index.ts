export type { UnifiedTemplateRoute } from "@/lib/ai-core/template-router/types";
export {
  UNIFIED_TEMPLATE_ROUTE_KEY,
} from "@/lib/ai-core/template-router/types";
export {
  applyUnifiedTemplateRouteToBrief,
  configurePremiumFromUnifiedRoute,
  getUnifiedTemplateRouteFromBrief,
  routeWebsiteGeneration,
} from "@/lib/ai-core/template-router/engine";
/** @deprecated Use routeWebsiteGeneration */
export { routeWebsiteGeneration as routeUnifiedTemplate } from "@/lib/ai-core/template-router/engine";