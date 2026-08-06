import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import { usesLlmLocalizedWebsiteCopy } from "@/lib/ai-core/content/content-language";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import { composeRegionGridPage } from "@/lib/website/template-v2/composer/region-grid-composer";
import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import {
  applyBlueprintToBundle,
  buildBlueprintDesignCss,
} from "@/lib/website/template-v2/integration/apply-blueprint-design";
import { resolveBlueprintRegionPlan } from "@/lib/website/template-v2/integration/section-component-map";
import { readPackageComponentScaffold } from "@/lib/website/template-v2/loader/read-package-scaffold";
import { buildV2MotionSource, V2_MOTION_PATH } from "@/lib/website/template-v2/motion/emit-motion";
import { buildV2ResponsiveCss } from "@/lib/website/template-v2/responsive/emit-responsive-css";
import { applyV2DesignTokensToGlobals } from "@/lib/website/template-v2/tokens/emit-design-tokens";
import { buildDefaultSiteImagesSource } from "@/lib/website/template-v2/tokens/emit-site-images";
import { componentIdToProjectPath } from "@/lib/website/template-v2/utils/component-naming";

function ensureV2RootLayout(byPath: Map<string, GeneratedProjectFile>, brandName?: string): void {
  const existing = byPath.get("app/layout.tsx");
  if (existing?.content.includes("viewport")) return;

  const title = brandName?.trim() || "Website";
  byPath.set("app/layout.tsx", {
    path: "app/layout.tsx",
    content: `import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(`${title} — premium digital experience`)},
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
`,
    language: "tsx",
  });
}

export type InjectV2PipelineParams = {
  files: GeneratedProjectFile[];
  bundle: TemplateV2PackageBundle;
  brandName?: string;
  pageTitle?: string;
  pageDescription?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroEyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  content?: ProductionContentPack | null;
  language?: string | null;
  flowKey?: string;
  forceDesignRebuild?: boolean;
  /** Optimized Website Blueprint — single source of truth for composition. */
  websiteBlueprint?: WebsiteBlueprint | null;
};

/**
 * V2 Injection Pipeline — inject package scaffolds, compose home page, emit tokens/motion/responsive.
 */
export async function injectV2TemplatePipeline(
  params: InjectV2PipelineParams,
): Promise<GeneratedProjectFile[]> {
  const byPath = new Map(params.files.map((f) => [f.path, f]));
  const localizedCopy =
    usesLlmLocalizedWebsiteCopy(params.language) && !params.forceDesignRebuild;

  let bundle = params.bundle;
  const blueprint = params.websiteBlueprint ?? null;
  if (blueprint) {
    bundle = applyBlueprintToBundle(bundle, blueprint);
  }

  if (!byPath.has("lib/site-images.ts")) {
    byPath.set("lib/site-images.ts", {
      path: "lib/site-images.ts",
      content: buildDefaultSiteImagesSource(params.bundle.packageId),
      language: "typescript",
    });
  }

  ensureV2RootLayout(byPath, params.brandName);

  byPath.set(V2_MOTION_PATH, {
    path: V2_MOTION_PATH,
    content: buildV2MotionSource(params.bundle.motion),
    language: "tsx",
  });

  const responsiveCss = buildV2ResponsiveCss(params.bundle.responsive);
  const globals = byPath.get("app/globals.css");
  const globalsBase = globals?.content ?? `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
  if (!globalsBase.includes("Template Architecture V2 — responsive")) {
    byPath.set("app/globals.css", {
      path: "app/globals.css",
      content: `${globalsBase}\n${responsiveCss}\n`,
      language: "css",
    });
  }

  if (localizedCopy) {
    return Array.from(byPath.values());
  }

  for (const component of params.bundle.componentRegistry.components) {
    const scaffold = await readPackageComponentScaffold(
      params.bundle.packageDirectory,
      params.bundle.packageId,
      component,
    );
    if (!scaffold) continue;
    byPath.set(scaffold.path, {
      path: scaffold.path,
      content: scaffold.content,
      language: "tsx",
    });
  }

  const sectionShell = params.bundle.componentRegistry.components.find(
    (c) => c.id.includes("section-shell"),
  );
  if (sectionShell) {
    const shellPath = componentIdToProjectPath(
      params.bundle.packageId,
      sectionShell.scaffold,
    );
    if (!byPath.has(shellPath)) {
      const shell = await readPackageComponentScaffold(
        params.bundle.packageDirectory,
        params.bundle.packageId,
        sectionShell,
      );
      if (shell) {
        byPath.set(shell.path, {
          path: shell.path,
          content: shell.content,
          language: "tsx",
        });
      }
    }
  }

  byPath.set("app/page.tsx", {
    path: "app/page.tsx",
    content: composeRegionGridPage({
      bundle,
      flowKey: params.flowKey ?? "home",
      brandName: params.brandName,
      pageTitle: params.pageTitle,
      pageDescription: params.pageDescription,
      heroHeadline: params.heroHeadline,
      heroSubheadline: params.heroSubheadline,
      heroEyebrow: params.heroEyebrow,
      primaryCta: params.primaryCta,
      secondaryCta: params.secondaryCta,
      content: params.content,
      language: params.language,
      websiteBlueprint: blueprint ?? undefined,
      blueprintRegionPlan: blueprint
        ? resolveBlueprintRegionPlan(blueprint, bundle)
        : undefined,
    }),
    language: "tsx",
  });

  let files = Array.from(byPath.values());
  files = applyV2DesignTokensToGlobals(files, bundle);

  if (blueprint) {
    const blueprintCss = buildBlueprintDesignCss(blueprint);
    const globalsIdx = files.findIndex((f) => f.path === "app/globals.css");
    if (globalsIdx >= 0) {
      const existing = files[globalsIdx]!;
      if (!existing.content.includes("V2 Website Blueprint")) {
        files[globalsIdx] = {
          ...existing,
          content: `${existing.content}\n${blueprintCss}\n`,
        };
      }
    }
  }

  return files;
}
