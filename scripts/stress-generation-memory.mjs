import { applyStructureTemplateToProject } from "../lib/website/builder/apply-structure-template.ts";
import { renderV2PageMarkup } from "../lib/website/template-v2/preview/v2-preview-compiler.ts";

const base = {
  projectKind: "website",
  title: "T",
  description: "clothing",
  pages: ["home"],
  sections: [],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: [],
  roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function P(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: ":root{}", language: "css" },
  ],
};

function heapMb() {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
}

const start = heapMb();
for (let i = 0; i < 5; i++) {
  const applied = await applyStructureTemplateToProject({
    project: base,
    templatePackageId: "corporate-business",
    language: "English",
  });
  const files = applied.project.files.map((f) => ({ path: f.path, content: f.content }));
  renderV2PageMarkup(files, `https://example.com/hero-${i}.jpg`);
}
console.log(JSON.stringify({ generations: 5, heapStartMb: start, heapEndMb: heapMb(), deltaMb: heapMb() - start }));
