export type {
  ImageManagementAction,
  ImageManagementRequest,
  ImageManagementResult,
  ManagedSiteImage,
} from "@/lib/website/image-management/operations";

export {
  applyImageManagementOperation,
  listManagedSiteImages,
} from "@/lib/website/image-management/operations";

export {
  buildSiteImageSlotInventory,
  findSiteImagesFile,
} from "@/lib/website/image-management/list-slots";

export {
  validateAndRepairProjectImages,
  summarizeRulesReport,
} from "@/lib/website/image-management/validate-before-render";
export type {
  ImageValidationContext,
  ImageValidationResult,
} from "@/lib/website/image-management/validate-before-render";

export {
  applyProjectImageOperation,
  listProjectSiteImages,
  loadProjectForImageManagement,
  validateProjectImages,
} from "@/lib/website/image-management/service";

export {
  optimizeImageFile,
  lazyLoadingAttrs,
  RESPONSIVE_WIDTHS,
} from "@/lib/website/image-management/client-optimize";
export type {
  ClientOptimizeOptions,
  OptimizedImageResult,
} from "@/lib/website/image-management/client-optimize";
