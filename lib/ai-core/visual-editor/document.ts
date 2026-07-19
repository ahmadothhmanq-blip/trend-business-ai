/**
 * Build VisualDocument from Website Understanding + project files.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import { understandWebsite } from "@/lib/ai-core/website-editor/understand";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type {
  VisualDesignTokens,
  VisualDocument,
  VisualNode,
  VisualNodeKind,
} from "@/lib/ai-core/visual-editor/types";

function kindFromHint(hint: string): VisualNodeKind {
  if (hint === "hero") return "hero";
  if (hint === "header") return "header";
  if (hint === "footer") return "footer";
  if (hint === "cta") return "cta";
  if (hint === "brand-trust" || hint.includes("testimonial")) return "proof";
  if (hint.includes("gallery") || hint.includes("video")) return "media";
  if (hint === "section" || hint.includes("service") || hint.includes("feature")) {
    return "section";
  }
  return "other";
}

function extractHeading(content: string): string | undefined {
  const h1 = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1?.[1]) return h1[1].replace(/<[^>]+>/g, "").trim().slice(0, 120);
  const h2 = content.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2?.[1]) return h2[1].replace(/<[^>]+>/g, "").trim().slice(0, 120);
  return undefined;
}

function defaultTokens(): VisualDesignTokens {
  return {
    primary: "#d4af37",
    secondary: "#1a1a1a",
    accent: "#c6a75e",
    background: "#0a0a0a",
    foreground: "#f5f5f5",
    headingFont: "Playfair Display",
    bodyFont: "Source Sans 3",
    sectionY: "6rem",
  };
}

/**
 * Create a visual editor document from a generated website project.
 */
export function buildVisualDocument(params: {
  generationId: string;
  files: GeneratedProjectFile[];
  project?: GeneratedWebsiteProject | null;
}): VisualDocument {
  const understanding = understandWebsite({
    files: params.files,
    project: params.project,
  });

  const byName = new Map(
    understanding.sections.map((s) => [s.exportName, s]),
  );
  const fileByPath = new Map(
    params.files.map((f) => [f.path.replace(/\\/g, "/"), f]),
  );

  const nodes: VisualNode[] = understanding.homeComponentOrder.map((name, index) => {
    const section = byName.get(name);
    const path = section?.path || `components/sections/${name}.tsx`;
    const file = fileByPath.get(path.replace(/\\/g, "/"));
    const kind = kindFromHint(section?.kindHint || name);
    return {
      id: `node-${index}-${name}`,
      exportName: name,
      path,
      kind,
      label: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
      text: file ? extractHeading(file.content) : undefined,
      locked: kind === "header" || kind === "footer",
    };
  });

  const t = understanding.designTokens;
  const tokens: VisualDesignTokens = {
    ...defaultTokens(),
    primary: t.primary || defaultTokens().primary,
    secondary: t.secondary || defaultTokens().secondary,
    accent: t.accent || defaultTokens().accent,
    background: t.background || defaultTokens().background,
    foreground: t.foreground || defaultTokens().foreground,
    headingFont: (t.headingFont || defaultTokens().headingFont).replace(/["']/g, ""),
    bodyFont: (t.bodyFont || defaultTokens().bodyFont).replace(/["']/g, ""),
    sectionY: t.sectionY || defaultTokens().sectionY,
  };

  return {
    version: 1,
    generationId: params.generationId,
    brandName: understanding.brandName,
    nodes,
    tokens,
    selectedNodeId: nodes.find((n) => n.kind === "hero")?.id || nodes[0]?.id || null,
    viewport: "desktop",
    extensions: {
      "component-marketplace": { ready: true },
      templates: { ready: false },
      "ab-testing": { ready: false },
      analytics: { ready: false },
      "ai-commands": { ready: true },
    },
    dirty: false,
    updatedAt: new Date().toISOString(),
  };
}
