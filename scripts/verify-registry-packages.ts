import { validateWbTemplatePackage } from "../lib/website/template-engine/index.server";

const FLAGSHIPS = [
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
];

async function main() {
  for (const id of FLAGSHIPS) {
    const result = await validateWbTemplatePackage(`templates/website-registry/${id}`);
    console.log(id, result.valid, result.issues?.length ?? 0);
    if (!result.valid) {
      console.log(result.issues.slice(0, 5));
    }
  }
}

main().catch(console.error);
