/**
 * Map TBGE orchestrator output → Website Builder project shape.
 */

import type { SiteComposition } from "@/lib/tbge/composer/types";
import type { TbgeArtifactFile } from "@/lib/tbge/kernel/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import type { GeneratedWebsiteProject } from "@/lib/website/types";
import { mergeIntegrationSettings } from "@/lib/ai-core/generation-engine/integration";

export function mapTbgeFilesToWebsiteFiles(
  files: TbgeArtifactFile[],
): GeneratedWebsiteProject["files"] {
  return files.map((file) => ({
    path: file.path,
    content: file.content,
    language: file.language ?? inferLanguage(file.path),
  }));
}

function inferLanguage(path: string): string {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts")) return "ts";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  return "text";
}

export function mapTbgeSpecToWebsiteProject(input: {
  spec: GenerationSpec;
  files: TbgeArtifactFile[];
  composition?: SiteComposition;
  prompt?: string;
  settingsPatch?: Record<string, string>;
}): GeneratedWebsiteProject {
  const { spec, files, composition, prompt, settingsPatch } = input;
  const pages = spec.structure.pages.map((page) => page.name);
  const sections = spec.structure.pages.flatMap((page) => page.sections);
  const palette = [
    spec.design.tokens.primary,
    spec.design.tokens.secondary,
    spec.design.tokens.accent,
    spec.design.tokens.background,
    spec.design.tokens.foreground,
  ];

  return {
    projectKind: spec.productId === "website-builder" ? "website" : "web_application",
    title: spec.business.name,
    description: spec.business.offer,
    prompt,
    generatedAt: spec.provenance.lockedAt,
    pages,
    sections,
    colorPalette: palette,
    typography: [
      spec.design.headingFont ?? "Inter",
      spec.design.bodyFont ?? "Inter",
    ],
    components: spec.design.componentPalette,
    content: composition
      ? composition.pages.flatMap((page) =>
          page.sections.map((section) => String(section.props.headline ?? section.label)),
        )
      : sections,
    seo: pages,
    roadmap: spec.business.goals,
    files: mapTbgeFilesToWebsiteFiles(files),
    settings: mergeIntegrationSettings(
      {
        framework: "next",
        styling: "tailwind",
        requiresAuth: String(spec.capabilities.auth),
        requiresDatabase: String(spec.capabilities.database.provider !== "none"),
        requiresDashboard: String(spec.capabilities.dashboard),
        isEcommerce: String(spec.capabilities.ecommerce),
        isSaas: String(spec.capabilities.saas),
        databaseProvider: spec.capabilities.database.provider,
      },
      settingsPatch ?? {},
    ) as GeneratedWebsiteProject["settings"],
  };
}
