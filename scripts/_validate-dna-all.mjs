import fs from "node:fs";
import { transformSync } from "esbuild";

const s = fs.readFileSync("lib/website/template-v2/tokens/dna-layers-all.ts", "utf8");
const ticks = (s.match(/`/g) || []).length;
console.log({ ticks, even: ticks % 2 === 0, len: s.length });
try {
  transformSync(s, { loader: "ts", format: "esm" });
  console.log("esbuild ok");
} catch (e) {
  console.error("esbuild fail", String(e).slice(0, 800));
}
