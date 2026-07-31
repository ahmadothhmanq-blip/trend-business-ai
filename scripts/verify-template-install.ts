import { installRemoteTemplatePackage } from "../lib/website/template-marketplace/install.server";

async function main() {
  const id = process.argv[2] || "saas-starter";
  const result = await installRemoteTemplatePackage(id);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
