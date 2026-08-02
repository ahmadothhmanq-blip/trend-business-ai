import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";

export const layoutRootGenerator: GeneratorPlugin = {
  id: "layout-root",
  label: "Root layout",
  generate({ spec, node }) {
    const lang = spec.locale.htmlLang ?? "en";
    const dir = spec.locale.dir ?? (spec.locale.rtl ? "rtl" : "ltr");
    const content = [
      `export const metadata = {`,
      `  title: ${JSON.stringify(spec.business.name)},`,
      `  description: ${JSON.stringify(spec.business.offer)},`,
      `};`,
      "",
      "export default function RootLayout({ children }: { children: React.ReactNode }) {",
      "  return (",
      `    <html lang="${lang}" dir="${dir}">`,
      "      <body>{children}</body>",
      "    </html>",
      "  );",
      "}",
      "",
    ].join("\n");
    return { path: node.path, content, language: "tsx" };
  },
};
