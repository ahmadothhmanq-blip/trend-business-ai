import { applyStructureTemplateToProject } from "../../lib/website/builder/apply-structure-template.ts";
import { runVisualDesignQuality } from "../../lib/ai-core/visual-design-quality/analyze.ts";
import type { GeneratedWebsiteProject } from "../../plugins/website/types.ts";

const baseProject = {
  projectKind: "website",
  title: "Preview",
  description: "Flagship preview",
  pages: ["home"],
  sections: [],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: [],
  roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
  ],
  settings: {},
} satisfies GeneratedWebsiteProject;

for (const id of ["restaurant-premium", "corporate-business", "saas-enterprise"] as const) {
  const applied = await applyStructureTemplateToProject({
    project: { ...baseProject, title: id },
    templatePackageId: id,
    language: "English",
  });
  const report = runVisualDesignQuality({
    files: applied.project.files.map((f) => ({ path: f.path, content: f.content })),
    brandName: id,
  });
  console.log("\n===", id, "===");
  console.log(report.scores);
  console.log(report.issues.map((i) => `${i.severity} ${i.dimension}: ${i.message}`).join("\n"));
}
