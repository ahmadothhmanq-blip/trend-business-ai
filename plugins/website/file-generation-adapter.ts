import type { PlannedFile } from "@/lib/ai/planner";
import { SCAFFOLD_PATHS } from "@/lib/ai/website-scaffold";
import {
  hasProfessionalScaffold,
} from "@/lib/ai-core/components";
import type {
  FileDependencyEdge,
  FileGenerationProductAdapter,
  FileTaskKind,
  FileTaskKindContext,
} from "@/lib/ai-core/file-generation/types";

export const websiteFileGenerationAdapter: FileGenerationProductAdapter = {
  productId: "website",

  resolveTaskKind(plannedFile, context): FileTaskKind {
    if (context.scaffoldPaths.has(plannedFile.path)) {
      return "scaffold";
    }

    if (
      context.reusePrevious &&
      context.previousPaths.has(plannedFile.path)
    ) {
      return "reuse";
    }

    if (context.shouldDeferHomePage(plannedFile.path)) {
      return "deferred";
    }

    if (
      context.hasLibraryScaffold(plannedFile.path) &&
      !context.localizedCopy
    ) {
      return "library-scaffold";
    }

    return "llm";
  },

  buildDependencyEdges(
    filePlans: PlannedFile[],
    _context: FileTaskKindContext,
  ): FileDependencyEdge[] {
    const edges: FileDependencyEdge[] = [];
    const pathSet = new Set(filePlans.map((file) => file.path));

    if (pathSet.has("middleware.ts") && pathSet.has("app/login/page.tsx")) {
      edges.push({
        from: "middleware.ts",
        to: "app/login/page.tsx",
        reason: "auth-feature",
      });
    }

    if (
      pathSet.has("app/dashboard/layout.tsx") &&
      pathSet.has("app/dashboard/page.tsx")
    ) {
      edges.push({
        from: "app/dashboard/layout.tsx",
        to: "app/dashboard/page.tsx",
        reason: "dashboard-feature",
      });
    }

    return edges;
  },

  waveConcurrencyForProfile(profile, waveName) {
    if (waveName !== "components") return 1;
    if (profile === "ultra") return 2;
    if (profile === "fast") return 3;
    return 4;
  },
};

export function buildWebsiteFileTaskKindContext(params: {
  localizedCopy: boolean;
  componentPaletteForCompose?: string[];
  generationProfile: string;
  reusePrevious: boolean;
  previousPaths: Iterable<string>;
  shouldDeferHomePage: (path: string) => boolean;
}): FileTaskKindContext {
  return {
    scaffoldPaths: SCAFFOLD_PATHS,
    localizedCopy: params.localizedCopy,
    composeHomePage: true,
    generationProfile: params.generationProfile,
    reusePrevious: params.reusePrevious,
    previousPaths: new Set(params.previousPaths),
    hasLibraryScaffold: hasProfessionalScaffold,
    shouldDeferHomePage: params.shouldDeferHomePage,
  };
}
