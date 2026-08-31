/**
 * Verify AI Real Images provider configuration (local .env).
 * Usage: node scripts/check-image-provider.mjs
 */

import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const preferred = process.env.IMAGE_PROVIDER?.trim().toLowerCase();

const providers = [
  {
    id: "openai",
    label: "OpenAI DALL·E 3",
    configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    env: "OPENAI_API_KEY",
  },
  {
    id: "replicate",
    label: "Replicate Flux",
    configured: Boolean(process.env.REPLICATE_API_TOKEN?.trim()),
    env: "REPLICATE_API_TOKEN",
  },
  {
    id: "stability",
    label: "Stability AI",
    configured: Boolean(process.env.STABILITY_API_KEY?.trim()),
    env: "STABILITY_API_KEY",
  },
];

const configured = providers.filter((p) => p.configured);
const ultra = process.env.WB_ULTRA_FAST_GENERATION === "1";

console.log("AI Real Images — provider check\n");
console.log(`Preferred (IMAGE_PROVIDER): ${preferred || "(auto — first configured)"}`);
console.log(`WB_ULTRA_FAST_GENERATION: ${ultra ? "ON (fewer/standard-quality images)" : "off"}\n`);

for (const p of providers) {
  const mark = p.configured ? "✓" : "✗";
  const star = preferred === p.id ? " ← preferred" : "";
  console.log(`${mark} ${p.label} (${p.env})${star}`);
}

console.log("");

if (!configured.length) {
  console.log("No image provider configured.");
  console.log("Add OPENAI_API_KEY (or REPLICATE/STABILITY) to .env.local, then restart dev server.");
  process.exit(1);
}

console.log(`Active: ${configured.map((p) => p.label).join(", ")}`);
console.log("Restart dev server after changing keys: npm run dev:stop && npm run dev");
process.exit(0);
