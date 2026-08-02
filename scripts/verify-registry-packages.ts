import { validateWbTemplatePackage } from "../lib/website/template-engine/index.server";

async function main() {
  const ids = ["modern-business", "ai-startup-signal"];
  for (const id of ids) {
    const result = await validateWbTemplatePackage(
      `templates/website-registry/${id}`,
    );
    console.log(id, result.valid, result.issues?.length ?? 0);
    if (!result.valid) {
      console.log(result.issues.slice(0, 5));
    }
  }
}

main().catch(console.error);
