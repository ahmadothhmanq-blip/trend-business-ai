import { buildVisualDocument } from "../lib/ai-core/visual-editor/document";
import {
  isTemplateToken,
  parseComponentInvocation,
  resolveVisualNodeText,
} from "../lib/ai-core/visual-editor/hydrate-node-text";
import type { GeneratedWebsiteProject } from "../plugins/website/types";

const pageTsx = `import { ThemeCreativeHero } from "@/components/sections/ThemeCreativeHero";

export default function HomePage() {
  return (
    <main>
      <ThemeCreativeHero
        title="Modern Business Agency — creative work that grows brands"
        subtitle="The premier digital agency for luxury brands"
        primaryCta="Request a consultation"
        secondaryCta="Learn more"
      />
    </main>
  );
}
`;

const heroSource = `export function ThemeCreativeHero({ title = "Default", subtitle }: { title?: string }) {
  return <section><h1>{title}</h1><p>{subtitle}</p></section>;
}`;

const heroText = resolveVisualNodeText({
  exportName: "ThemeCreativeHero",
  kind: "hero",
  componentSource: heroSource,
  pageSource: pageTsx,
});

console.log("heroText", heroText);
console.log("isToken", isTemplateToken("{title}"));
console.assert(
  heroText === "Modern Business Agency — creative work that grows brands",
  "hero should hydrate from page.tsx props",
);
console.assert(!isTemplateToken(heroText ?? ""), "hydrated text must not be a token");

const props = parseComponentInvocation(pageTsx, "ThemeCreativeHero");
console.assert(
  props.title?.includes("Modern Business Agency"),
  "parseComponentInvocation",
);

const doc = buildVisualDocument({
  generationId: "test",
  files: [
    { path: "app/page.tsx", content: pageTsx, language: "tsx" },
    {
      path: "components/sections/ThemeCreativeHero.tsx",
      content: heroSource,
      language: "tsx",
    },
  ],
  project: {
    title: "Modern Business Agency - MVP Blueprint",
    description: "Agency site",
    files: [],
    pages: [],
    sections: [],
    colorPalette: [],
    typography: [],
    components: [],
    content: ["Modern Business Agency — creative work that grows brands"],
    seo: [],
    roadmap: [],
    projectKind: "website",
  } as GeneratedWebsiteProject,
});

const heroNode = doc.nodes.find((n) => n.kind === "hero");
console.log("heroNode.text", heroNode?.text);
console.assert(
  heroNode?.text && !isTemplateToken(heroNode.text),
  "buildVisualDocument must not expose template tokens",
);

console.log("verify-visual-editor-hydration: OK");
