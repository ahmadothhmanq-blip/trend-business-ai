import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "../../lib/design-platform/components");
const cats = readdirSync(root).filter(
  (d) => statSync(join(root, d)).isDirectory() && d !== "core",
);

for (const cat of cats) {
  const comps = readdirSync(join(root, cat)).filter((d) =>
    statSync(join(root, cat, d)).isDirectory(),
  );
  const exports = comps.map((c) => `export * from "./${c}";`).join("\n");
  writeFileSync(join(root, cat, "index.ts"), `${exports}\n`);
}

const main = [
  'export * from "./core";',
  'export * from "./catalog";',
  ...cats.map((c) => `export * from "./${c}";`),
].join("\n");
writeFileSync(join(root, "index.ts"), `${main}\n`);
console.log(`Generated indexes for ${cats.length} categories`);
