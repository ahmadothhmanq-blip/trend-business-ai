import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(
  join(root, "lib/ai-core/design-system/premium/styles.ts"),
  "utf8",
);
const build = readFileSync(
  join(root, "lib/ai-core/design-system/premium/build.ts"),
  "utf8",
);
const css = readFileSync(
  join(root, "lib/ai-core/design-system/premium/css.ts"),
  "utf8",
);
const adapter = readFileSync(
  join(root, "lib/ai-core/adapters/website-builder.ts"),
  "utf8",
);
const engine = readFileSync(
  join(root, "plugins/website/layers/design-engine.ts"),
  "utf8",
);

let ok = true;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    ok = false;
  }
}

for (const id of [
  "luxury",
  "modern",
  "minimal",
  "corporate",
  "futuristic",
  "creative",
]) {
  assert(styles.includes(`${id}:`), `style ${id}`);
}

assert(styles.includes("gradients:"), "gradients");
assert(styles.includes("glass:"), "glass");
assert(styles.includes("animation:"), "animation");
assert(styles.includes("responsive:"), "responsive");
assert(styles.includes("heroStyle:"), "layout intelligence");
assert(styles.includes("navigationStyle:"), "nav style");
assert(styles.includes("footerStyle:"), "footer style");
assert(styles.includes("cardStyle:"), "card style");

assert(build.includes("buildPremiumDesignSystem"), "build export");
assert(build.includes("applyPremiumDesignToCore"), "apply export");
assert(build.includes('return "futuristic"'), "futuristic normalize");

assert(css.includes("--gradient-hero"), "css gradients");
assert(css.includes("--glass-blur"), "css glass");
assert(css.includes("--shadow-glow"), "css shadows");
assert(css.includes("premium-glass"), "utility class");

assert(adapter.includes("buildPremiumDesignSystem"), "adapter wired");
assert(adapter.includes("Building premium design system"), "progress emit");
assert(engine.includes("premiumDesignCssVariables"), "css vars wired");

if (!ok) process.exit(1);
console.log("PASS premium design system smoke");
