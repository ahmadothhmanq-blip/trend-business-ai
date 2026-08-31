/**
 * Converts scripts/_skin-css/<name>.css → lib/website/template-v2/tokens/dna-layers/<name>.ts
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "scripts", "_skin-css");
const OUT = path.join(ROOT, "lib", "website", "template-v2", "tokens", "dna-layers");

const MAP = [
  { file: "heritage.css", exportName: "buildHeritageDnaCss", out: "heritage.ts" },
  { file: "atelier.css", exportName: "buildAtelierDnaCss", out: "atelier.ts" },
  { file: "nexus.css", exportName: "buildNexusDnaCss", out: "nexus.ts" },
  { file: "kinetic.css", exportName: "buildKineticDnaCss", out: "kinetic.ts" },
  { file: "estates.css", exportName: "buildEstatesDnaCss", out: "estates.ts" },
  { file: "forest.css", exportName: "buildForestDnaCss", out: "forest.ts" },
  { file: "prism.css", exportName: "buildPrismDnaCss", out: "prism.ts" },
  { file: "obsidian.css", exportName: "buildObsidianDnaCss", out: "obsidian.ts" },
  { file: "pulse.css", exportName: "buildPulseDnaCss", out: "pulse.ts" },
  { file: "forge.css", exportName: "buildForgeDnaCss", out: "forge.ts" },
  { file: "citadel.css", exportName: "buildCitadelDnaCss", out: "citadel.ts" },
  { file: "lumina.css", exportName: "buildLuminaDnaCss", out: "lumina.ts" },
];

fs.mkdirSync(OUT, { recursive: true });

let ok = 0;
let missing = 0;
for (const item of MAP) {
  const cssPath = path.join(SRC, item.file);
  if (!fs.existsSync(cssPath)) {
    console.warn("missing", item.file);
    const stub = `/** DNA CSS stub — awaiting redesign */\nexport function ${item.exportName}(): string {\n  return \`/* ${item.file} pending */\`;\n}\n`;
    fs.writeFileSync(path.join(OUT, item.out), stub);
    missing++;
    continue;
  }
  const css = fs.readFileSync(cssPath, "utf8");
  const escaped = css.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${");
  const body = `/** Auto-generated from scripts/_skin-css/${item.file} — do not hand-edit */\nexport function ${item.exportName}(): string {\n  return \`${escaped}\`;\n}\n`;
  fs.writeFileSync(path.join(OUT, item.out), body);
  ok++;
  console.log("wrote", item.out, css.length);
}
console.log(JSON.stringify({ ok, missing }));
